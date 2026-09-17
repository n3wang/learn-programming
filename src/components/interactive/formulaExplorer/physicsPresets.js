import {clamp, fmt} from './probMath';

function roundPlaces(x, places) {
  const d = Math.max(0, Math.floor(places));
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

function keepSigDigits(x, sig) {
  if (x === 0) {
    return 0;
  }
  const n = Math.max(1, Math.floor(sig));
  const sign = Math.sign(x);
  const ax = Math.abs(x);
  const exp = Math.floor(Math.log10(ax));
  const scale = 10 ** (n - 1 - exp);
  return (sign * Math.round(ax * scale)) / scale;
}

function taylorSin(x, terms) {
  const N = Math.max(1, Math.floor(terms));
  let term = x;
  let sum = 0;
  for (let n = 1; n <= N; n += 1) {
    sum += term;
    term *= (-x * x) / (2 * n * (2 * n + 1));
  }
  return sum;
}

function logAbs(err) {
  return Math.log10(Math.abs(err) + 1e-16);
}

/** Table 6.1: neutron resonant-scattering cross section (Landau §6.5). */
const CS_E = [0, 25, 50, 75, 100, 125, 150, 175, 200];
const CS_G = [10.6, 16.0, 45.0, 83.5, 52.8, 19.9, 10.8, 8.25, 4.7];

function lagrangeEval(xs, ys, x) {
  const n = xs.length;
  let total = 0;
  for (let i = 0; i < n; i += 1) {
    let term = ys[i];
    for (let j = 0; j < n; j += 1) {
      if (j === i) continue;
      term *= (x - xs[j]) / (xs[i] - xs[j]);
    }
    total += term;
  }
  return total;
}

function solveTridiagGeneral(A, b) {
  const n = b.length;
  const M = A.map((row) => row.slice());
  const rhs = b.slice();
  for (let i = 0; i < n; i += 1) {
    const piv = M[i][i];
    for (let j = i + 1; j < n; j += 1) {
      const f = M[j][i] / piv;
      for (let k = 0; k < n; k += 1) M[j][k] -= f * M[i][k];
      rhs[j] -= f * rhs[i];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i -= 1) {
    let s = rhs[i];
    for (let k = i + 1; k < n; k += 1) s -= M[i][k] * x[k];
    x[i] = s / M[i][i];
  }
  return x;
}

/** Natural cubic spline: returns second derivatives M_i for nodes (xs, ys). */
function naturalSplineM(xs, ys) {
  const n = xs.length;
  const h = [];
  for (let i = 0; i < n - 1; i += 1) h.push(xs[i + 1] - xs[i]);
  const A = Array.from({length: n}, () => new Array(n).fill(0));
  const b = new Array(n).fill(0);
  A[0][0] = 1;
  A[n - 1][n - 1] = 1;
  for (let i = 1; i < n - 1; i += 1) {
    A[i][i - 1] = h[i - 1];
    A[i][i] = 2 * (h[i - 1] + h[i]);
    A[i][i + 1] = h[i];
    b[i] = 6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1]);
  }
  return solveTridiagGeneral(A, b);
}

function splineEval(xs, ys, M, x) {
  const n = xs.length;
  let i = 0;
  for (; i < n - 2; i += 1) {
    if (x <= xs[i + 1]) break;
  }
  const h = xs[i + 1] - xs[i];
  const A = (xs[i + 1] - x) / h;
  const B = (x - xs[i]) / h;
  return A * ys[i] + B * ys[i + 1] + ((A ** 3 - A) * M[i] + (B ** 3 - B) * M[i + 1]) * (h * h) / 6;
}

function linregEqualWeights(xs, ys) {
  const n = xs.length;
  const xbar = xs.reduce((a, v) => a + v, 0) / n;
  const ybar = ys.reduce((a, v) => a + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i += 1) {
    sxy += (xs[i] - xbar) * (ys[i] - ybar);
    sxx += (xs[i] - xbar) ** 2;
  }
  const a2 = sxy / sxx;
  const a1 = ybar - a2 * xbar;
  return {a1, a2};
}

/** Deterministic pseudo-noise in [-1,1] from the chapter LCG, seeded per index. */
function lcgNoise(seed, i) {
  let r = BigInt((seed * 7919 + i * 104729) | 0);
  const M = 2147483648n;
  r = (1103515245n * (r < 0n ? -r : r) + 12345n) % M;
  return (Number(r) / 2147483648) * 2 - 1;
}

/** Computational-physics charts: truncation, round-off, stored mantissa. */
export const PHYSICS_PRESETS = {
  lagrangeGlobalFit: {
    id: 'lagrangeGlobalFit',
    title: 'Lagrange fit: local vs. global (Table 6.1)',
    subtitle: 'More nodes ⇒ higher degree ⇒ bigger swings between the tabulated points',
    formula:
      '$g(x)\\simeq\\sum_{i=1}^{n} g_i\\lambda_i(x),\\quad \\lambda_i(x)=\\prod_{j\\ne i}\\dfrac{x-x_j}{x_i-x_j}$',
    params: [
      {
        key: 'n',
        label: 'n (points used)',
        meaning: 'Leading n points of Table 6.1, fit with one degree-(n-1) Lagrange polynomial.',
        min: 3,
        max: 9,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      const n = Math.round(clamp(v.n, 3, 9));
      return `Fitting the first ${n} points with a degree-${n - 1} polynomial. Watch the curve overshoot grow as n increases.`;
    },
    compute(v) {
      const n = Math.round(clamp(v.n, 3, 9));
      const xs = CS_E.slice(0, n);
      const ys = CS_G.slice(0, n);
      const lo = xs[0];
      const hi = xs[xs.length - 1];
      const pad = 0.15 * (hi - lo || 1);
      const series = [];
      const steps = 80;
      let maxAbs = 0;
      for (let k = 0; k <= steps; k += 1) {
        const x = lo - pad + (((hi + pad) - (lo - pad)) * k) / steps;
        const y = lagrangeEval(xs, ys, x);
        maxAbs = Math.max(maxAbs, Math.abs(y));
        series.push({x, y, highlight: false});
      }
      for (let i = 0; i < n; i += 1) {
        series.push({x: xs[i], y: ys[i], highlight: true});
      }
      return {
        chartType: 'scatter',
        yLabel: 'cross section g(E) [mb]',
        series,
        stats: [
          {label: 'degree', value: String(n - 1)},
          {label: 'peak |g|', value: fmt(maxAbs, 2)},
          {label: 'max data |g|', value: fmt(Math.max(...ys.map(Math.abs)), 2)},
        ],
        note: 'Orange = the n tabulated points actually used. Blue = the fitted polynomial, sampled slightly beyond the fitted interval (a mild extrapolation). At n=9 the curve swings far above any tabulated value — the Runge-type blowup the lesson warns about.',
      };
    },
  },

  cubicSplineFit: {
    id: 'cubicSplineFit',
    title: 'Natural cubic spline (Table 6.1)',
    subtitle: 'Same points as the Lagrange fit — but splines never overshoot like that',
    formula:
      '$g_i(x)=g_i+g_i\'(x-x_i)+\\tfrac12 g_i\'\'(x-x_i)^2+\\tfrac16 g_i\'\'\'(x-x_i)^3$',
    params: [
      {
        key: 'n',
        label: 'n (points used)',
        meaning: 'Leading n points of Table 6.1, spline-fit with a natural boundary condition.',
        min: 3,
        max: 9,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      const n = Math.round(clamp(v.n, 3, 9));
      return `Spline through the first ${n} points. Compare the peak value to the Lagrange fit at the same n.`;
    },
    compute(v) {
      const n = Math.round(clamp(v.n, 3, 9));
      const xs = CS_E.slice(0, n);
      const ys = CS_G.slice(0, n);
      const M = naturalSplineM(xs, ys);
      const lo = xs[0];
      const hi = xs[xs.length - 1];
      const series = [];
      const steps = 80;
      let maxAbs = 0;
      for (let k = 0; k <= steps; k += 1) {
        const x = lo + ((hi - lo) * k) / steps;
        const y = splineEval(xs, ys, M, Math.min(x, hi - 1e-9));
        maxAbs = Math.max(maxAbs, Math.abs(y));
        series.push({x, y, highlight: false});
      }
      for (let i = 0; i < n; i += 1) {
        series.push({x: xs[i], y: ys[i], highlight: true});
      }
      return {
        chartType: 'scatter',
        yLabel: 'cross section g(E) [mb]',
        series,
        stats: [
          {label: 'n', value: String(n)},
          {label: 'peak |g|', value: fmt(maxAbs, 2)},
          {label: 'max data |g|', value: fmt(Math.max(...ys.map(Math.abs)), 2)},
        ],
        note: 'The spline (blue) stays close to the data envelope for every n — unlike the Lagrange polynomial, which overshoots badly once n gets large.',
      };
    },
  },

  decayLogFit: {
    id: 'decayLogFit',
    title: 'Decay lifetime via log-linear fit',
    subtitle: 'ln N(t) = ln N0 − t/τ — linear regression recovers τ from noisy counts',
    formula: '$\\ln N(t)=\\ln N_0-\\dfrac{t}{\\tau}$',
    params: [
      {
        key: 'tau',
        label: 'τ (true lifetime)',
        meaning: 'The lifetime used to generate the synthetic decay data.',
        min: 5,
        max: 50,
        step: 1,
        default: 25,
      },
      {
        key: 'noise',
        label: 'noise level',
        meaning: 'Relative scatter added to each simulated count before fitting.',
        min: 0,
        max: 0.3,
        step: 0.01,
        default: 0.06,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'Different noise realization.',
        min: 1,
        max: 20,
        step: 1,
        default: 3,
      },
    ],
    example(v) {
      const tau = clamp(v.tau, 5, 50);
      return `True τ=${fmt(tau, 1)}. Fit ln N vs t by least squares and compare the recovered τ to the true value.`;
    },
    compute(v) {
      const tau = clamp(v.tau, 5, 50);
      const noise = clamp(v.noise, 0, 0.3);
      const seed = Math.round(clamp(v.seed, 1, 20));
      const N0 = 1000;
      const ts = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
      const logs = ts.map((t, i) => {
        const clean = N0 * Math.exp(-t / tau);
        const noisy = clean * (1 + noise * lcgNoise(seed, i));
        return Math.log(Math.max(noisy, 1e-6));
      });
      const {a1, a2} = linregEqualWeights(ts, logs);
      const tauFit = -1 / a2;
      const series = ts.map((t, i) => ({x: t, y: logs[i], highlight: true}));
      for (let k = 0; k <= 40; k += 1) {
        const t = (90 * k) / 40;
        series.push({x: t, y: a1 + a2 * t, highlight: false});
      }
      return {
        chartType: 'scatter',
        yLabel: 'ln N(t)',
        series,
        stats: [
          {label: 'true τ', value: fmt(tau, 2)},
          {label: 'fitted τ', value: fmt(tauFit, 2)},
          {label: 'fitted N0', value: fmt(Math.exp(a1), 1)},
        ],
        note: 'Orange = simulated noisy ln N(t) counts. Blue = the least-squares line, slope −1/τ. More noise widens the gap between fitted and true τ.',
      };
    },
  },

  breitWignerFit: {
    id: 'breitWignerFit',
    title: 'Fit-by-eye: Breit-Wigner resonance (Table 6.1)',
    subtitle: 'Slide the three parameters until the curve matches the data — watch chi-square',
    formula: '$g(E)=\\dfrac{f_r}{(E-E_r)^2+\\Gamma^2/4}$',
    params: [
      {
        key: 'fr',
        label: 'f_r (peak scale)',
        meaning: 'Scale parameter a1 — roughly the peak height times the width-squared term.',
        min: 100,
        max: 200000,
        step: 100,
        default: 60000,
      },
      {
        key: 'Er',
        label: 'E_r (resonance energy)',
        meaning: 'Location of the peak, a2.',
        min: 0,
        max: 200,
        step: 1,
        default: 78,
      },
      {
        key: 'Gamma',
        label: 'Γ (width)',
        meaning: 'Full width at half maximum; a3 = Γ²/4 in the fit equations.',
        min: 10,
        max: 120,
        step: 1,
        default: 55,
      },
    ],
    example(v) {
      return `Adjust f_r, E_r, and Γ to minimize chi-square against the 9 tabulated cross sections.`;
    },
    compute(v) {
      const fr = clamp(v.fr, 100, 200000);
      const Er = clamp(v.Er, 0, 200);
      const Gamma = clamp(v.Gamma, 10, 120);
      const a3 = (Gamma * Gamma) / 4;
      const g = (x) => fr / ((x - Er) ** 2 + a3);
      const series = [];
      for (let k = 0; k <= 80; k += 1) {
        const x = (200 * k) / 80;
        series.push({x, y: g(x), highlight: false});
      }
      let chi2 = 0;
      for (let i = 0; i < CS_E.length; i += 1) {
        const resid = CS_G[i] - g(CS_E[i]);
        chi2 += resid * resid;
        series.push({x: CS_E[i], y: CS_G[i], highlight: true});
      }
      const dof = CS_E.length - 3;
      return {
        chartType: 'scatter',
        yLabel: 'cross section g(E) [mb]',
        series,
        stats: [
          {label: 'chi²', value: fmt(chi2, 2)},
          {label: 'dof (N_D-M_P)', value: String(dof)},
          {label: 'chi²/dof', value: fmt(chi2 / dof, 2)},
        ],
        note: 'Orange = Table 6.1 data. Blue = the Breit-Wigner theory curve at your chosen (f_r, E_r, Γ). chi²/dof near 1 is a good fit.',
      };
    },
  },

  linearSystem2D: {
    id: 'linearSystem2D',
    title: 'Solving Ax=b: two lines meeting at x',
    subtitle: 'numpy.linalg.solve finds exactly where these two lines cross',
    formula: '$a_{11}x+a_{12}y=b_1,\\qquad a_{21}x+a_{22}y=b_2$',
    params: [
      {
        key: 'a11',
        label: 'a11',
        meaning: 'Coefficient of x in equation 1.',
        min: -5,
        max: 5,
        step: 0.5,
        default: 2,
      },
      {
        key: 'a12',
        label: 'a12',
        meaning: 'Coefficient of y in equation 1.',
        min: -5,
        max: 5,
        step: 0.5,
        default: 1,
      },
      {
        key: 'a21',
        label: 'a21',
        meaning: 'Coefficient of x in equation 2.',
        min: -5,
        max: 5,
        step: 0.5,
        default: 1,
      },
      {
        key: 'a22',
        label: 'a22',
        meaning: 'Coefficient of y in equation 2.',
        min: -5,
        max: 5,
        step: 0.5,
        default: -3,
      },
    ],
    example(v) {
      return `A near-singular matrix (rows nearly parallel) makes the intersection point swing wildly — that is ill-conditioning.`;
    },
    compute(v) {
      const a11 = clamp(v.a11, -5, 5) || 1e-6;
      const a12 = clamp(v.a12, -5, 5);
      const a21 = clamp(v.a21, -5, 5);
      const a22 = clamp(v.a22, -5, 5) || 1e-6;
      const b1 = 4;
      const b2 = 1;
      const det = a11 * a22 - a12 * a21;
      const safeDet = Math.abs(det) < 1e-6 ? (det < 0 ? -1e-6 : 1e-6) : det;
      const xSol = (b1 * a22 - a12 * b2) / safeDet;
      const ySol = (a11 * b2 - b1 * a21) / safeDet;
      const series = [];
      const range = 6;
      for (let k = 0; k <= 40; k += 1) {
        const x = -range + (2 * range * k) / 40;
        if (Math.abs(a12) > 1e-9) series.push({x, y: (b1 - a11 * x) / a12, highlight: false});
        if (Math.abs(a22) > 1e-9) series.push({x, y: (b2 - a21 * x) / a22, highlight: false});
      }
      series.push({x: xSol, y: ySol, highlight: true});
      return {
        chartType: 'scatter',
        yLabel: 'y',
        series,
        stats: [
          {label: 'det(A)', value: fmt(det, 3)},
          {label: 'x', value: fmt(xSol, 3)},
          {label: 'y', value: fmt(ySol, 3)},
        ],
        note: 'Blue = the two equations as lines. Orange = the unique solution (x,y), exactly what solve(A,b) returns. As det(A) → 0 the lines become parallel and the solution point flies off to infinity.',
      };
    },
  },

  sinTaylor: {
    id: 'sinTaylor',
    title: 'Sine series truncation',
    subtitle: 'Partial sum vs true sin(x) — leftover terms are algorithmic error',
    formula:
      '$\\sin x = \\displaystyle\\sum_{n=1}^{N} \\dfrac{(-1)^{n-1} x^{2n-1}}{(2n-1)!} + \\mathcal{E}(x,N)$',
    params: [
      {
        key: 'x',
        label: 'x (radians)',
        meaning: 'Argument of sine. The series needs many more terms than |x| before the leftover is small.',
        min: 0.5,
        max: 14,
        step: 0.1,
        default: 3,
      },
      {
        key: 'N',
        label: 'N (terms kept)',
        meaning: 'How many summands you keep. The ignored tail from n = N+1 to ∞ is E(x, N).',
        min: 1,
        max: 28,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      const x = clamp(v.x, 0.5, 14);
      const N = Math.max(1, Math.floor(v.N));
      const approx = taylorSin(x, N);
      const exact = Math.sin(x);
      const err = exact - approx;
      const ok = N > 1.5 * Math.abs(x);
      return (
        `Keep N=${N} terms at x=${fmt(x, 1)}. Partial sum ${fmt(approx, 6)}, true sin(x)=${fmt(exact, 6)}, ` +
        `so E ≈ ${fmt(err, 6)}. ${ok ? 'N is larger than |x|, so the tail should be shrinking.' : 'N is not much larger than |x| — expect a large leftover.'}`
      );
    },
    compute(v) {
      const x = clamp(v.x, 0.5, 14);
      const N = Math.max(1, Math.floor(v.N));
      const exact = Math.sin(x);
      const series = [];
      for (let n = 1; n <= 28; n += 1) {
        series.push({
          x: n,
          y: logAbs(exact - taylorSin(x, n)),
          highlight: n === N,
        });
      }
      const err = exact - taylorSin(x, N);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E(x, N)|',
        series,
        refLineX: Math.abs(x),
        stats: [
          {label: 'partial sum', value: fmt(taylorSin(x, N), 6)},
          {label: 'sin(x)', value: fmt(exact, 6)},
          {label: '|E|', value: fmt(Math.abs(err), 6)},
          {label: 'N vs |x|', value: N > 1.5 * Math.abs(x) ? 'N ≫ |x|' : 'N ≲ |x|'},
        ],
        note: 'Dashed line marks |x|. A useful truncation sits well to the right of that mark.',
      };
    },
  },

  roundoffRepeat: {
    id: 'roundoffRepeat',
    title: 'Round-off in a cancelled identity',
    subtitle: 'A d-digit machine stores 1/3 and 2/3, then repeats 2·(1/3) − 2/3',
    formula: '$2\\left(\\dfrac{1}{3}\\right) - \\dfrac{2}{3} \\;\\stackrel{?}{=}\\; 0$',
    params: [
      {
        key: 'digits',
        label: 'decimal places kept',
        meaning: 'Toy floating-point: every value is rounded to this many digits after the point before the next operation.',
        min: 2,
        max: 8,
        step: 1,
        default: 4,
      },
      {
        key: 'repeats',
        label: 'times repeated',
        meaning: 'How many times the rounded identity is added into a running total. Small garbage grows with the step count.',
        min: 1,
        max: 2000,
        step: 1,
        default: 200,
      },
    ],
    example(v) {
      const d = Math.max(2, Math.floor(v.digits));
      const k = Math.max(1, Math.floor(v.repeats));
      const a = roundPlaces(1 / 3, d);
      const b = roundPlaces(2 / 3, d);
      const one = roundPlaces(roundPlaces(2 * a, d) - b, d);
      return (
        `With ${d} decimal places, 1/3 → ${a}, 2/3 → ${b}, and one step of 2·(1/3)−2/3 → ${one} (not 0). ` +
        `Add that residual ${k} times → ${fmt(one * k, 6)}.`
      );
    },
    compute(v) {
      const d = Math.max(2, Math.floor(v.digits));
      const k = Math.max(1, Math.floor(v.repeats));
      const a = roundPlaces(1 / 3, d);
      const b = roundPlaces(2 / 3, d);
      const one = roundPlaces(roundPlaces(2 * a, d) - b, d);
      const nPlot = Math.min(48, k);
      const series = [];
      for (let i = 0; i <= nPlot; i += 1) {
        const n = Math.max(1, Math.round((k * i) / nPlot));
        series.push({x: n, y: one * n, highlight: n === k || i === nPlot});
      }
      return {
        chartType: 'line',
        yLabel: 'accumulated residual',
        series,
        stats: [
          {label: 'stored 1/3', value: String(a)},
          {label: 'stored 2/3', value: String(b)},
          {label: 'one step', value: fmt(one, 6)},
          {label: `${k} steps`, value: fmt(one * k, 6)},
        ],
        note: 'Mathematically the combination is 0. With a short mantissa it is a tiny bias; repeating it is how tiny bias becomes the whole answer.',
      };
    },
  },

  floatMantissa: {
    id: 'floatMantissa',
    title: 'Scientific notation on a finite mantissa',
    subtitle: 'Exponent stays exact; extra mantissa digits are dropped',
    formula: '$a = m \\times 10^{e}$',
    params: [
      {
        key: 'digits',
        label: 'mantissa digits kept',
        meaning: 'Significant figures stored for m. IEEE double is about 15–16 decimal digits; a 4-digit toy machine is much coarser.',
        min: 3,
        max: 16,
        step: 1,
        default: 6,
      },
    ],
    example(v) {
      const digits = Math.max(3, Math.floor(v.digits));
      const trueA = 9.876543210987654e16;
      const stored = keepSigDigits(trueA, digits);
      const rel = Math.abs(stored - trueA) / trueA;
      return (
        `True a = ${trueA.toExponential(14)}. With ${digits} significant digits the machine keeps ${stored.toExponential(Math.min(14, digits - 1))}, ` +
        `relative error ${fmt(rel, 6)}.`
      );
    },
    compute(v) {
      const digits = Math.max(3, Math.floor(v.digits));
      const trueA = 9.876543210987654e16;
      const series = [];
      for (let d = 3; d <= 16; d += 1) {
        const stored = keepSigDigits(trueA, d);
        const rel = Math.abs(stored - trueA) / trueA;
        series.push({
          x: d,
          y: logAbs(rel),
          highlight: d === digits,
        });
      }
      const stored = keepSigDigits(trueA, digits);
      const rel = Math.abs(stored - trueA) / trueA;
      const exp = Math.floor(Math.log10(Math.abs(trueA)));
      const mant = stored / 10 ** exp;
      return {
        chartType: 'line',
        yLabel: 'log₁₀ relative error',
        series,
        stats: [
          {label: 'true a', value: trueA.toExponential(4)},
          {label: 'stored m', value: fmt(mant, Math.min(8, digits))},
          {label: 'stored 10ᵉ', value: `10^${exp}`},
          {label: 'rel. error', value: rel === 0 ? '0' : rel.toExponential(2)},
        ],
        note: 'The exponent is a small integer, so it usually survives intact. Precision lives or dies in how many digits of m you keep.',
      };
    },
  },

  subtractCancel: {
    id: 'subtractCancel',
    title: 'Subtractive cancellation',
    subtitle: 'Relative error in a = b − c blows up when b ≈ c',
    formula: '$x_c \\simeq x(1+\\epsilon_x),\\quad \\dfrac{a_c}{a}\\simeq 1+\\dfrac{b}{a}(\\epsilon_b-\\epsilon_c)$',
    params: [
      {
        key: 'gapExp',
        label: 'log₁₀((b−c)/b)',
        meaning: 'How close c is to b, as a fraction of b. More negative → a is a tinier leftover of two large nearly-equal numbers.',
        min: -12,
        max: -0.3,
        step: 0.1,
        default: -4,
      },
      {
        key: 'logEps',
        label: 'log₁₀ ε (input noise)',
        meaning: 'Relative error already sitting in b and c — typically near machine precision, here you can exaggerate it.',
        min: -16,
        max: -4,
        step: 0.5,
        default: -16,
      },
    ],
    example(v) {
      const delta = 10 ** clamp(v.gapExp, -12, -0.3);
      const mag = 1 / delta;
      const eps = 10 ** clamp(v.logEps, -16, -4);
      const ea = mag * eps;
      return (
        `b and c agree to about ${fmt(-v.gapExp, 1)} digits, so |b/a| ≈ ${fmt(mag, 3)}. ` +
        `Input noise ${eps.toExponential(1)} is magnified to relative error ≈ ${ea.toExponential(2)} in the small difference a.`
      );
    },
    compute(v) {
      const eps = 10 ** clamp(v.logEps, -16, -4);
      const gap = clamp(v.gapExp, -12, -0.3);
      const series = [];
      for (let g = -12; g <= -0.3 + 1e-9; g += 0.2) {
        const mag = 1 / 10 ** g;
        series.push({x: g, y: logAbs(mag * eps), highlight: Math.abs(g - gap) < 0.11});
      }
      const mag = 1 / 10 ** gap;
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |ε_a| ≈ log₁₀(|b/a| ε)',
        series,
        stats: [
          {label: '|b/a|', value: mag.toExponential(2)},
          {label: 'input ε', value: eps.toExponential(1)},
          {label: '|ε_a| (worst)', value: (mag * eps).toExponential(2)},
          {label: 'sig figs left', value: String(Math.max(0, Math.floor(-Math.log10(mag * eps + 1e-30))))},
        ],
        note: 'Worst case: the ε’s do not cancel, and b/a multiplies whatever is left. A small difference of two large floats is less significant than either input.',
      };
    },
  },

  expNegSeries: {
    id: 'expNegSeries',
    title: 'Alternating e^{−x} vs 1/e^x',
    subtitle: 'Large alternating terms cancel; the reciprocal of e^x does not',
    formula: '$e^{-x}=\\sum_{k=0}^{N} \\dfrac{(-x)^{k}}{k!}+\\mathcal{E}=\\dfrac{1}{e^{x}}$',
    params: [
      {
        key: 'x',
        label: 'x',
        meaning: 'For large x the raw series 1 − x + x²/2! − ⋯ has huge terms of opposite sign before it settles to a tiny e^{−x}.',
        min: 1,
        max: 20,
        step: 0.5,
        default: 8,
      },
      {
        key: 'N',
        label: 'N (terms, 0…N)',
        meaning: 'Partial sum of the alternating exponential series. Compare with 1/e^x, which never subtracts two giants.',
        min: 1,
        max: 40,
        step: 1,
        default: 12,
      },
    ],
    example(v) {
      const x = clamp(v.x, 1, 20);
      const N = Math.max(1, Math.floor(v.N));
      let term = 1;
      let sum = 0;
      for (let k = 0; k <= N; k += 1) {
        sum += term;
        term *= -x / (k + 1);
      }
      const exact = Math.exp(-x);
      const rec = 1 / Math.exp(x);
      return (
        `x=${fmt(x, 1)}, N=${N}: alternating partial sum ${fmt(sum, 6)}, true e^{−x}=${fmt(exact, 6)}, ` +
        `1/e^x=${fmt(rec, 6)}. The reciprocal skips the cancellation.`
      );
    },
    compute(v) {
      const x = clamp(v.x, 1, 20);
      const N = Math.max(1, Math.floor(v.N));
      const exact = Math.exp(-x);
      const series = [];
      let term = 1;
      let sum = 0;
      for (let k = 0; k <= 40; k += 1) {
        sum += term;
        series.push({x: k, y: logAbs(sum - exact), highlight: k === N});
        term *= -x / (k + 1);
      }
      let termN = 1;
      let sumN = 0;
      for (let k = 0; k <= N; k += 1) {
        sumN += termN;
        termN *= -x / (k + 1);
      }
      const rec = 1 / Math.exp(x);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |series − e^{−x}|',
        series,
        stats: [
          {label: 'alternating sum', value: fmt(sumN, 6)},
          {label: 'e^{−x}', value: fmt(exact, 6)},
          {label: '1/e^x', value: fmt(rec, 6)},
          {label: '|1/e^x − e^{−x}|', value: Math.abs(rec - exact).toExponential(2)},
        ],
        note: 'Rewrite first, then exponentiate. Round-off in e^x remains, but you are not subtracting two huge close terms to make a tiny answer.',
      };
    },
  },

  quadraticCancel: {
    id: 'quadraticCancel',
    title: 'Quadratic roots when b² ≫ 4ac',
    subtitle: 'The ± textbook formula cancels on one root; Vieta’s other root does not',
    formula: '$x=\\dfrac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}\\quad\\text{or}\\quad x=\\dfrac{c}{a\\,x_{\\mathrm{big}}}$',
    params: [
      {
        key: 'n',
        label: 'n in c = 10^{−n}',
        meaning: 'Test family a=1, b=1, c=10^{−n}. Larger n → the tiny root sits closer to 0 and the + square-root formula cancels harder.',
        min: 1,
        max: 16,
        step: 1,
        default: 8,
      },
    ],
    example(v) {
      const n = Math.max(1, Math.floor(v.n));
      const c = 10 ** -n;
      const {naiveSmall, stableSmall, rel} = quadraticPair(1, 1, c);
      return (
        `a=1, b=1, c=1e−${n}. Naive (−b+√Δ)/(2a) small root ${naiveSmall.toExponential(6)}; ` +
        `stable c/(a x_big) gives ${stableSmall.toExponential(6)}; relative mismatch ${rel.toExponential(2)}.`
      );
    },
    compute(v) {
      const n = Math.max(1, Math.floor(v.n));
      const series = [];
      for (let k = 1; k <= 16; k += 1) {
        const {rel} = quadraticPair(1, 1, 10 ** -k);
        series.push({x: k, y: logAbs(rel), highlight: k === n});
      }
      const {naiveSmall, stableSmall, rel} = quadraticPair(1, 1, 10 ** -n);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |naive − stable| / |stable|',
        series,
        stats: [
          {label: 'c', value: (10 ** -n).toExponential(1)},
          {label: 'naive small', value: naiveSmall.toExponential(4)},
          {label: 'stable small', value: stableSmall.toExponential(4)},
          {label: 'rel. mismatch', value: rel.toExponential(2)},
        ],
        note: 'Take the root whose sign(b) avoids cancelling −b against ±√Δ, then the other root from x1 x2 = c/a.',
      };
    },
  },

  altThreeSums: {
    id: 'altThreeSums',
    title: 'Three algebraically equal sums',
    subtitle: 'S⁽¹⁾ alternates; S⁽³⁾ is all positive. Treat S⁽³⁾ as the reference.',
    formula: '$S_N^{(3)}=\\displaystyle\\sum_{n=1}^{N}\\dfrac{1}{2n(2n+1)}$',
    params: [
      {
        key: 'p',
        label: 'log₁₀ N',
        meaning: 'N terms (and 2N terms for the alternating form). Straight-line pieces on this log–log error plot mean error ∝ N^α.',
        min: 0,
        max: 5,
        step: 0.2,
        default: 3,
      },
    ],
    example(v) {
      const N = Math.max(1, Math.round(10 ** clamp(v.p, 0, 5)));
      const {s1, s2, s3} = threeSums(N);
      const e1 = Math.abs(s1 - s3) / Math.abs(s3);
      return (
        `N=${N}. S¹=${s1.toExponential(6)}, S²=${s2.toExponential(6)}, S³=${s3.toExponential(6)}. ` +
        `Relative |S¹−S³|/|S³| = ${e1.toExponential(3)} (~ ${Math.max(0, Math.floor(-Math.log10(e1 + 1e-30)))} matching digits).`
      );
    },
    compute(v) {
      const pNow = clamp(v.p, 0, 5);
      const Nnow = Math.max(1, Math.round(10 ** pNow));
      const want = [];
      for (let p = 0; p <= 5.001; p += 0.25) {
        want.push(Math.max(1, Math.round(10 ** p)));
      }
      want.push(Nnow);
      const tracked = threeSumsTrack(100000, want);
      const series = tracked.map((row) => ({
        x: Math.log10(row.N),
        y: logAbs(Math.abs(row.s1 - row.s3) / Math.abs(row.s3)),
        highlight: row.N === Nnow,
      }));
      const last = tracked.find((row) => row.N === Nnow) || tracked[tracked.length - 1];
      const e1 = Math.abs(last.s1 - last.s3) / Math.abs(last.s3);
      const e2 = Math.abs(last.s2 - last.s3) / Math.abs(last.s3);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |S¹ − S³| / |S³|  vs  log₁₀ N',
        series,
        stats: [
          {label: 'N', value: String(Nnow)},
          {label: 'S³ (ref)', value: last.s3.toExponential(6)},
          {label: '|S¹−S³|/|S³|', value: e1.toExponential(3)},
          {label: '|S²−S³|/|S³|', value: e2.toExponential(3)},
        ],
        note: 'Minus the vertical coordinate is roughly how many significant figures survive. A straight run means the error scales as a power of N.',
      };
    },
  },

  harmonicUpDown: {
    id: 'harmonicUpDown',
    title: 'Harmonic sum up vs down',
    subtitle: 'Same finite sum on paper; round-off cares about the order',
    formula: '$S^{\\mathrm{up}}=\\sum_{n=1}^{N} n^{-1},\\quad S^{\\mathrm{down}}=\\sum_{n=N}^{1} n^{-1}$',
    params: [
      {
        key: 'p',
        label: 'log₁₀ N',
        meaning: 'Adding tiny 1/n into an already-large partial sum (upward) drops those bits. Downward adds large terms last, so they land in significant digits.',
        min: 1,
        max: 5,
        step: 0.2,
        default: 3.5,
      },
    ],
    example(v) {
      const N = Math.max(2, Math.round(10 ** clamp(v.p, 1, 5)));
      const {up, down, rel} = harmonicPair(N);
      return (
        `N=${N}: S_up=${up.toExponential(8)}, S_down=${down.toExponential(8)}, ` +
        `relative split (up−down)/(|up|+|down|) = ${rel.toExponential(3)}.`
      );
    },
    compute(v) {
      const pNow = clamp(v.p, 1, 5);
      const Nnow = Math.max(2, Math.round(10 ** pNow));
      const series = [];
      for (let p = 1; p <= 5.001; p += 0.25) {
        const N = Math.max(2, Math.round(10 ** p));
        const {rel} = harmonicPair(N);
        series.push({x: Math.log10(N), y: logAbs(rel), highlight: N === Nnow});
      }
      const {up, down, rel} = harmonicPair(Nnow);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |(S_up−S_down)| / (|S_up|+|S_down|)  vs  log₁₀ N',
        series,
        stats: [
          {label: 'N', value: String(Nnow)},
          {label: 'S up', value: up.toExponential(8)},
          {label: 'S down', value: down.toExponential(8)},
          {label: 'rel. split', value: rel.toExponential(3)},
        ],
        note: 'Downward is usually the more precise of the two: small addends are not thrown into a sum that already filled the mantissa.',
      };
    },
  },

  roundoffDivide: {
    id: 'roundoffDivide',
    title: 'Error in a product or quotient',
    subtitle: 'Relative errors add in the worst case; ε² terms drop out',
    formula: '$\\dfrac{a_c}{a}\\simeq 1+|\\epsilon_b|+|\\epsilon_c|\\quad(a=b/c\\text{ or }a=bc)$',
    params: [
      {
        key: 'logEb',
        label: 'log₁₀ |ε_b|',
        meaning: 'Relative uncertainty already in b — the same rule you use when combining lab measurements.',
        min: -16,
        max: -2,
        step: 0.5,
        default: -8,
      },
      {
        key: 'logEc',
        label: 'log₁₀ |ε_c|',
        meaning: 'Relative uncertainty in c. Signs are unknown, so add the absolute values.',
        min: -16,
        max: -2,
        step: 0.5,
        default: -8,
      },
    ],
    example(v) {
      const eb = 10 ** clamp(v.logEb, -16, -2);
      const ec = 10 ** clamp(v.logEc, -16, -2);
      return (
        `Worst-case relative error in b/c or bc is |εb|+|εc| = ${(eb + ec).toExponential(2)} ` +
        `(here ${eb.toExponential(1)} + ${ec.toExponential(1)}).`
      );
    },
    compute(v) {
      const eb = 10 ** clamp(v.logEb, -16, -2);
      const ec = 10 ** clamp(v.logEc, -16, -2);
      const series = [];
      for (let k = -16; k <= -2 + 1e-9; k += 0.5) {
        const e = 10 ** k;
        series.push({x: k, y: logAbs(eb + e), highlight: Math.abs(k - v.logEc) < 0.26});
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀ (|ε_b| + |ε_c|) as |ε_c| varies',
        series,
        stats: [
          {label: '|εb|', value: eb.toExponential(2)},
          {label: '|εc|', value: ec.toExponential(2)},
          {label: 'sum (worst)', value: (eb + ec).toExponential(2)},
          {label: 'εb εc (dropped)', value: (eb * ec).toExponential(2)},
        ],
        note: 'Same addition-of-uncertainties rule as in the lab. Cancellation of signs is luck, not a method.',
      };
    },
  },

  funcLinearError: {
    id: 'funcLinearError',
    title: 'Error through a function',
    subtitle: 'Relative error ≈ (x f′/f) times the relative error in x',
    formula: '$\\mathcal{E}\\simeq \\dfrac{f\'(x)}{f(x)}(x-x_c)\\quad\\left(f=\\sqrt{1+x}\\Rightarrow \\mathcal{E}\\simeq\\dfrac{x-x_c}{2(1+x)}\\right)$',
    params: [
      {
        key: 'x',
        label: 'x',
        meaning: 'Point where you evaluate √(1+x). Try x = π/4 ≈ 0.785 to match the usual classroom check.',
        min: 0,
        max: 2,
        step: 0.005,
        default: 0.785,
      },
      {
        key: 'logDelta',
        label: 'log₁₀ |x − x_c|',
        meaning: 'Absolute error in the input. A “wrong fourth decimal” is about 10^{−4}.',
        min: -8,
        max: -2,
        step: 0.2,
        default: -4,
      },
    ],
    example(v) {
      const x = clamp(v.x, 0, 2);
      const dx = 10 ** clamp(v.logDelta, -8, -2);
      const pred = dx / (2 * (1 + x));
      const f = Math.sqrt(1 + x);
      const fc = Math.sqrt(1 + x + dx);
      const actual = Math.abs(f - fc) / f;
      return (
        `x=${fmt(x, 4)}, |Δx|=${dx.toExponential(1)} → predicted relative error ${pred.toExponential(2)}, ` +
        `actual |√(1+x)−√(1+x_c)|/√(1+x) = ${actual.toExponential(2)}.`
      );
    },
    compute(v) {
      const x = clamp(v.x, 0, 2);
      const logD = clamp(v.logDelta, -8, -2);
      const series = [];
      for (let k = -8; k <= -2 + 1e-9; k += 0.2) {
        const dx = 10 ** k;
        series.push({x: k, y: logAbs(dx / (2 * (1 + x))), highlight: Math.abs(k - logD) < 0.11});
      }
      const dx = 10 ** logD;
      const pred = dx / (2 * (1 + x));
      const f = Math.sqrt(1 + x);
      const actual = Math.abs(f - Math.sqrt(1 + x + dx)) / f;
      return {
        chartType: 'line',
        yLabel: 'log₁₀ predicted |E| vs log₁₀ |Δx|',
        series,
        stats: [
          {label: '√(1+x)', value: fmt(f, 6)},
          {label: '|Δx|', value: dx.toExponential(2)},
          {label: 'predicted |E|', value: pred.toExponential(2)},
          {label: 'actual |E|', value: actual.toExponential(2)},
        ],
        note: 'A fourth-place error in x near π/4 produces a relative error of the same order in √(1+x) — the derivative did not amplify much here.',
      };
    },
  },

  roundoffWalk: {
    id: 'roundoffWalk',
    title: 'Round-off as a random walk',
    subtitle: 'Typical accumulation √N ε_m; coherent N ε_m; some recurrences N!',
    formula: '$\\epsilon_{\\mathrm{ro}}\\simeq \\sqrt{N}\\,\\epsilon_m$',
    params: [
      {
        key: 'p',
        label: 'log₁₀ N (steps)',
        meaning: 'How many rounding events. Each is a tiny step of length ε_m in an unknown direction.',
        min: 0,
        max: 8,
        step: 0.2,
        default: 4,
      },
      {
        key: 'logEps',
        label: 'log₁₀ ε_m',
        meaning: 'Machine precision (IEEE double is about 2×10^{−16}).',
        min: -16,
        max: -6,
        step: 0.5,
        default: -16,
      },
    ],
    example(v) {
      const N = 10 ** clamp(v.p, 0, 8);
      const eps = 10 ** clamp(v.logEps, -16, -6);
      const rms = Math.sqrt(N) * eps;
      const lin = N * eps;
      return (
        `After N=${N.toExponential(1)} steps at ε_m=${eps.toExponential(1)}: random-walk estimate ${rms.toExponential(2)}, ` +
        `no-cancellation (linear) ${lin.toExponential(2)}.`
      );
    },
    compute(v) {
      const pNow = clamp(v.p, 0, 8);
      const eps = 10 ** clamp(v.logEps, -16, -6);
      const series = [];
      for (let p = 0; p <= 8.001; p += 0.2) {
        const N = 10 ** p;
        series.push({x: p, y: logAbs(Math.sqrt(N) * eps), highlight: Math.abs(p - pNow) < 0.11});
      }
      const N = 10 ** pNow;
      return {
        chartType: 'line',
        yLabel: 'log₁₀ (√N ε_m) vs log₁₀ N',
        series,
        stats: [
          {label: 'N', value: N.toExponential(2)},
          {label: '√N ε_m', value: (Math.sqrt(N) * eps).toExponential(2)},
          {label: 'N ε_m', value: (N * eps).toExponential(2)},
          {label: 'slope on this plot', value: '1/2'},
        ],
        note: 'If the rounding errors do not wander randomly, you need a separate analysis: linear in N, or — for some upward recurrences such as spherical Bessel functions — factorial growth.',
      };
    },
  },

  errorTradeoff: {
    id: 'errorTradeoff',
    title: 'Approximation vs round-off vs N',
    subtitle: 'ε_tot = α/N^β + √N ε_m — drop, then a slow rise; quit near the trough',
    formula: '$\\epsilon_{\\mathrm{tot}}\\simeq\\dfrac{\\alpha}{N^{\\beta}}+\\sqrt{N}\\,\\epsilon_m$',
    params: [
      {
        key: 'beta',
        label: 'β (convergence order)',
        meaning: 'How fast algorithmic error falls. Simpson-like rules are often β≈4; a cruder mesh might be β≈2.',
        min: 1,
        max: 4,
        step: 0.5,
        default: 2,
      },
      {
        key: 'logAlpha',
        label: 'log₁₀ α',
        meaning: 'Prefactor in ε_app ≈ α/N^β. Order-1 is a typical cartoon (α=1).',
        min: -1,
        max: 1,
        step: 0.1,
        default: 0,
      },
      {
        key: 'logEps',
        label: 'log₁₀ ε_m',
        meaning: 'Machine precision. Double is about 10^{−15} to 10^{−16}.',
        min: -16,
        max: -12,
        step: 0.5,
        default: -15,
      },
      {
        key: 'p',
        label: 'log₁₀ N',
        meaning: 'Steps you actually take. The dashed line is the N that minimises the model ε_tot.',
        min: 1,
        max: 7,
        step: 0.1,
        default: 3,
      },
    ],
    example(v) {
      const beta = clamp(v.beta, 1, 4);
      const alpha = 10 ** clamp(v.logAlpha, -1, 1);
      const eps = 10 ** clamp(v.logEps, -16, -12);
      const N = 10 ** clamp(v.p, 1, 7);
      const tot = epsTot(N, alpha, beta, eps);
      const nBest = nStar(alpha, beta, eps);
      return (
        `α=${fmt(alpha, 2)}, β=${fmt(beta, 1)}, ε_m=${eps.toExponential(1)}, N=${N.toExponential(1)} → ` +
        `ε_tot=${tot.toExponential(2)} (about ${Math.max(0, Math.floor(-Math.log10(tot + 1e-30)))} decimal places). ` +
        `Model minimum near N*≈${nBest.toExponential(2)}.`
      );
    },
    compute(v) {
      const beta = clamp(v.beta, 1, 4);
      const alpha = 10 ** clamp(v.logAlpha, -1, 1);
      const eps = 10 ** clamp(v.logEps, -16, -12);
      const pNow = clamp(v.p, 1, 7);
      const N = 10 ** pNow;
      const nBest = nStar(alpha, beta, eps);
      const series = [];
      for (let p = 1; p <= 7.001; p += 0.1) {
        const n = 10 ** p;
        series.push({
          x: p,
          y: logAbs(epsTot(n, alpha, beta, eps)),
          highlight: Math.abs(p - pNow) < 0.06,
        });
      }
      const tot = epsTot(N, alpha, beta, eps);
      const app = alpha / N ** beta;
      const ro = Math.sqrt(N) * eps;
      return {
        chartType: 'line',
        yLabel: 'log₁₀ ε_tot  vs  log₁₀ N',
        series,
        refLineX: Math.log10(Math.max(10, nBest)),
        stats: [
          {label: 'N*', value: nBest.toExponential(2)},
          {label: 'ε_app', value: app.toExponential(2)},
          {label: 'ε_ro', value: ro.toExponential(2)},
          {label: 'ε_tot', value: tot.toExponential(2)},
        ],
        note: 'Left of the trough: still converging (algorithmic). Right: round-off is winning. −log₁₀(ε_tot) is the number of decimal places you can quote.',
      };
    },
  },

  twoNCheck: {
    id: 'twoNCheck',
    title: 'A(N) versus A(2N) diagnostic',
    subtitle: 'You rarely know the exact answer — compare two resolutions instead',
    formula: '$A(N)-A(2N)\\simeq\\dfrac{\\alpha}{N^{\\beta}}\\quad\\text{(while round-off is still small)}$',
    params: [
      {
        key: 'beta',
        label: 'β',
        meaning: 'Assumed power in the converging regime. The log–log slope of |A(N)−A(2N)| is −β until round-off takes over.',
        min: 1,
        max: 4,
        step: 0.5,
        default: 2,
      },
      {
        key: 'logEps',
        label: 'log₁₀ ε_m',
        meaning: 'Noise floor. Once √N ε_m is no longer small, the diagnostic stops dropping and wanders up.',
        min: -16,
        max: -12,
        step: 0.5,
        default: -15,
      },
      {
        key: 'p',
        label: 'log₁₀ N',
        meaning: 'Coarse run. The fine run uses 2N steps.',
        min: 1,
        max: 6,
        step: 0.1,
        default: 2.5,
      },
    ],
    example(v) {
      const beta = clamp(v.beta, 1, 4);
      const eps = 10 ** clamp(v.logEps, -16, -12);
      const N = 10 ** clamp(v.p, 1, 6);
      const diag = twoNRel(N, 1, beta, eps);
      return (
        `N=${N.toExponential(1)}, 2N=${(2 * N).toExponential(1)}: |A(N)−A(2N)|/|A(2N)| ≈ ${diag.toExponential(3)}. ` +
        `On a log–log plot a straight drop of slope −β means you are still in the converging regime.`
      );
    },
    compute(v) {
      const beta = clamp(v.beta, 1, 4);
      const eps = 10 ** clamp(v.logEps, -16, -12);
      const pNow = clamp(v.p, 1, 6);
      const N = 10 ** pNow;
      const series = [];
      for (let p = 1; p <= 6.001; p += 0.1) {
        const n = 10 ** p;
        series.push({
          x: p,
          y: logAbs(twoNRel(n, 1, beta, eps)),
          highlight: Math.abs(p - pNow) < 0.06,
        });
      }
      const diag = twoNRel(N, 1, beta, eps);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |A(N)−A(2N)| / |A(2N)|  vs  log₁₀ N',
        series,
        stats: [
          {label: 'N', value: N.toExponential(2)},
          {label: 'diagnostic', value: diag.toExponential(3)},
          {label: 'expected slope', value: `−${fmt(beta, 1)}`},
          {label: '−log₁₀ diag', value: fmt(-Math.log10(diag + 1e-30), 1)},
        ],
        note: 'Straight rapid drop: converging; you can read β from the slope. Flatten then a slow rise: quit before that uptick.',
      };
    },
  },

  sinTermStop: {
    id: 'sinTermStop',
    title: 'Stop when the next term is small',
    subtitle: '|term/sum| vs n — do not peek at a table. Large x waits longer before terms even shrink.',
    formula:
      '$t_n=\\dfrac{-x^{2}}{(2n-1)(2n-2)}t_{n-1},\\quad \\left|\\dfrac{t_n}{S_n}\\right|<\\varepsilon$',
    params: [
      {
        key: 'x',
        label: 'x (radians)',
        meaning: 'Try x < 2π and x > 2π. For large |x| the early terms grow; N must outrun |x| before the remainder falls.',
        min: 0.5,
        max: 16,
        step: 0.1,
        default: 1,
      },
      {
        key: 'logEps',
        label: 'log₁₀ ε (relative stop)',
        meaning: 'Quit when |term/sum| drops below this. 10^{−8} is one part in a hundred million. Do not set ε below machine precision.',
        min: -12,
        max: -4,
        step: 0.5,
        default: -8,
      },
    ],
    example(v) {
      const x = clamp(v.x, 0.5, 16);
      const eps = 10 ** clamp(v.logEps, -12, -4);
      const run = sineRecurrence(x, 40);
      const hit = run.find((row) => row.ratio < eps);
      return (
        `x=${fmt(x, 2)}, ε=${eps.toExponential(0)}. ` +
        (hit
          ? `First n with |term/sum|<ε is n=${hit.n} (sum=${fmt(hit.sum, 8)}; true sin=${fmt(Math.sin(x), 8)}).`
          : `Within 40 terms the ratio never fell below ε — |x| is still large compared with n.`)
      );
    },
    compute(v) {
      const x = clamp(v.x, 0.5, 16);
      const logE = clamp(v.logEps, -12, -4);
      const eps = 10 ** logE;
      const run = sineRecurrence(x, 40);
      const hit = run.find((row) => row.ratio < eps);
      const last = run[run.length - 1];
      const series = run.map((row) => ({
        x: row.n,
        y: logAbs(row.ratio),
        highlight: Boolean(hit) && row.n === hit.n,
      }));
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |term/sum|',
        series,
        refLineY: logE,
        stats: [
          {label: 'ε', value: eps.toExponential(0)},
          {label: 'n at stop', value: hit ? String(hit.n) : '>40'},
          {label: 'sum', value: fmt(last.sum, 8)},
          {label: '|sum − sin x|', value: Math.abs(last.sum - Math.sin(x)).toExponential(2)},
        ],
        note: 'Dashed line is log₁₀ ε. Recurrence: each term is −x²/((2n−1)(2n−2)) times the previous — no x^{2n} or (2n)!.',
      };
    },
  },

  expNegErrorN: {
    id: 'expNegErrorN',
    title: 'Error in the e^{−x} series vs N',
    subtitle: 'Fig. 3.3-style: dip then rise — correlated cancellation, not a √N walk',
    formula: '$e^{-x}\\simeq\\sum_{k=0}^{N}\\dfrac{(-x)^{k}}{k!}$',
    params: [
      {
        key: 'x',
        label: 'x',
        meaning: 'Larger x (curves stacked upward in the book figure) needs more terms before the dip, and the floor of the dip is worse.',
        min: 1,
        max: 20,
        step: 0.5,
        default: 10,
      },
    ],
    example(v) {
      const x = clamp(v.x, 1, 20);
      const exact = Math.exp(-x);
      let term = 1;
      let sum = 0;
      let best = Infinity;
      let bestN = 0;
      for (let n = 0; n <= 60; n += 1) {
        sum += term;
        const err = Math.abs(sum - exact) / Math.max(exact, 1e-30);
        if (err < best) {
          best = err;
          bestN = n;
        }
        term *= -x / (n + 1);
      }
      return (
        `x=${fmt(x, 1)}: best relative error ≈ ${best.toExponential(2)} near N=${bestN}. ` +
        `After that, alternating cancellation feeds round-off and the error climbs — not like √N ε_m.`
      );
    },
    compute(v) {
      const x = clamp(v.x, 1, 20);
      const exact = Math.exp(-x);
      const series = [];
      let term = 1;
      let sum = 0;
      let bestN = 0;
      let best = Infinity;
      for (let n = 0; n <= 60; n += 1) {
        sum += term;
        const err = Math.abs(sum - exact) / Math.max(exact, 1e-30);
        series.push({x: n, y: logAbs(err), highlight: false});
        if (err < best) {
          best = err;
          bestN = n;
        }
        term *= -x / (n + 1);
      }
      series.forEach((p) => {
        if (p.x === bestN) p.highlight = true;
      });
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |S_N − e^{−x}| / e^{−x}',
        series,
        stats: [
          {label: 'x', value: fmt(x, 1)},
          {label: 'N at dip', value: String(bestN)},
          {label: 'min rel. err', value: best.toExponential(2)},
          {label: 'e^{−x}', value: exact.toExponential(3)},
        ],
        note: 'Negative slope = algorithmic error falling. The dip is rapid convergence; the rise is correlated cancellation/round-off — not the random-walk law from §3.2.',
      };
    },
  },

  besselJl: {
    id: 'besselJl',
    title: 'Spherical Bessel j_ℓ(x)',
    subtitle: 'First few orders — for small x, larger ℓ stay tiny (Fig. 3.5)',
    formula: '$j_{\\ell+1}(x)=\\dfrac{2\\ell+1}{x}j_{\\ell}(x)-j_{\\ell-1}(x)$',
    params: [
      {
        key: 'ell',
        label: 'ℓ to highlight',
        meaning: 'Which order is highlighted on the chart. All of j₀…j₃ are drawn.',
        min: 0,
        max: 3,
        step: 1,
        default: 1,
      },
      {
        key: 'x',
        label: 'x (probe)',
        meaning: 'Vertical marker. Compare how j_ℓ(x) shrinks with ℓ at small x.',
        min: 0.5,
        max: 20,
        step: 0.1,
        default: 5,
      },
    ],
    example(v) {
      const ell = Math.max(0, Math.floor(v.ell));
      const x = clamp(v.x, 0.5, 20);
      const js = besselDown(x, 8, 40);
      return `At x=${fmt(x, 1)}, downward recursion gives j_${ell}(x)≈${js[ell].toExponential(4)} (normalized to j₀=sin x/x).`;
    },
    compute(v) {
      const ell = Math.max(0, Math.min(3, Math.floor(v.ell)));
      const xMark = clamp(v.x, 0.5, 20);
      const series = [];
      for (let i = 0; i <= 80; i += 1) {
        const x = 0.25 + (20 - 0.25) * (i / 80);
        const js = besselDown(x, 3, 40);
        series.push({x, y: js[ell], highlight: Math.abs(x - xMark) < 0.15});
      }
      const at = besselDown(xMark, 3, 40);
      return {
        chartType: 'line',
        yLabel: `j_${ell}(x)`,
        series,
        refLineX: xMark,
        stats: [
          {label: 'j₀(x)', value: at[0].toExponential(3)},
          {label: 'j₁(x)', value: at[1].toExponential(3)},
          {label: 'j₂(x)', value: at[2].toExponential(3)},
          {label: 'j₃(x)', value: at[3].toExponential(3)},
        ],
        note: 'Upward recurrence from j₀,j₁ looks fine at first, then subtractive cancellation mixes in Neumann pollution. Miller’s device recurs downward and renormalizes to j₀.',
      };
    },
  },

  lcgScatter: {
    id: 'lcgScatter',
    title: 'LCG successive-pair scatter',
    subtitle: 'Fig. 4.1-style: (rᵢ, rᵢ₊₁) — lattice = bad correlations',
    formula: '$r_{i+1}=(a r_i+c)\\bmod M$',
    params: [
      {
        key: 'mode',
        label: 'generator',
        meaning: '0 = pedagogical bad (a=57,c=1,M=256). 1 = modest LCG. 2 = mulberry-style scramble (looks closer to built-in).',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
      },
      {
        key: 'n',
        label: 'pairs',
        meaning: 'How many successive pairs to plot.',
        min: 40,
        max: 400,
        step: 20,
        default: 200,
      },
      {
        key: 'seed',
        label: 'seed r₁',
        meaning: 'Starting integer for the LCG (ignored for mode 2 scramble beyond seeding).',
        min: 1,
        max: 200,
        step: 1,
        default: 10,
      },
    ],
    example(v) {
      const mode = Math.floor(clamp(v.mode, 0, 2));
      const names = ['bad pedagogical', 'modest LCG', 'scrambled'];
      return `Mode ${mode} (${names[mode]}): look for stripes or a lattice in (rᵢ, rᵢ₊₁). A clean cloud is necessary but not sufficient for randomness.`;
    },
    compute(v) {
      const mode = Math.floor(clamp(v.mode, 0, 2));
      const n = Math.floor(clamp(v.n, 40, 400));
      const seed = Math.floor(clamp(v.seed, 1, 200));
      const seq = lcgSequence(mode, seed, n + 1);
      const series = [];
      for (let i = 0; i < n; i += 1) {
        series.push({x: seq[i], y: seq[i + 1]});
      }
      return {
        chartType: 'scatter',
        yLabel: 'rᵢ₊₁ vs rᵢ',
        series,
        stats: [
          {label: 'mode', value: String(mode)},
          {label: 'pairs', value: String(n)},
          {label: 'seed', value: String(seed)},
        ],
        note: 'Left-style lattice ⇒ do not trust the generator. A filled square is encouraging, not a proof.',
      };
    },
  },

  lcgVsIndex: {
    id: 'lcgVsIndex',
    title: 'Uniform sequence rᵢ vs i',
    subtitle: 'Fig. 4.2-style: range and fluctuation (connected for the eye)',
    formula: '$0\\le r_i < 1$',
    params: [
      {
        key: 'mode',
        label: 'generator',
        meaning: '0 = bad pedagogical LCG. 1 = modest LCG. 2 = scrambled.',
        min: 0,
        max: 2,
        step: 1,
        default: 1,
      },
      {
        key: 'n',
        label: 'N terms',
        meaning: 'How many terms to plot against the index i.',
        min: 20,
        max: 200,
        step: 10,
        default: 80,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'Starting value.',
        min: 1,
        max: 200,
        step: 1,
        default: 10,
      },
    ],
    example(v) {
      return `Plotting ${Math.floor(v.n)} draws. You should see the full [0,1) range and jitter — not a smooth curve or a short repeating motif.`;
    },
    compute(v) {
      const mode = Math.floor(clamp(v.mode, 0, 2));
      const n = Math.floor(clamp(v.n, 20, 200));
      const seed = Math.floor(clamp(v.seed, 1, 200));
      const seq = lcgSequence(mode, seed, n);
      const series = seq.map((y, i) => ({x: i + 1, y, highlight: false}));
      return {
        chartType: 'line',
        yLabel: 'rᵢ',
        series,
        stats: [
          {label: 'min', value: fmt(Math.min(...seq), 3)},
          {label: 'max', value: fmt(Math.max(...seq), 3)},
          {label: 'mean', value: fmt(seq.reduce((s, x) => s + x, 0) / seq.length, 3)},
        ],
        note: 'Connecting points helps the eye follow order. It does not prove randomness — only shows coverage and fluctuation.',
      };
    },
  },

  walkRms: {
    id: 'walkRms',
    title: 'Random-walk R_rms vs √N',
    subtitle: 'Diffusion: ⟨R²⟩½ ≈ √N · r_rms for unit steps',
    formula: '$R_{\\mathrm{rms}}\\simeq\\sqrt{N}\\, r_{\\mathrm{rms}}$',
    params: [
      {
        key: 'N',
        label: 'N steps',
        meaning: 'Steps per trial.',
        min: 20,
        max: 800,
        step: 20,
        default: 200,
      },
      {
        key: 'K',
        label: 'K trials',
        meaning: 'Book rule of thumb: K ≈ √N independent walks.',
        min: 5,
        max: 80,
        step: 5,
        default: 20,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'Deterministic family of walks.',
        min: 1,
        max: 30,
        step: 1,
        default: 3,
      },
    ],
    example(v) {
      const N = Math.floor(clamp(v.N, 20, 800));
      const K = Math.floor(clamp(v.K, 5, 80));
      return `K=${K} walks of N=${N} unit steps. Theory R_rms=√N=${Math.sqrt(N).toFixed(2)}. Single walks scatter; the average should land near the √N line.`;
    },
    compute(v) {
      const N = Math.floor(clamp(v.N, 20, 800));
      const K = Math.floor(clamp(v.K, 5, 80));
      const seed = Math.floor(clamp(v.seed, 1, 30));
      const series = [];
      let sumR2 = 0;
      for (let t = 0; t < K; t += 1) {
        const R = walkEndR(seed + 31 * (t + 1), N);
        sumR2 += R * R;
        series.push({x: t + 1, y: R});
      }
      const Rrms = Math.sqrt(sumR2 / K);
      const theory = Math.sqrt(N);
      return {
        chartType: 'scatter',
        yLabel: 'R (per trial) vs trial index',
        series,
        stats: [
          {label: '√N', value: fmt(theory, 2)},
          {label: 'R_rms', value: fmt(Rrms, 2)},
          {label: 'R_rms / √N', value: fmt(Rrms / theory, 3)},
        ],
        note: '⟨R⃗⟩→0 but R_rms grows like √N. One path can be far from the mean — average many trials.',
      };
    },
  },

  walkRmsCurve: {
    id: 'walkRmsCurve',
    title: 'R_rms versus √N',
    subtitle: 'Fig. 4.4-right: theory is the straight line through the origin',
    formula: '$R_{\\mathrm{rms}}(N)=\\sqrt{\\langle R^{2}(N)\\rangle}\\quad\\text{vs}\\quad\\sqrt{N}$',
    params: [
      {
        key: 'Nmax',
        label: 'max N',
        meaning: 'Largest step count on the curve. Small N is noisy; large N should hug the line.',
        min: 36,
        max: 400,
        step: 16,
        default: 196,
      },
      {
        key: 'K',
        label: 'K trials / N',
        meaning: 'Independent walks averaged at each N.',
        min: 10,
        max: 60,
        step: 5,
        default: 25,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'Deterministic family.',
        min: 1,
        max: 20,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      const Nmax = Math.floor(clamp(v.Nmax, 36, 400));
      return `Slide max N. Early points wander; by N≈${Nmax} the measured R_rms should sit near √N for unit steps.`;
    },
    compute(v) {
      const Nmax = Math.floor(clamp(v.Nmax, 36, 400));
      const K = Math.floor(clamp(v.K, 10, 60));
      const seed = Math.floor(clamp(v.seed, 1, 20));
      const Ns = [];
      for (let n = 4; n <= Nmax; n = Math.floor(n * 1.35) + 1) Ns.push(n);
      if (Ns[Ns.length - 1] !== Nmax) Ns.push(Nmax);
      const series = [];
      let lastRatio = 1;
      for (const N of Ns) {
        let sumR2 = 0;
        for (let t = 0; t < K; t += 1) {
          const R = walkEndR(seed + 17 * N + 31 * (t + 1), N);
          sumR2 += R * R;
        }
        const Rrms = Math.sqrt(sumR2 / K);
        const sN = Math.sqrt(N);
        lastRatio = Rrms / sN;
        series.push({x: sN, y: Rrms, highlight: N === Nmax});
      }
      return {
        chartType: 'scatter',
        yLabel: 'R_rms vs √N',
        series,
        stats: [
          {label: 'Nmax', value: String(Nmax)},
          {label: 'R_rms/√N', value: fmt(lastRatio, 3)},
          {label: 'K', value: String(K)},
        ],
        note: 'Theory for unit steps is the diagonal y=x. Check also that cross terms ⟨Δx_i Δx_{j≠i}⟩ / R² and ⟨Δx_i Δy_j⟩ / R² stay near zero.',
      };
    },
  },

  decaySemilog: {
    id: 'decaySemilog',
    title: 'Stochastic decay on a semilog plot',
    subtitle: 'Fig. 4.7-style: bumps grow as N shrinks; green = N₀e^{−λt}',
    formula: '$N(t)\\approx N(0)e^{-\\lambda t}\\quad(N\\to\\infty)$',
    params: [
      {
        key: 'N0',
        label: 'N(0)',
        meaning: 'Large N₀ looks exponential; small N₀ is openly stochastic.',
        min: 20,
        max: 2000,
        step: 20,
        default: 200,
      },
      {
        key: 'lambda',
        label: 'λ per Δt',
        meaning: 'Decay probability per nucleus per time step.',
        min: 0.02,
        max: 0.2,
        step: 0.01,
        default: 0.05,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'Different Monte Carlo realization.',
        min: 1,
        max: 30,
        step: 1,
        default: 7,
      },
    ],
    example(v) {
      const N0 = Math.floor(clamp(v.N0, 20, 2000));
      const lam = clamp(v.lambda, 0.02, 0.2);
      return `N₀=${N0}, λ=${fmt(lam, 2)}. Early slope of ln N should sit near −λ; late times wander once few nuclei remain.`;
    },
    compute(v) {
      const N0 = Math.floor(clamp(v.N0, 20, 2000));
      const lam = clamp(v.lambda, 0.02, 0.2);
      const seed = Math.floor(clamp(v.seed, 1, 30));
      const {series} = decayRun(N0, lam, seed);
      const pts = series
        .filter((p) => p.N > 0)
        .map((p) => ({x: p.t, y: Math.log(p.N), highlight: false}));
      return {
        chartType: 'line',
        yLabel: 'ln N vs t',
        series: pts,
        stats: [
          {label: 'N₀', value: String(N0)},
          {label: 'λ', value: fmt(lam, 3)},
          {label: 'τ=1/λ', value: fmt(1 / lam, 1)},
          {label: 'extinction t', value: String(series[series.length - 1]?.t ?? 0)},
        ],
        note: 'One stochastic run on a semilog axis. Large N₀ looks nearly straight; small N₀ shows Geiger-like bumps. Mean-field law: N₀e^{−λt}.',
      };
    },
  },

  decaySlope: {
    id: 'decaySlope',
    title: 'Early ln N slope vs λ',
    subtitle: 'Slope ≈ −λ, independent of N(0) when N stays large',
    formula: '$\\dfrac{d}{dt}\\ln N \\simeq -\\lambda$',
    params: [
      {
        key: 'lambda',
        label: 'λ',
        meaning: 'Target decay constant. Measured early slope should track −λ.',
        min: 0.02,
        max: 0.15,
        step: 0.01,
        default: 0.06,
      },
      {
        key: 'N0',
        label: 'N(0)',
        meaning: 'Use a large sample so the early window is nearly straight.',
        min: 500,
        max: 8000,
        step: 500,
        default: 4000,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'Realization.',
        min: 1,
        max: 20,
        step: 1,
        default: 2,
      },
    ],
    example(v) {
      return `Fit ln N over the first ~20 steps. Changing N₀ shifts the intercept; λ sets the slope.`;
    },
    compute(v) {
      const lam = clamp(v.lambda, 0.02, 0.15);
      const N0 = Math.floor(clamp(v.N0, 500, 8000));
      const seed = Math.floor(clamp(v.seed, 1, 20));
      const slope = earlyLnSlope(N0, lam, seed, 20);
      const series = [];
      for (let i = 0; i <= 20; i += 1) {
        series.push({x: i, y: -lam * i, highlight: false});
      }
      const meas = [];
      const {series: run} = decayRun(N0, lam, seed);
      for (const p of run) {
        if (p.t > 20 || p.N <= 0) break;
        meas.push({x: p.t, y: Math.log(p.N) - Math.log(N0), highlight: false});
      }
      return {
        chartType: 'line',
        yLabel: 'ln(N/N₀) vs t',
        series: meas,
        stats: [
          {label: '−λ', value: fmt(-lam, 4)},
          {label: 'fit slope', value: fmt(slope, 4)},
          {label: 'ratio', value: fmt(slope / -lam, 3)},
        ],
        note: 'Measured early slope (blue) should sit near the −λ reference. Activity ΔN is noisier than N itself.',
      };
    },
  },

  rngMoment: {
    id: 'rngMoment',
    title: 'Uniform moment test',
    subtitle: '⟨xᵏ⟩ ≈ 1/(k+1); √N |error| should stay O(1) if random',
    formula: '$\\sqrt{N}\\left|\\dfrac{1}{N}\\sum x_i^{k}-\\dfrac{1}{k+1}\\right|$',
    params: [
      {
        key: 'k',
        label: 'moment k',
        meaning: 'Power in ⟨xᵏ⟩. Try 1, 3, 7 as in the book checklist.',
        min: 1,
        max: 7,
        step: 2,
        default: 1,
      },
      {
        key: 'N',
        label: 'sample size N',
        meaning: 'Larger N tightens the mean; the √N-scaled error should not blow up.',
        min: 100,
        max: 20000,
        step: 100,
        default: 2000,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'LCG family for the test stream.',
        min: 1,
        max: 40,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const k = Math.floor(clamp(v.k, 1, 7));
      const N = Math.floor(clamp(v.N, 100, 20000));
      return `For uniform[0,1], ⟨x^${k}⟩ → 1/${k + 1}. Plot the running √N-scaled absolute error — it should jitter around O(1), not grow like √N.`;
    },
    compute(v) {
      const k = Math.floor(clamp(v.k, 1, 7));
      if (k % 2 === 0) {
        /* allow even via slider snap — still fine */
      }
      const N = Math.floor(clamp(v.N, 100, 20000));
      const seed = Math.floor(clamp(v.seed, 1, 40));
      const xs = lcgFloatSeq(seed, N);
      const series = [];
      let sum = 0;
      const target = 1 / (k + 1);
      const step = Math.max(1, Math.floor(N / 80));
      for (let i = 0; i < N; i += 1) {
        sum += xs[i] ** k;
        if ((i + 1) % step === 0 || i === N - 1) {
          const n = i + 1;
          const err = Math.abs(sum / n - target) * Math.sqrt(n);
          series.push({x: n, y: err, highlight: i === N - 1});
        }
      }
      const final = series[series.length - 1].y;
      return {
        chartType: 'line',
        yLabel: '√n |⟨xᵏ⟩ − 1/(k+1)|',
        series,
        stats: [
          {label: 'k', value: String(k)},
          {label: '1/(k+1)', value: fmt(target, 4)},
          {label: 'final √N|err|', value: fmt(final, 3)},
        ],
        note: 'Uniform ⇒ moment → 1/(k+1). If √N|error| stays O(1) as N grows, the deviations look like ordinary sampling noise (randomness), not a systematic bias.',
      };
    },
  },

  rngCorrCk: {
    id: 'rngCorrCk',
    title: 'Near-neighbor product C(k)',
    subtitle: 'C(k)=⟨xᵢ xᵢ₊ₖ⟩ ≈ 1/4 for independent uniforms',
    formula: '$C(k)=\\dfrac{1}{N}\\sum_{i} x_i x_{i+k}\\ \\simeq\\ \\tfrac{1}{4}$',
    params: [
      {
        key: 'k',
        label: 'lag k',
        meaning: 'How many steps apart. k=1 is successive pairs.',
        min: 1,
        max: 10,
        step: 1,
        default: 1,
      },
      {
        key: 'N',
        label: 'N',
        meaning: 'Sequence length (cyclic wrap for the lag).',
        min: 200,
        max: 20000,
        step: 200,
        default: 4000,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'LCG stream.',
        min: 1,
        max: 40,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      return `Independent U(0,1) factors give ∬ xy dx dy = 1/4. Watch √N|C(k)−1/4| — should be O(1).`;
    },
    compute(v) {
      const k = Math.floor(clamp(v.k, 1, 10));
      const N = Math.floor(clamp(v.N, 200, 20000));
      const seed = Math.floor(clamp(v.seed, 1, 40));
      const xs = lcgFloatSeq(seed, N);
      const series = [];
      const sizes = [];
      for (let n = Math.min(200, N); n <= N; n = Math.min(N, Math.floor(n * 1.5) + 1)) {
        sizes.push(n);
        if (n === N) break;
      }
      for (const n of sizes) {
        let s = 0;
        for (let i = 0; i < n; i += 1) s += xs[i] * xs[(i + k) % n];
        const C = s / n;
        series.push({x: n, y: Math.sqrt(n) * Math.abs(C - 0.25), highlight: n === N});
      }
      let s = 0;
      for (let i = 0; i < N; i += 1) s += xs[i] * xs[(i + k) % N];
      const C = s / N;
      return {
        chartType: 'line',
        yLabel: '√n |C(k) − 1/4|',
        series,
        stats: [
          {label: 'k', value: String(k)},
          {label: 'C(k)', value: fmt(C, 4)},
          {label: '√N|C−1/4|', value: fmt(Math.sqrt(N) * Math.abs(C - 0.25), 3)},
        ],
        note: 'C(k)≈1/4 ⇒ uncorrelated uniforms at lag k. A lattice LCG fails the scatter test long before this average looks bad — always plot pairs too.',
      };
    },
  },

  diffForwardCentral: {
    id: 'diffForwardCentral',
    title: 'Forward vs central difference error',
    subtitle: 'Error ~ O(h) forward, O(h²) central — until round-off wins',
    formula: '$D_{\\mathrm{fd}}=\\dfrac{y(t+h)-y(t)}{h},\\quad D_{\\mathrm{cd}}=\\dfrac{y(t+h/2)-y(t-h/2)}{h}$',
    params: [
      {
        key: 'h',
        label: 'step h',
        meaning: 'Smaller h cuts truncation error, then subtractive cancellation / ε_m takes over.',
        min: 1e-8,
        max: 0.5,
        step: 1e-8,
        default: 0.05,
      },
      {
        key: 't',
        label: 't',
        meaning: 'Evaluation point for y=sin(t).',
        min: 0.2,
        max: 2.5,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      const h = clamp(v.h, 1e-8, 0.5);
      return `At t=${fmt(v.t, 1)}, h=${h.toExponential(1)}: watch |error|. Central should win until h is tiny enough that y(t±h/2)≈y(t).`;
    },
    compute(v) {
      const t = clamp(v.t, 0.2, 2.5);
      const hFocus = clamp(v.h, 1e-8, 0.5);
      const exact = Math.cos(t);
      const series = [];
      const hs = [];
      for (let e = -1; e >= -8; e -= 1) hs.push(10 ** e);
      hs.push(0.2, 0.5);
      hs.sort((a, b) => a - b);
      let fdFocus = 0;
      let cdFocus = 0;
      for (const h of hs) {
        const fd = (Math.sin(t + h) - Math.sin(t)) / h;
        const cd = (Math.sin(t + h / 2) - Math.sin(t - h / 2)) / h;
        const err = Math.abs(fd - exact);
        series.push({x: Math.log10(h), y: Math.log10(err + 1e-18), highlight: Math.abs(Math.log10(h) - Math.log10(hFocus)) < 0.15});
        if (Math.abs(h - hFocus) < hFocus * 0.2 || h === hs[0]) {
          fdFocus = fd;
          cdFocus = cd;
        }
      }
      // recompute exactly at hFocus
      fdFocus = (Math.sin(t + hFocus) - Math.sin(t)) / hFocus;
      cdFocus = (Math.sin(t + hFocus / 2) - Math.sin(t - hFocus / 2)) / hFocus;
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |D_fd − cos t| vs log₁₀ h',
        series,
        stats: [
          {label: 'h', value: hFocus.toExponential(2)},
          {label: '|fd err|', value: Math.abs(fdFocus - exact).toExponential(2)},
          {label: '|cd err|', value: Math.abs(cdFocus - exact).toExponential(2)},
          {label: 'exact', value: fmt(exact, 6)},
        ],
        note: 'Forward error tracks ~h (slope ≈1 on log–log). Central is ~h² until floating-point cancellation flattens or raises the floor.',
      };
    },
  },

  diffExtrapolated: {
    id: 'diffExtrapolated',
    title: 'Extrapolated (extended) difference',
    subtitle: 'Richardson: (4 D_cd(h/2) − D_cd(h))/3 cancels the h² term',
    formula: '$D_{\\mathrm{ed}}=\\dfrac{4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h)}{3}$',
    params: [
      {
        key: 'h',
        label: 'step h',
        meaning: 'Parent step. ED uses h, h/2, and h/4 samples.',
        min: 1e-8,
        max: 0.5,
        step: 1e-8,
        default: 0.1,
      },
      {
        key: 't',
        label: 't',
        meaning: 'Differentiate cos(t) here.',
        min: 0.1,
        max: 2.5,
        step: 0.1,
        default: 1,
      },
      {
        key: 'fn',
        label: 'function',
        meaning: '0 = cos (exact −sin). 1 = exp (exact exp).',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      return `Compare |rel err| for forward, central, and extrapolated at the chosen h. ED should win in the truncation-dominated region.`;
    },
    compute(v) {
      const t = clamp(v.t, 0.1, 2.5);
      const hFocus = clamp(v.h, 1e-8, 0.5);
      const useExp = Math.floor(clamp(v.fn, 0, 1)) === 1;
      const y = useExp ? Math.exp : Math.cos;
      const yp = useExp ? Math.exp : (x) => -Math.sin(x);
      const exact = yp(t);
      const series = [];
      const hs = [];
      for (let e = 0; e >= -8; e -= 1) hs.push(10 ** e);
      hs.push(0.2, 0.5);
      hs.sort((a, b) => a - b);
      const uniq = [...new Set(hs.map((h) => +h.toPrecision(12)))];
      for (const h of uniq) {
        const ed = extrapolatedDiff(y, t, h);
        const err = Math.abs(ed - exact) / Math.max(Math.abs(exact), 1e-30);
        series.push({
          x: Math.log10(h),
          y: Math.log10(err + 1e-18),
          highlight: Math.abs(Math.log10(h) - Math.log10(hFocus)) < 0.2,
        });
      }
      const fd = (y(t + hFocus) - y(t)) / hFocus;
      const cd = (y(t + hFocus / 2) - y(t - hFocus / 2)) / hFocus;
      const ed = extrapolatedDiff(y, t, hFocus);
      const rel = (est) => Math.abs(est - exact) / Math.max(Math.abs(exact), 1e-30);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E_rel| for D_ed vs log₁₀ h',
        series,
        stats: [
          {label: 'fn', value: useExp ? 'exp' : 'cos'},
          {label: 'E_fd', value: rel(fd).toExponential(2)},
          {label: 'E_cd', value: rel(cd).toExponential(2)},
          {label: 'E_ed', value: rel(ed).toExponential(2)},
        ],
        note: 'ED cancels the O(h²) central error → O(h⁴) until round-off (ε_m/h scale) takes over at tiny h.',
      };
    },
  },

  diffSecond: {
    id: 'diffSecond',
    title: 'Central second derivative',
    subtitle: 'y″ ≈ [y(t+h) − 2y(t) + y(t−h)] / h²',
    formula: '$y\'\'(t)\\simeq\\dfrac{y(t+h)+y(t-h)-2y(t)}{h^{2}}$',
    params: [
      {
        key: 'h',
        label: 'h',
        meaning: 'Second differences amplify cancellation — the optimal h is larger than for first derivatives.',
        min: 1e-6,
        max: 0.5,
        step: 1e-6,
        default: 0.1,
      },
      {
        key: 't',
        label: 't',
        meaning: 'For y=cos(t), exact y″=−cos(t).',
        min: 0.1,
        max: Math.PI * 2,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      return `Newton needs a=y″. Sweep h: truncation falls, then ε_m/h² round-off rises.`;
    },
    compute(v) {
      const t = clamp(v.t, 0.1, Math.PI * 2);
      const hFocus = clamp(v.h, 1e-6, 0.5);
      const exact = -Math.cos(t);
      const series = [];
      const hs = [];
      for (let e = 0; e >= -7; e -= 1) hs.push(10 ** e);
      hs.push(0.2, 0.5);
      hs.sort((a, b) => a - b);
      for (const h of [...new Set(hs.map((x) => +x.toPrecision(12)))]) {
        const d2 = (Math.cos(t + h) + Math.cos(t - h) - 2 * Math.cos(t)) / (h * h);
        const err = Math.abs(d2 - exact) / Math.max(Math.abs(exact), 1e-30);
        series.push({
          x: Math.log10(h),
          y: Math.log10(err + 1e-18),
          highlight: Math.abs(Math.log10(h) - Math.log10(hFocus)) < 0.2,
        });
      }
      const d2 = (Math.cos(t + hFocus) + Math.cos(t - hFocus) - 2 * Math.cos(t)) / (hFocus * hFocus);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E_rel| for y″ vs log₁₀ h',
        series,
        stats: [
          {label: 'h', value: hFocus.toExponential(2)},
          {label: 'y″ approx', value: fmt(d2, 6)},
          {label: 'exact −cos t', value: fmt(exact, 6)},
          {label: '|E_rel|', value: (Math.abs(d2 - exact) / Math.max(Math.abs(exact), 1e-30)).toExponential(2)},
        ],
        note: 'Form (5.16) stores y(t+h)+y(t−h) then subtracts 2y(t) — more cancellation risk than staged first-derivative differences, but algebraically the same stencil.',
      };
    },
  },

  riemannBox: {
    id: 'riemannBox',
    title: 'Riemann / box-counting quadrature',
    subtitle: '∫ f ≈ Σ f(xᵢ) wᵢ with equal widths h = (b−a)/N',
    formula: '$\\displaystyle\\int_a^b f(x)\\,dx \\simeq \\sum_{i=1}^{N} f(x_i)\\,w_i$',
    params: [
      {
        key: 'N',
        label: 'boxes N',
        meaning: 'Number of equal-width panels. Larger N → thinner boxes → closer to the Riemann limit.',
        min: 2,
        max: 128,
        step: 1,
        default: 8,
      },
      {
        key: 'rule',
        label: 'sample rule',
        meaning: '0 = left endpoint, 1 = midpoint, 2 = right endpoint.',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
      },
      {
        key: 'fn',
        label: 'integrand',
        meaning: '0 = e^{-t} on [0,1] (spectrum toy). 1 = cos t on [0, π/2].',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      const N = Math.max(2, Math.floor(clamp(v.N, 2, 128)));
      return `N=${N} equal boxes. Watch |approx − exact| fall as N grows — this is still plain box counting, not trapezoid/Simpson yet.`;
    },
    compute(v) {
      const Nfocus = Math.max(2, Math.floor(clamp(v.N, 2, 128)));
      const rule = Math.max(0, Math.min(2, Math.floor(clamp(v.rule, 0, 2))));
      const useCos = Math.floor(clamp(v.fn, 0, 1)) === 1;
      const a = 0;
      const b = useCos ? Math.PI / 2 : 1;
      const f = useCos ? Math.cos : ((t) => Math.exp(-t));
      const exact = useCos ? 1 : 1 - Math.exp(-1);

      const quad = (N, r) => {
        const h = (b - a) / N;
        let s = 0;
        for (let i = 0; i < N; i += 1) {
          let x = a + i * h;
          if (r === 1) x += 0.5 * h;
          if (r === 2) x += h;
          s += f(x);
        }
        return s * h;
      };

      const series = [];
      for (let N = 2; N <= 128; N *= 2) {
        const approx = quad(N, rule);
        const err = Math.abs(approx - exact);
        series.push({
          x: Math.log10(N),
          y: Math.log10(err + 1e-18),
          highlight: N === Nfocus || Math.abs(Math.log10(N) - Math.log10(Nfocus)) < 0.15,
        });
      }
      const approx = quad(Nfocus, rule);
      const names = ['left', 'mid', 'right'];
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E| vs log₁₀ N',
        series,
        stats: [
          {label: 'rule', value: names[rule]},
          {label: 'fn', value: useCos ? 'cos [0,π/2]' : 'e^{-t} [0,1]'},
          {label: 'approx', value: fmt(approx, 8)},
          {label: 'exact', value: fmt(exact, 8)},
          {label: '|E|', value: Math.abs(approx - exact).toExponential(2)},
        ],
        note: 'All quadrature rules are weighted sums Σ fᵢ wᵢ. Equal-width left/right boxes are O(h); midpoint is typically better on smooth f.',
      };
    },
  },

  trapSimpsonError: {
    id: 'trapSimpsonError',
    title: 'Trapezoid vs Simpson error',
    subtitle: 'O(h²) trap vs O(h⁴) Simpson — until round-off',
    formula: '$\\mathcal{E}_{\\mathrm{trap}}\\sim O(h^{2}),\\quad \\mathcal{E}_{\\mathrm{simp}}\\sim O(h^{4})$',
    params: [
      {
        key: 'N',
        label: 'panels N',
        meaning: 'Even N recommended (Simpson needs even). Highlight this N on the log–log curve.',
        min: 2,
        max: 256,
        step: 2,
        default: 10,
      },
      {
        key: 'fn',
        label: 'integrand',
        meaning: '0 = e^{-x} on [0,1]. 1 = cos x on [0, π/2].',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      const N = Math.max(2, Math.floor(clamp(v.N, 2, 256)));
      return `N=${N}. Simpson should sit well below trapezoid until floating-point noise flattens the floor. Best N is finite — not ∞.`;
    },
    compute(v) {
      const Nfocus = Math.max(2, Math.floor(clamp(v.N, 2, 256)));
      const evenFocus = Nfocus % 2 === 0 ? Nfocus : Nfocus + 1;
      const useCos = Math.floor(clamp(v.fn, 0, 1)) === 1;
      const a = 0;
      const b = useCos ? Math.PI / 2 : 1;
      const f = useCos ? Math.cos : ((t) => Math.exp(-t));
      const exact = useCos ? 1 : 1 - Math.exp(-1);

      const trap = (N) => {
        const h = (b - a) / N;
        let s = 0.5 * (f(a) + f(b));
        for (let i = 1; i < N; i += 1) s += f(a + i * h);
        return s * h;
      };
      const simp = (N) => {
        const n = N % 2 === 0 ? N : N + 1;
        const h = (b - a) / n;
        let s = f(a) + f(b);
        for (let i = 1; i < n; i += 2) s += 4 * f(a + i * h);
        for (let i = 2; i < n; i += 2) s += 2 * f(a + i * h);
        return (s * h) / 3;
      };

      const series = [];
      for (let N = 2; N <= 256; N *= 2) {
        const errS = Math.abs(simp(N) - exact);
        series.push({
          x: Math.log10(N),
          y: Math.log10(errS + 1e-18),
          highlight: Math.abs(Math.log10(N) - Math.log10(evenFocus)) < 0.15,
        });
      }
      const T = trap(evenFocus);
      const S = simp(evenFocus);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E_Simpson| vs log₁₀ N',
        series,
        stats: [
          {label: 'fn', value: useCos ? 'cos' : 'e^{-x}'},
          {label: 'N', value: String(evenFocus)},
          {label: '|E_trap|', value: Math.abs(T - exact).toExponential(2)},
          {label: '|E_simp|', value: Math.abs(S - exact).toExponential(2)},
          {label: 'E_simp/E_trap', value: (Math.abs(S - exact) / Math.max(Math.abs(T - exact), 1e-30)).toExponential(2)},
        ],
        note: 'Simpson slope ≈ −4 on log–log until round-off. Trapezoid (in stats) is ≈ −2. Huge N is not free accuracy.',
      };
    },
  },

  rombergExtra: {
    id: 'rombergExtra',
    title: 'Romberg extrapolation',
    subtitle: 'A ≈ (4 A(h/2) − A(h))/3 cancels the O(h²) trapezoid term',
    formula: '$A\\simeq\\dfrac{4}{3}A(h/2)-\\dfrac{1}{3}A(h)$',
    params: [
      {
        key: 'N',
        label: 'coarse panels N',
        meaning: 'A(h) uses N trapezoid panels; A(h/2) uses 2N.',
        min: 2,
        max: 64,
        step: 2,
        default: 4,
      },
      {
        key: 'fn',
        label: 'integrand',
        meaning: '0 = e^{-x} on [0,1]. 1 = cos x on [0, π/2].',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
      },
    ],
    example() {
      return 'Same Richardson idea as extrapolated differences: combine two trapezoid runs to kill α h².';
    },
    compute(v) {
      const N = Math.max(2, Math.floor(clamp(v.N, 2, 64)));
      const useCos = Math.floor(clamp(v.fn, 0, 1)) === 1;
      const a = 0;
      const b = useCos ? Math.PI / 2 : 1;
      const f = useCos ? Math.cos : ((t) => Math.exp(-t));
      const exact = useCos ? 1 : 1 - Math.exp(-1);
      const trap = (panels) => {
        const h = (b - a) / panels;
        let s = 0.5 * (f(a) + f(b));
        for (let i = 1; i < panels; i += 1) s += f(a + i * h);
        return s * h;
      };
      const Ah = trap(N);
      const Ah2 = trap(2 * N);
      const R = (4 * Ah2 - Ah) / 3;
      const series = [];
      for (let n = 2; n <= 64; n *= 2) {
        const r = (4 * trap(2 * n) - trap(n)) / 3;
        const err = Math.abs(r - exact);
        series.push({
          x: Math.log10(n),
          y: Math.log10(err + 1e-18),
          highlight: n === N,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E_Romberg| vs log₁₀ N_coarse',
        series,
        stats: [
          {label: 'A(h)', value: fmt(Ah, 8)},
          {label: 'A(h/2)', value: fmt(Ah2, 8)},
          {label: 'Romberg', value: fmt(R, 8)},
          {label: '|E_R|', value: Math.abs(R - exact).toExponential(2)},
          {label: '|E_trap|', value: Math.abs(Ah - exact).toExponential(2)},
        ],
        note: 'Works while the h² term dominates. Sum of weights for any correct rule must equal b−a.',
      };
    },
  },

  gaussLegendre: {
    id: 'gaussLegendre',
    title: 'Gauss–Legendre vs equal spacing',
    subtitle: 'N nodes exact for degree ≤ 2N−1 when g is a polynomial',
    formula: '$\\displaystyle\\int_a^b f\\simeq\\sum_{i=1}^{N} w_i f(x_i)\\quad\\text{(Gauss nodes)}$',
    params: [
      {
        key: 'N',
        label: 'N (Gauss)',
        meaning: 'Number of Gauss–Legendre nodes (2–6 tabulated here).',
        min: 2,
        max: 6,
        step: 1,
        default: 4,
      },
      {
        key: 'fn',
        label: 'integrand',
        meaning: '0 = e^{-x} on [0,1]. 1 = cos x on [0, π/2].',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      const N = Math.max(2, Math.min(6, Math.floor(clamp(v.N, 2, 6))));
      return `N=${N} Gauss nodes. Compare |E| to trapezoid/Simpson using the same N panels.`;
    },
    compute(v) {
      const N = Math.max(2, Math.min(6, Math.floor(clamp(v.N, 2, 6))));
      const useCos = Math.floor(clamp(v.fn, 0, 1)) === 1;
      const a = 0;
      const b = useCos ? Math.PI / 2 : 1;
      const f = useCos ? Math.cos : ((t) => Math.exp(-t));
      const exact = useCos ? 1 : 1 - Math.exp(-1);
      const {nodes, weights} = gaussLegendreNW(N);
      const mid = 0.5 * (a + b);
      const half = 0.5 * (b - a);
      let G = 0;
      for (let i = 0; i < nodes.length; i += 1) {
        const x = mid + half * nodes[i];
        const w = half * weights[i];
        G += w * f(x);
      }
      const trap = (panels) => {
        const h = (b - a) / panels;
        let s = 0.5 * (f(a) + f(b));
        for (let i = 1; i < panels; i += 1) s += f(a + i * h);
        return s * h;
      };
      const simp = (panels) => {
        const n = panels % 2 === 0 ? panels : panels + 1;
        const h = (b - a) / n;
        let s = f(a) + f(b);
        for (let i = 1; i < n; i += 2) s += 4 * f(a + i * h);
        for (let i = 2; i < n; i += 2) s += 2 * f(a + i * h);
        return (s * h) / 3;
      };
      const T = trap(N);
      const S = simp(N);
      const series = [];
      for (let n = 2; n <= 6; n += 1) {
        const {nodes: yn, weights: wn} = gaussLegendreNW(n);
        let g = 0;
        for (let i = 0; i < yn.length; i += 1) {
          g += half * wn[i] * f(mid + half * yn[i]);
        }
        series.push({
          x: n,
          y: Math.log10(Math.abs(g - exact) + 1e-18),
          highlight: n === N,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E_Gauss| vs N',
        series,
        stats: [
          {label: 'N', value: String(N)},
          {label: '|E_Gauss|', value: Math.abs(G - exact).toExponential(2)},
          {label: '|E_trap|', value: Math.abs(T - exact).toExponential(2)},
          {label: '|E_simp|', value: Math.abs(S - exact).toExponential(2)},
          {label: 'approx', value: fmt(G, 10)},
        ],
        note: 'Nodes are Legendre zeros (not endpoints). Same N usually favors Gauss on smooth g.',
      };
    },
  },

  mcStonePi: {
    id: 'mcStonePi',
    title: 'Stone-throwing π',
    subtitle: 'Hits in the unit disk over a square of side 2 — π ≈ 4 hits/N',
    formula: '$\\pi\\simeq 4\\,N_{\\mathrm{hit}}/N,\\quad (x,y)\\in[-1,1]^{2}$',
    params: [
      {
        key: 'N',
        label: 'throws N',
        meaning: 'Number of uniform stones in the square. Highlight this N on the log–log error curve.',
        min: 64,
        max: 16384,
        step: 64,
        default: 1024,
      },
      {
        key: 'seed',
        label: 'LCG seed',
        meaning: 'Chapter LCG: r ← (1103515245 r + 12345) % 2³¹, then r/2³¹.',
        min: 1,
        max: 20,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const N = Math.max(64, Math.floor(clamp(v.N, 64, 16384)));
      const seed = Math.max(1, Math.floor(clamp(v.seed, 1, 20)));
      return `N=${N} throws from seed ${seed}. Area ratio → π; |E| should fall roughly like 1/√N until the generator’s lattice shows.`;
    },
    compute(v) {
      const Nfocus = Math.max(64, Math.floor(clamp(v.N, 64, 16384)));
      const seed = Math.max(1, Math.floor(clamp(v.seed, 1, 20)));
      const runPi = (N) => {
        const xs = lcgFloatSeq(seed, 2 * N);
        let hits = 0;
        for (let i = 0; i < N; i += 1) {
          const x = 2 * xs[2 * i] - 1;
          const y = 2 * xs[2 * i + 1] - 1;
          if (x * x + y * y <= 1) hits += 1;
        }
        return {pi: (4 * hits) / N, hits};
      };
      const focus = runPi(Nfocus);
      const series = [];
      for (let N = 64; N <= 16384; N *= 2) {
        const {pi} = runPi(N);
        const err = Math.abs(pi - Math.PI);
        series.push({
          x: Math.log10(N),
          y: Math.log10(err + 1e-18),
          highlight: Math.abs(Math.log10(N) - Math.log10(Nfocus)) < 0.2,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |π̂−π| vs log₁₀ N',
        series,
        stats: [
          {label: 'N', value: String(Nfocus)},
          {label: 'hits', value: String(focus.hits)},
          {label: 'π̂', value: fmt(focus.pi, 6)},
          {label: '|E|', value: Math.abs(focus.pi - Math.PI).toExponential(2)},
          {label: '1/√N', value: (1 / Math.sqrt(Nfocus)).toExponential(2)},
        ],
        note: 'Slope ≈ −1/2 on log–log matches statistical √N sampling. Deterministic trap/Simpson beat this in 1D; high-D flips the story.',
      };
    },
  },

  mcMeanValue: {
    id: 'mcMeanValue',
    title: 'Mean-value Monte Carlo',
    subtitle: 'I ≈ (b−a)⟨f⟩ with σ_I ∼ σ_f / √N',
    formula: '$I=(b-a)\\langle f\\rangle,\\quad \\langle f\\rangle\\approx\\dfrac{1}{N}\\sum f(x_i)$',
    params: [
      {
        key: 'N',
        label: 'samples N',
        meaning: 'Uniform samples on [0,1] for ∫ e^{-x} dx. Highlight this N on the error curve.',
        min: 64,
        max: 16384,
        step: 64,
        default: 1000,
      },
      {
        key: 'seed',
        label: 'LCG seed',
        meaning: 'Chapter LCG seed (same recurrence as the graded labs).',
        min: 1,
        max: 20,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const N = Math.max(64, Math.floor(clamp(v.N, 64, 16384)));
      return `Mean-value MC of e^{-x} on [0,1] with N=${N}. Exact I = 1−e^{-1}. Error falls ~1/√N.`;
    },
    compute(v) {
      const Nfocus = Math.max(64, Math.floor(clamp(v.N, 64, 16384)));
      const seed = Math.max(1, Math.floor(clamp(v.seed, 1, 20)));
      const exact = 1 - Math.exp(-1);
      const runMean = (N) => {
        const xs = lcgFloatSeq(seed, N);
        let s = 0;
        let s2 = 0;
        for (let i = 0; i < N; i += 1) {
          const fi = Math.exp(-xs[i]);
          s += fi;
          s2 += fi * fi;
        }
        const mean = s / N;
        const varf = Math.max(0, s2 / N - mean * mean);
        return {I: mean, sigmaI: Math.sqrt(varf / N)};
      };
      const focus = runMean(Nfocus);
      const series = [];
      for (let N = 64; N <= 16384; N *= 2) {
        const {I} = runMean(N);
        const err = Math.abs(I - exact);
        series.push({
          x: Math.log10(N),
          y: Math.log10(err + 1e-18),
          highlight: Math.abs(Math.log10(N) - Math.log10(Nfocus)) < 0.2,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |Î−I| vs log₁₀ N',
        series,
        stats: [
          {label: 'N', value: String(Nfocus)},
          {label: 'Î', value: fmt(focus.I, 10)},
          {label: 'exact', value: fmt(exact, 10)},
          {label: '|E|', value: Math.abs(focus.I - exact).toExponential(2)},
          {label: 'σ_I est', value: focus.sigmaI.toExponential(2)},
        ],
        note: 'Same 1/√N law in any dimension. Trap/Simpson/Gauss win in low D; the crossover sits near D≈3–4.',
      };
    },
  },

  mcControlVariate: {
    id: 'mcControlVariate',
    title: 'Control-variate Monte Carlo',
    subtitle: 'Plain ⟨e^{-x}⟩ vs residual + J for g=1−x on [0,1]',
    formula:
      '$I\\simeq\\dfrac{1}{N}\\sum\\bigl(e^{-x_i}-(1-x_i)\\bigr)+\\dfrac{1}{2}$',
    params: [
      {
        key: 'N',
        label: 'samples N',
        meaning: 'Shared chapter-LCG stream for plain and CV estimates of ∫₀¹ e^{-x} dx.',
        min: 64,
        max: 16384,
        step: 64,
        default: 1000,
      },
      {
        key: 'seed',
        label: 'LCG seed',
        meaning: 'Chapter LCG: advance then draw r/2³¹.',
        min: 1,
        max: 20,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const N = Math.max(64, Math.floor(clamp(v.N, 64, 16384)));
      return `Same N=${N} samples: plain mean of e^{-x} vs CV with g=1−x, J=1/2. CV should cut |E| when g tracks f.`;
    },
    compute(v) {
      const Nfocus = Math.max(64, Math.floor(clamp(v.N, 64, 16384)));
      const seed = Math.max(1, Math.floor(clamp(v.seed, 1, 20)));
      const exact = 1 - Math.exp(-1);
      const runBoth = (N) => {
        const xs = lcgFloatSeq(seed, N);
        let sF = 0;
        let sRes = 0;
        for (let i = 0; i < N; i += 1) {
          const x = xs[i];
          const fx = Math.exp(-x);
          sF += fx;
          sRes += fx - (1 - x);
        }
        return {plain: sF / N, cv: sRes / N + 0.5};
      };
      const focus = runBoth(Nfocus);
      const series = [];
      for (let N = 64; N <= 16384; N *= 2) {
        const {plain, cv} = runBoth(N);
        const mid = Math.log10(N);
        // Blue = plain |E|; orange highlight = CV |E|.
        series.push({
          x: mid,
          y: Math.log10(Math.abs(plain - exact) + 1e-18),
          highlight: false,
        });
        series.push({
          x: mid,
          y: Math.log10(Math.abs(cv - exact) + 1e-18),
          highlight: true,
        });
      }
      return {
        chartType: 'scatter',
        yLabel: 'log₁₀ |Î−I| vs log₁₀ N (orange=CV)',
        series,
        stats: [
          {label: 'N', value: String(Nfocus)},
          {label: 'plain', value: fmt(focus.plain, 10)},
          {label: 'CV', value: fmt(focus.cv, 10)},
          {label: '|E_plain|', value: Math.abs(focus.plain - exact).toExponential(2)},
          {label: '|E_CV|', value: Math.abs(focus.cv - exact).toExponential(2)},
        ],
        note: 'Orange = CV, blue = plain. Lower residual variance ⇒ smaller Monte Carlo error at the same N.',
      };
    },
  },

  mcRejection: {
    id: 'mcRejection',
    title: 'von Neumann rejection',
    subtitle: 'Throw under a box of height w₀; keep points under w(x)',
    formula: '$(x,W)=(U,w_0 V);\\;\\mathrm{accept\\ if\\ }W\\le w(x)$',
    params: [
      {
        key: 'Nthrows',
        label: 'throws',
        meaning: 'Number of box throws. Each throw uses two chapter-LCG uniforms.',
        min: 64,
        max: 4096,
        step: 64,
        default: 1000,
      },
      {
        key: 'seed',
        label: 'LCG seed',
        meaning: 'Chapter LCG seed for the rejection stream.',
        min: 1,
        max: 20,
        step: 1,
        default: 1,
      },
      {
        key: 'shape',
        label: 'w shape',
        meaning: '1 → w(x)=2x on [0,1]; 2 → w(x)=2(1−x). Box height w₀=2 in both cases.',
        min: 1,
        max: 2,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const N = Math.max(64, Math.floor(clamp(v.Nthrows, 64, 4096)));
      const shape = Math.max(1, Math.floor(clamp(v.shape, 1, 2)));
      const name = shape === 1 ? 'w=2x' : 'w=2(1−x)';
      return `${N} throws under ${name}, w₀=2. Acceptance rate ≈ area(w)/area(box).`;
    },
    compute(v) {
      const Nfocus = Math.max(64, Math.floor(clamp(v.Nthrows, 64, 4096)));
      const seed = Math.max(1, Math.floor(clamp(v.seed, 1, 20)));
      const shape = Math.max(1, Math.floor(clamp(v.shape, 1, 2)));
      const w0 = 2;
      const wAt = (x) => (shape === 1 ? 2 * x : 2 * (1 - x));
      const run = (Nthrows) => {
        const uv = lcgFloatSeq(seed, 2 * Nthrows);
        let hits = 0;
        const pts = [];
        for (let i = 0; i < Nthrows; i += 1) {
          const x = uv[2 * i];
          const W = w0 * uv[2 * i + 1];
          const ok = W <= wAt(x);
          if (ok) hits += 1;
          if (i < 120) {
            pts.push({x, y: W, highlight: ok});
          }
        }
        return {hits, rate: hits / Nthrows, pts};
      };
      const focus = run(Nfocus);
      const curve = [];
      for (let i = 0; i <= 40; i += 1) {
        const x = i / 40;
        curve.push({x, y: wAt(x), highlight: false, series: 'w'});
      }
      const series = [
        ...curve,
        ...focus.pts.map((p) => ({
          x: p.x,
          y: p.y,
          highlight: p.highlight,
          series: p.highlight ? 'accept' : 'reject',
        })),
      ];
      return {
        chartType: 'scatter',
        yLabel: 'W vs x (curve = w)',
        series,
        stats: [
          {label: 'throws', value: String(Nfocus)},
          {label: 'accepted', value: String(focus.hits)},
          {label: 'rate', value: fmt(focus.rate, 6)},
          {label: 'w₀', value: String(w0)},
          {label: 'w', value: shape === 1 ? '2x' : '2(1−x)'},
        ],
        note: 'Accepted x ~ w. Feed them into ⟨f/w⟩ for importance sampling (labs use inverse CDF when available).',
      };
    },
  },

  besselUpDown: {
    id: 'besselUpDown',
    title: 'Upward vs downward j_ℓ',
    subtitle: 'Relative difference grows with ℓ when upward cancels',
    formula: '$\\delta_{\\ell}=\\dfrac{|j^{\\mathrm{up}}-j^{\\mathrm{down}}|}{|j^{\\mathrm{up}}|+|j^{\\mathrm{down}}|}$',
    params: [
      {
        key: 'x',
        label: 'x',
        meaning: 'At small x, j_ℓ becomes tiny fast — upward dies early. At larger x both methods agree longer.',
        min: 0.1,
        max: 20,
        step: 0.1,
        default: 1,
      },
      {
        key: 'L',
        label: 'max ℓ',
        meaning: 'Highest order to compare.',
        min: 5,
        max: 40,
        step: 1,
        default: 25,
      },
    ],
    example(v) {
      const x = clamp(v.x, 0.1, 20);
      const L = Math.max(5, Math.floor(v.L));
      const up = besselUp(x, L);
      const down = besselDown(x, L, L + 30);
      const mid = Math.min(L, 8);
      const rel = Math.abs(up[mid] - down[mid]) / (Math.abs(up[mid]) + Math.abs(down[mid]) + 1e-30);
      return `x=${fmt(x, 2)}, ℓ=${mid}: relative |up−down|/(|up|+|down|) ≈ ${rel.toExponential(2)}.`;
    },
    compute(v) {
      const x = clamp(v.x, 0.1, 20);
      const L = Math.max(5, Math.floor(v.L));
      const up = besselUp(x, L);
      const down = besselDown(x, L, L + 30);
      const series = [];
      for (let ell = 0; ell <= L; ell += 1) {
        const rel = Math.abs(up[ell] - down[ell]) / (Math.abs(up[ell]) + Math.abs(down[ell]) + 1e-30);
        series.push({x: ell, y: logAbs(rel), highlight: ell === Math.min(L, 8)});
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀ relative |up − down|',
        series,
        stats: [
          {label: 'j₃ down', value: down[Math.min(3, L)].toExponential(4)},
          {label: 'j₅ down', value: down[Math.min(5, L)].toExponential(4)},
          {label: 'j₈ down', value: down[Math.min(8, L)].toExponential(4)},
          {label: 'up j₈', value: up[Math.min(8, L)].toExponential(4)},
        ],
        note: 'When j_ℓ is still O(1), up and down agree. Once upward has cancelled into n_ℓ garbage, the relative difference → 1.',
      };
    },
  },

  bisectionSearch: {
    id: 'bisectionSearch',
    title: 'Bisection (interval halving)',
    subtitle: 'Bracket shrinks by 1/2 each step while f(x−)f(x+) stays negative',
    formula: '$x=\\dfrac{x_{-}+x_{+}}{2},\\quad\\text{keep the half with }f(x_{-})f(x)<0$',
    params: [
      {
        key: 'fn',
        label: 'f',
        meaning: '0: x³−x−2 on [1,2]. 1: (x−√2) on [1,2]. 2: cos(x) on [0,2].',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
      },
      {
        key: 'steps',
        label: 'halvings N',
        meaning: 'How many bisection steps to show. Width → W/2ᴺ.',
        min: 1,
        max: 24,
        step: 1,
        default: 8,
      },
    ],
    example(v) {
      const N = Math.max(1, Math.floor(v.steps));
      const which = Math.floor(clamp(v.fn, 0, 2));
      const names = ['x³−x−2', 'x−√2', 'cos x'];
      return `After N=${N} steps on ${names[which]}, the surviving bracket half-width is initial_width/2^N.`;
    },
    compute(v) {
      const which = Math.floor(clamp(v.fn, 0, 2));
      const N = Math.max(1, Math.floor(v.steps));
      const specs = [
        {f: (x) => x * x * x - x - 2, a0: 1, b0: 2, root: 1.5213797068},
        {f: (x) => x - Math.SQRT2, a0: 1, b0: 2, root: Math.SQRT2},
        {f: (x) => Math.cos(x), a0: 0, b0: 2, root: Math.PI / 2},
      ];
      const {f, a0, b0, root} = specs[which];
      let a = a0;
      let b = b0;
      let fa = f(a);
      const history = [];
      for (let i = 0; i < N; i += 1) {
        const m = 0.5 * (a + b);
        const fm = f(m);
        history.push({n: i + 1, a, b, m, width: b - a});
        if (fa * fm <= 0) {
          b = m;
        } else {
          a = m;
          fa = fm;
        }
      }
      const mid = 0.5 * (a + b);
      const series = history.map((h) => ({
        x: h.n,
        y: Math.log10(h.width + 1e-18),
        highlight: h.n === N,
      }));
      return {
        chartType: 'line',
        yLabel: 'log₁₀ (bracket width) vs step',
        series,
        stats: [
          {label: 'x−', value: fmt(a, 8)},
          {label: 'x₊', value: fmt(b, 8)},
          {label: 'mid', value: fmt(mid, 8)},
          {label: '|mid−root|', value: Math.abs(mid - root).toExponential(2)},
        ],
        note: 'Linear convergence: each step cuts the uncertainty in half. Safe whenever a continuous f changes sign on the bracket.',
      };
    },
  },

  squareWellEven: {
    id: 'squareWellEven',
    title: 'Even square-well residual g(E)',
    subtitle: 'g(E)=√E cot√(V₀−E) − √(V₀−E); root = bound energy',
    formula: '$g(E)=\\sqrt{E}\\,\\cot\\sqrt{V_0-E}-\\sqrt{V_0-E}=0$',
    params: [
      {
        key: 'V0',
        label: 'V₀',
        meaning: 'Well depth. 10 → one even root near 8.59; 20 → first even near 6.11.',
        min: 10,
        max: 20,
        step: 10,
        default: 10,
      },
      {
        key: 'Emark',
        label: 'E mark',
        meaning: 'Highlight this trial energy on the curve (compare to the root).',
        min: 0.5,
        max: 19.5,
        step: 0.1,
        default: 8.6,
      },
    ],
    example(v) {
      const V0 = Math.floor(clamp(v.V0, 10, 20)) >= 15 ? 20 : 10;
      const root = V0 === 10 ? 8.5927852752 : 6.1084670175;
      return `V₀=${V0}: even root ≈ ${root.toFixed(4)}. Slide E mark across a sign-change bracket to see g flip.`;
    },
    compute(v) {
      const V0 = Math.floor(clamp(v.V0, 10, 20)) >= 15 ? 20 : 10;
      const Emark = clamp(v.Emark, 0.5, V0 - 0.05);
      const gEven = (E) => {
        if (E <= 0 || E >= V0) {
          return NaN;
        }
        const ke = Math.sqrt(E);
        const kappa = Math.sqrt(V0 - E);
        const s = Math.sin(kappa);
        if (Math.abs(s) < 1e-12) {
          return NaN;
        }
        return (ke * Math.cos(kappa)) / s - kappa;
      };
      // Prefer a bracket known to trap the first even root.
      let a = V0 === 10 ? 8.0 : 5.5;
      let b = V0 === 10 ? 8.8 : 7.0;
      let fa = gEven(a);
      const eps = 1e-12;
      while ((b - a) / 2 > eps) {
        const m = 0.5 * (a + b);
        const fm = gEven(m);
        if (fa * fm <= 0) {
          b = m;
        } else {
          a = m;
          fa = fm;
        }
      }
      const root = 0.5 * (a + b);
      const series = [];
      const lo = 0.2;
      const hi = V0 - 0.05;
      const nPts = 120;
      for (let i = 0; i <= nPts; i += 1) {
        const E = lo + ((hi - lo) * i) / nPts;
        const y = gEven(E);
        if (!Number.isFinite(y) || Math.abs(y) > 40) {
          continue;
        }
        series.push({
          x: E,
          y,
          highlight: Math.abs(E - Emark) < (hi - lo) / nPts || Math.abs(E - root) < 0.04,
        });
      }
      const gMark = gEven(Emark);
      return {
        chartType: 'line',
        yLabel: 'g(E) vs E',
        series,
        stats: [
          {label: 'V₀', value: String(V0)},
          {label: 'E_B', value: root.toFixed(10)},
          {label: 'g(E_B)', value: Math.abs(gEven(root)).toExponential(2)},
          {label: 'g(mark)', value: Number.isFinite(gMark) ? fmt(gMark, 4) : 'pole'},
        ],
        note: 'Zeros of g are even bound energies. Skip neighborhoods of sin√(V₀−E)=0 (poles). V₀=20 also has a higher even root near ~18.36.',
      };
    },
  },

  newtonRaphson: {
    id: 'newtonRaphson',
    title: 'Newton–Raphson (tangent update)',
    subtitle: 'Δx = −f/f′; watch |Δx| drop much faster than bisection’s half-width',
    formula: '$\\Delta x=-\\dfrac{f(x_0)}{f\'(x_0)},\\quad x\\leftarrow x_0+\\Delta x$',
    params: [
      {
        key: 'fn',
        label: 'f',
        meaning: '0: x³−x−2 from 1.5. 1: even well g(E), V₀=10 from 8.5. 2: cos(x) from 1.0.',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
      },
      {
        key: 'steps',
        label: 'Newton steps N',
        meaning: 'How many updates to show. Near a root, |Δx| falls roughly quadratically.',
        min: 1,
        max: 12,
        step: 1,
        default: 5,
      },
    ],
    example(v) {
      const N = Math.max(1, Math.floor(v.steps));
      const which = Math.floor(clamp(v.fn, 0, 2));
      const names = ['x³−x−2', 'g(E) well', 'cos x'];
      return `N=${N} Newton steps on ${names[which]}. Compare the |Δx| curve with bisection’s W/2ᴺ.`;
    },
    compute(v) {
      const which = Math.floor(clamp(v.fn, 0, 2));
      const N = Math.max(1, Math.floor(v.steps));
      const dx = 1e-6;
      const specs = [
        {
          f: (x) => x * x * x - x - 2,
          x0: 1.5,
          root: 1.5213797068,
          clip: null,
        },
        {
          f: (E) => {
            const ke = Math.sqrt(E);
            const kappa = Math.sqrt(10 - E);
            const s = Math.sin(kappa);
            if (Math.abs(s) < 1e-12) {
              return NaN;
            }
            return (ke * Math.cos(kappa)) / s - kappa;
          },
          x0: 8.5,
          root: 8.5927852752,
          clip: [0.05, 9.95],
        },
        {
          f: (x) => Math.cos(x),
          x0: 1.0,
          root: Math.PI / 2,
          clip: null,
        },
      ];
      const {f, x0, root, clip} = specs[which];
      let x = x0;
      const history = [];
      for (let i = 0; i < N; i += 1) {
        const fx = f(x);
        const fp = (f(x + dx) - fx) / dx;
        const step = -fx / (Math.abs(fp) < 1e-18 ? 1e-18 : fp);
        history.push({n: i + 1, x, fx, step: Math.abs(step)});
        x = x + step;
        if (clip) {
          x = Math.min(Math.max(x, clip[0]), clip[1]);
        }
      }
      const series = history.map((h) => ({
        x: h.n,
        y: Math.log10(h.step + 1e-18),
        highlight: h.n === N,
      }));
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |Δx| vs Newton step',
        series,
        stats: [
          {label: 'x₀', value: fmt(x0, 4)},
          {label: 'x_N', value: fmt(x, 8)},
          {label: '|x_N−root|', value: Math.abs(x - root).toExponential(2)},
          {label: '|f(x_N)|', value: Math.abs(f(x)).toExponential(2)},
        ],
        note: 'Fast when the guess sits where f is nearly linear. Flat f′ or a bad start → use backtracking or warm up with bisection.',
      };
    },
  },

  magnetizationSearch: {
    id: 'magnetizationSearch',
    title: 'Mean-field magnetization m(t)',
    subtitle: 'Root-find m − tanh(m/t) = 0; spontaneous m > 0 only for t < 1',
    formula: '$m=\\tanh(m/t),\\quad f(m,t)=m-\\tanh(m/t)$',
    params: [
      {
        key: 't',
        label: 't = T/Tc',
        meaning: 'Reduced temperature. Below 1: ordered branch; at/above 1: m=0 only.',
        min: 0.1,
        max: 1.5,
        step: 0.05,
        default: 0.5,
      },
      {
        key: 'view',
        label: 'view',
        meaning: '0: residual f(m) at this t. 1: full m(t) curve with a mark at this t.',
        min: 0,
        max: 1,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const t = clamp(v.t, 0.1, 1.5);
      if (t >= 1) {
        return `t=${t.toFixed(2)} ≥ 1: only m=0 (paramagnetic).`;
      }
      return `t=${t.toFixed(2)} < 1: nontrivial root of f(m,t)=0 is the spontaneous magnetization.`;
    },
    compute(v) {
      const t = clamp(v.t, 0.1, 1.5);
      const view = Math.floor(clamp(v.view, 0, 1));
      const resid = (m, tt) => m - Math.tanh(m / tt);
      const bisect = (tt) => {
        if (tt >= 1) {
          return 0;
        }
        let a = 1e-4;
        let b = 1;
        let fa = resid(a, tt);
        for (let i = 0; i < 80; i += 1) {
          const mid = 0.5 * (a + b);
          const fm = resid(mid, tt);
          if (fa * fm <= 0) {
            b = mid;
          } else {
            a = mid;
            fa = fm;
          }
        }
        return 0.5 * (a + b);
      };
      const mStar = bisect(t);
      if (view === 0) {
        const series = [];
        for (let i = 0; i <= 100; i += 1) {
          const m = i / 100;
          const y = t < 1e-9 ? m : resid(m, t);
          if (!Number.isFinite(y) || Math.abs(y) > 5) {
            continue;
          }
          series.push({
            x: m,
            y,
            highlight: Math.abs(m - mStar) < 0.02 || m === 0,
          });
        }
        return {
          chartType: 'line',
          yLabel: 'f(m,t) vs m',
          series,
          stats: [
            {label: 't', value: t.toFixed(2)},
            {label: 'm*', value: mStar.toFixed(6)},
            {label: 'f(m*)', value: Math.abs(resid(mStar, Math.max(t, 1e-9))).toExponential(2)},
          ],
          note: 'm=0 is always a root. For t<1 a second crossing gives spontaneous order.',
        };
      }
      const series = [];
      for (let i = 1; i <= 40; i += 1) {
        const ti = (1.5 * i) / 40;
        const mi = bisect(ti);
        series.push({
          x: ti,
          y: mi,
          highlight: Math.abs(ti - t) < 0.04,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'm(t) vs t',
        series,
        stats: [
          {label: 't mark', value: t.toFixed(2)},
          {label: 'm(t)', value: mStar.toFixed(6)},
          {label: 'Tc', value: 't=1'},
        ],
        note: 'Ordered branch falls smoothly toward 0 as t→1⁻, then stays at 0 above Tc.',
      };
    },
  },

  harmonicEulerRk: {
    id: 'harmonicEulerRk',
    title: 'Euler vs RK2 vs analytic (harmonic)',
    subtitle: 'Fixed-step errors on x″=−ω²x with ω=2π, x(0)=0, v(0)=1',
    formula: '$x(t)=A\\sin(\\omega t),\\quad A=1/\\omega$',
    params: [
      {
        key: 'logh',
        label: 'log₁₀ h',
        meaning: 'Step size for marching to t=0.25. Smaller h reduces truncation; too small eventually hits round-off.',
        min: -3,
        max: -1,
        step: 0.1,
        default: -2,
      },
    ],
    example(v) {
      const h = 10 ** clamp(v.logh, -3, -1);
      return `March to t=0.25 with h=${h.toPrecision(3)}. Compare Euler / RK2 displacement to A=1/(2π).`;
    },
    compute(v) {
      const logh = clamp(v.logh, -3, -1);
      const hNow = 10 ** logh;
      const omega = 2 * Math.PI;
      const k = omega * omega;
      const A = 1 / omega;
      const tEnd = 0.25;
      const analytic = A * Math.sin(omega * tEnd);

      const integrate = (method, h) => {
        let x = 0;
        let vel = 1;
        const n = Math.max(1, Math.round(tEnd / h));
        const hh = tEnd / n;
        for (let i = 0; i < n; i += 1) {
          if (method === 'euler') {
            const a = -k * x;
            x += hh * vel;
            vel += hh * a;
          } else {
            const f = (xx, vv) => [vv, -k * xx];
            const [f0, f1] = f(x, vel);
            const k1x = hh * f0;
            const k1v = hh * f1;
            const [g0, g1] = f(x + 0.5 * k1x, vel + 0.5 * k1v);
            x += hh * g0;
            vel += hh * g1;
          }
        }
        return x;
      };

      const series = [];
      for (let lh = -3; lh <= -1.001; lh += 0.1) {
        const h = 10 ** lh;
        const xe = integrate('euler', h);
        series.push({
          x: lh,
          y: Math.log10(Math.abs(xe - analytic) + 1e-16),
          highlight: Math.abs(lh - logh) < 0.06,
        });
      }
      const xE = integrate('euler', hNow);
      const xR = integrate('rk2', hNow);
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |x_Euler(0.25) − analytic| vs log₁₀ h',
        series,
        stats: [
          {label: 'h', value: hNow.toExponential(2)},
          {label: 'analytic', value: analytic.toFixed(10)},
          {label: 'Euler x', value: xE.toFixed(10)},
          {label: 'RK2 x', value: xR.toFixed(10)},
          {label: '|RK2−A|', value: Math.abs(xR - analytic).toExponential(2)},
        ],
        note: 'RK2 sits much closer to A sin(ωt) than Euler at the same h. Labs lock h=0.01.',
      };
    },
  },

  sawtoothFourierSum: {
    id: 'sawtoothFourierSum',
    title: 'Sawtooth Fourier partial sum',
    subtitle: 'Odd ramp y=2t/T on (−T/2,T/2); bn=2(−1)^{n+1}/(nπ)',
    formula: '$y_N(t)=\\sum_{n=1}^{N}\\dfrac{2(-1)^{n+1}}{n\\pi}\\sin(n\\omega t)$',
    params: [
      {
        key: 'N',
        label: 'N (last harmonic)',
        meaning: 'Truncate after harmonic N. Larger N sharpens corners but keeps Gibbs overshoot near jumps.',
        min: 1,
        max: 40,
        step: 1,
        default: 4,
      },
      {
        key: 'tfrac',
        label: 't / T',
        meaning: 'Sample time within one period. At t/T=0.5 the series sits at the jump midpoint (0).',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.25,
      },
    ],
    example(v) {
      const N = Math.round(clamp(v.N, 1, 40));
      const tf = clamp(v.tfrac, 0, 1);
      return `Partial sum with N=${N} at t/T=${tf.toFixed(2)}. True odd ramp on (−1/2,1/2) is y=2(t/T) when |t/T|<1/2.`;
    },
    compute(v) {
      const N = Math.max(1, Math.round(clamp(v.N, 1, 40)));
      const tf = clamp(v.tfrac, 0, 1);
      const pi = Math.PI;
      const partial = (wt, nMax) => {
        let s = 0;
        for (let n = 1; n <= nMax; n += 1) {
          const bn = ((2 / (n * pi)) * ((-1) ** (n + 1)));
          s += bn * Math.sin(n * wt);
        }
        return s;
      };
      const trueOdd = (u) => {
        // u = t/T in [0,1); map to (−0.5,0.5]
        let x = u;
        if (x > 0.5) x -= 1;
        if (Math.abs(x - 0.5) < 1e-12 || Math.abs(x + 0.5) < 1e-12) return 0;
        return 2 * x;
      };
      const series = [];
      for (let i = 0; i <= 100; i += 1) {
        const u = i / 100;
        const wt = 2 * pi * u;
        series.push({
          x: u,
          y: partial(wt, N),
          highlight: Math.abs(u - tf) < 0.008,
        });
      }
      const wtSample = 2 * pi * tf;
      const yN = partial(wtSample, N);
      const yTrue = trueOdd(tf);
      const b1 = 2 / pi;
      return {
        chartType: 'line',
        yLabel: `y_N(t) vs t/T (N=${N})`,
        series,
        stats: [
          {label: 'N', value: String(N)},
          {label: 't/T', value: tf.toFixed(2)},
          {label: 'y_N', value: yN.toFixed(10)},
          {label: 'true ramp', value: yTrue.toFixed(10)},
          {label: '|y_N−true|', value: Math.abs(yN - yTrue).toExponential(2)},
          {label: 'b₁', value: b1.toFixed(10)},
        ],
        note: 'At t/T=1/2 every sin(nπ)=0 → y_N=0 (jump midpoint). Near the jump, raise N to see Gibbs ringing.',
      };
    },
  },

  dftNyquistAlias: {
    id: 'dftNyquistAlias',
    title: 'Sampling rate vs Nyquist / aliasing',
    subtitle: 'Compare sin(πt/2) and sin(2πt) under stride sampling',
    formula: '$s=1/h,\\quad f_{\\mathrm{Nyq}}=s/2$',
    params: [
      {
        key: 'h',
        label: 'sample stride h',
        meaning: 'Time between samples. Large h → low s → aliasing risk for high-f tones.',
        min: 0.25,
        max: 2,
        step: 0.25,
        default: 2,
      },
    ],
    example(v) {
      const h = clamp(v.h, 0.25, 2);
      const s = 1 / h;
      return `Sampling rate s=${s.toFixed(2)}; Nyquist=${(s / 2).toFixed(2)}. High tone f=1; low tone f=0.25.`;
    },
    compute(v) {
      const h = clamp(v.h, 0.25, 2);
      const s = 1 / h;
      const nyq = s / 2;
      const fLo = 0.25;
      const fHi = 1.0;
      const series = [];
      for (let i = 0; i <= 80; i += 1) {
        const t = (i / 80) * 8;
        series.push({
          x: t,
          y: Math.sin(2 * Math.PI * fLo * t),
          highlight: Math.abs((t / h) - Math.round(t / h)) < 1e-9 || Math.abs(t % h) < 1e-9,
        });
      }
      // sample max |hi-lo| on the grid
      let maxDiff = 0;
      const samples = [];
      for (let t = 0; t <= 8 + 1e-9; t += h) {
        const lo = Math.sin(2 * Math.PI * fLo * t);
        const hi = Math.sin(2 * Math.PI * fHi * t);
        maxDiff = Math.max(maxDiff, Math.abs(hi - lo));
        samples.push({t, lo, hi});
      }
      const aliases = fHi > nyq;
      return {
        chartType: 'line',
        yLabel: 'sin(2π·0.25·t) continuous (samples highlighted near grid)',
        series,
        stats: [
          {label: 'h', value: h.toFixed(2)},
          {label: 's', value: s.toFixed(4)},
          {label: 'Nyquist', value: nyq.toFixed(4)},
          {label: 'f_hi', value: fHi.toFixed(2)},
          {label: 'f_hi > Nyq?', value: aliases ? 'yes (alias risk)' : 'no'},
          {label: 'max |hi−lo| on grid', value: maxDiff.toExponential(2)},
          {label: '# samples in [0,8]', value: String(samples.length)},
        ],
        note: 'At h=2, s=0.5 and Nyquist=0.25: the f=1 tone sits far above Nyquist and can impersonate lower bins.',
      };
    },
  },

  rcFilterGain: {
    id: 'rcFilterGain',
    title: 'RC lowpass / highpass |H(ω)|',
    subtitle: 'τ=RC; compare |1/(1+iωτ)| vs |iωτ/(1+iωτ)|',
    formula: '$|H_{\\mathrm{lp}}|=1/\\sqrt{1+(\\omega\\tau)^2}$',
    params: [
      {
        key: 'logwt',
        label: 'log₁₀(ωτ)',
        meaning: 'Dimensionless frequency. ωτ=1 is the corner (|H_lp|=1/√2).',
        min: -2,
        max: 2,
        step: 0.1,
        default: 0,
      },
    ],
    example(v) {
      const wt = 10 ** clamp(v.logwt, -2, 2);
      return `At ωτ=${wt.toPrecision(3)}, compare lowpass and highpass magnitudes.`;
    },
    compute(v) {
      const logwt = clamp(v.logwt, -2, 2);
      const wtNow = 10 ** logwt;
      const series = [];
      for (let lw = -2; lw <= 2.001; lw += 0.1) {
        const wt = 10 ** lw;
        const lp = 1 / Math.sqrt(1 + wt * wt);
        series.push({
          x: lw,
          y: lp,
          highlight: Math.abs(lw - logwt) < 0.06,
        });
      }
      const lp = 1 / Math.sqrt(1 + wtNow * wtNow);
      const hp = Math.abs(wtNow) / Math.sqrt(1 + wtNow * wtNow);
      return {
        chartType: 'line',
        yLabel: '|H_lp| vs log₁₀(ωτ)',
        series,
        stats: [
          {label: 'ωτ', value: wtNow.toExponential(2)},
          {label: '|H_lp|', value: lp.toFixed(10)},
          {label: '|H_hp|', value: hp.toFixed(10)},
          {label: '|H_lp|²', value: (lp * lp).toFixed(10)},
        ],
        note: 'Labs lock ωτ=1 → |H_lp|=|H_hp|=1/√2 ≈ 0.7071067812.',
      };
    },
  },

  fftCostScaling: {
    id: 'fftCostScaling',
    title: 'DFT vs FFT operation count',
    subtitle: 'Compare N² to N log₂ N',
    formula: '$N^{2}\\ \\text{vs}\\ N\\log_2 N$',
    params: [
      {
        key: 'logN',
        label: 'log₂ N',
        meaning: 'Transform length N=2^{log₂ N} (radix-2 friendly).',
        min: 4,
        max: 16,
        step: 1,
        default: 10,
      },
    ],
    example(v) {
      const L = Math.round(clamp(v.logN, 4, 16));
      const N = 2 ** L;
      return `N=${N}: naive ~N² vs FFT ~N log₂ N.`;
    },
    compute(v) {
      const L = Math.max(4, Math.min(16, Math.round(clamp(v.logN, 4, 16))));
      const series = [];
      for (let ell = 4; ell <= 16; ell += 1) {
        const N = 2 ** ell;
        const ratio = N / ell;
        series.push({
          x: ell,
          y: Math.log10(ratio),
          highlight: ell === L,
        });
      }
      const N = 2 ** L;
      const naive = N * N;
      const fft = N * L;
      return {
        chartType: 'line',
        yLabel: 'log₁₀(N² / (N log₂ N)) vs log₂ N',
        series,
        stats: [
          {label: 'N', value: String(N)},
          {label: 'N²', value: naive.toExponential(2)},
          {label: 'N log₂ N', value: fft.toExponential(2)},
          {label: 'ratio', value: (naive / fft).toFixed(1)},
        ],
        note: 'At N=1024 (log₂ N=10) the ratio is 102.4 — locked in the lab.',
      };
    },
  },

  uncertaintyPacket: {
    id: 'uncertaintyPacket',
    title: 'N-cycle burst: Δt Δω',
    subtitle: 'Δt = N·2π/ω₀, Δω = ω₀/N → product ≳ 2π',
    formula: '$\\Delta t\\,\\Delta\\omega \\gtrsim 2\\pi$',
    params: [
      {
        key: 'N',
        label: 'N (cycles)',
        meaning: 'Number of oscillations in the sine burst before it is zeroed.',
        min: 2,
        max: 20,
        step: 1,
        default: 6,
      },
      {
        key: 'omega0',
        label: 'ω₀',
        meaning: 'Carrier frequency of the burst.',
        min: 2,
        max: 12,
        step: 0.5,
        default: 5,
      },
    ],
    example(v) {
      const N = Math.round(clamp(v.N, 2, 20));
      const w0 = clamp(v.omega0, 2, 12);
      return `Burst of N=${N} cycles at ω₀=${w0}. Compare Δt, Δω, and their product to 2π.`;
    },
    compute(v) {
      const N = Math.max(2, Math.round(clamp(v.N, 2, 20)));
      const w0 = clamp(v.omega0, 2, 12);
      const dt = (N * 2 * Math.PI) / w0;
      const dw = w0 / N;
      const prod = dt * dw;
      const series = [];
      for (let n = 2; n <= 20; n += 1) {
        series.push({
          x: n,
          y: (n * 2 * Math.PI) / w0,
          highlight: n === N,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'Δt vs N (fixed ω₀)',
        series,
        stats: [
          {label: 'N', value: String(N)},
          {label: 'ω₀', value: w0.toFixed(2)},
          {label: 'Δt', value: dt.toFixed(10)},
          {label: 'Δω', value: dw.toFixed(10)},
          {label: 'Δt Δω', value: prod.toFixed(10)},
          {label: '2π', value: (2 * Math.PI).toFixed(10)},
          {label: 'C', value: (prod / (2 * Math.PI)).toFixed(10)},
        ],
        note: 'Labs lock N=6, ω₀=5 → product = 2π and C=1 for this width definition.',
      };
    },
  },

  waveletScaleFreq: {
    id: 'waveletScaleFreq',
    title: 'Wavelet scale ↔ frequency',
    subtitle: 'ω = 2π/s ; small s is high frequency / fine detail',
    formula: '$\\omega=2\\pi/s$',
    params: [
      {
        key: 'logs',
        label: 'log₁₀ s',
        meaning: 'Scale of the daughter. Negative log ⇒ s<1 ⇒ higher ω.',
        min: -1,
        max: 1,
        step: 0.1,
        default: 0,
      },
    ],
    example(v) {
      const s = 10 ** clamp(v.logs, -1, 1);
      const w = (2 * Math.PI) / s;
      return `s=${s.toPrecision(3)} maps to ω=${w.toPrecision(3)} (and period 2π/ω=${s.toPrecision(3)}).`;
    },
    compute(v) {
      const logs = clamp(v.logs, -1, 1);
      const sNow = 10 ** logs;
      const series = [];
      for (let ls = -1; ls <= 1.001; ls += 0.1) {
        const s = 10 ** ls;
        series.push({
          x: ls,
          y: Math.log10((2 * Math.PI) / s),
          highlight: Math.abs(ls - logs) < 0.06,
        });
      }
      const w = (2 * Math.PI) / sNow;
      return {
        chartType: 'line',
        yLabel: 'log₁₀ ω vs log₁₀ s',
        series,
        stats: [
          {label: 's', value: sNow.toFixed(6)},
          {label: 'ω', value: w.toFixed(10)},
          {label: '1/√s', value: (1 / Math.sqrt(sNow)).toFixed(10)},
        ],
        note: 'Labs lock s=2 → ω=π and ω=π → s=2.',
      };
    },
  },

  daub4Coeffs: {
    id: 'daub4Coeffs',
    title: 'Daub4 filter taps',
    subtitle: 'c₀…c₃ from orthogonality + vanishing moments',
    formula: '$c_0=(1+\\sqrt{3})/(4\\sqrt{2}),\\ \\ldots$',
    params: [
      {
        key: 'which',
        label: 'coefficient index 0–3',
        meaning: 'Which Daub4 tap to highlight.',
        min: 0,
        max: 3,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      const i = Math.round(clamp(v.which, 0, 3));
      return `Show Daub4 c_${i} and the sum-of-squares / vanishing-moment checks.`;
    },
    compute(v) {
      const i = Math.max(0, Math.min(3, Math.round(clamp(v.which, 0, 3))));
      const s3 = Math.sqrt(3);
      const s2 = Math.sqrt(2);
      const c = [
        (1 + s3) / (4 * s2),
        (3 + s3) / (4 * s2),
        (3 - s3) / (4 * s2),
        (1 - s3) / (4 * s2),
      ];
      const series = c.map((val, idx) => ({
        x: idx,
        y: val,
        highlight: idx === i,
      }));
      const sumsq = c.reduce((a, b) => a + b * b, 0);
      const Hones = c[3] - c[2] + c[1] - c[0];
      const Hramp = 0 * c[3] - 1 * c[2] + 2 * c[1] - 3 * c[0];
      return {
        chartType: 'line',
        yLabel: 'cᵢ vs index',
        series,
        stats: [
          {label: `c_${i}`, value: c[i].toFixed(10)},
          {label: 'Σ c²', value: sumsq.toFixed(10)},
          {label: 'H·[1,1,1,1]', value: Hones.toFixed(10)},
          {label: 'H·[0,1,2,3]', value: Hramp.toFixed(10)},
          {label: 'L·[1,1,1,1]', value: (c[0] + c[1] + c[2] + c[3]).toFixed(10)},
        ],
        note: 'Labs lock c0≈0.4829629131, Σc²=1, H on ramp≈0, L on ones=√2.',
      };
    },
  },
  pca2dDemo: {
    id: 'pca2dDemo',
    title: '2D PCA: λ₁ share',
    subtitle: 'For a 2×2 covariance, slide corr / scales → fraction of variance in PC₁',
    formula: '$C=\\tfrac1{N-1}XX^{T},\\quad \\lambda_1/(\\lambda_1+\\lambda_2)$',
    params: [
      {
        key: 'sx',
        label: 'σₓ',
        meaning: 'Std. deviation along x (√Var x).',
        min: 0.4,
        max: 2,
        step: 0.1,
        default: 0.8,
      },
      {
        key: 'sy',
        label: 'σᵧ',
        meaning: 'Std. deviation along y.',
        min: 0.4,
        max: 2,
        step: 0.1,
        default: 0.85,
      },
      {
        key: 'rho',
        label: 'ρ = corr(x,y)',
        meaning: 'Correlation; cov = ρ σₓ σᵧ.',
        min: -0.95,
        max: 0.95,
        step: 0.05,
        default: 0.9,
      },
    ],
    example(v) {
      const sx = clamp(v.sx, 0.4, 2);
      const sy = clamp(v.sy, 0.4, 2);
      const rho = clamp(v.rho, -0.95, 0.95);
      return `C = [[σₓ², ρσₓσᵧ],[…, σᵧ²]] with σₓ=${fmt(sx, 2)}, σᵧ=${fmt(sy, 2)}, ρ=${fmt(rho, 2)}.`;
    },
    compute(v) {
      const sx = clamp(v.sx, 0.4, 2);
      const sy = clamp(v.sy, 0.4, 2);
      const rho = clamp(v.rho, -0.95, 0.95);
      const a = sx * sx;
      const c = sy * sy;
      const b = rho * sx * sy;
      const tr = a + c;
      const disc = Math.sqrt(Math.max(0, tr * tr - 4 * (a * c - b * b)));
      const l1 = (tr + disc) / 2;
      const l2 = (tr - disc) / 2;
      const share = l1 / (l1 + l2 + 1e-30);
      const series = [];
      for (let r = -0.95; r <= 0.951; r += 0.05) {
        const bb = r * sx * sy;
        const d = Math.sqrt(Math.max(0, tr * tr - 4 * (a * c - bb * bb)));
        const L1 = (tr + d) / 2;
        const L2 = (tr - d) / 2;
        series.push({
          x: r,
          y: L1 / (L1 + L2 + 1e-30),
          highlight: Math.abs(r - rho) < 0.03,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'λ₁ / (λ₁+λ₂) vs ρ',
        series,
        stats: [
          {label: 'Var x', value: a.toFixed(10)},
          {label: 'cov', value: b.toFixed(10)},
          {label: 'Var y', value: c.toFixed(10)},
          {label: 'λ₁', value: l1.toFixed(10)},
          {label: 'λ₂', value: l2.toFixed(10)},
          {label: 'λ₁ share', value: share.toFixed(10)},
        ],
        note: 'Smith demo (labs): λ₁≈1.284, λ₂≈0.049, share ≈ 96%. High |ρ| → most power in PC₁.',
      };
    },
  },
  nnSigmoidNeuron: {
    id: 'nnSigmoidNeuron',
    title: 'Neuron: Σ → sigmoid',
    subtitle: 'y = σ(w₁x₁ + w₂x₂ + b) — slide weights and inputs',
    formula: '$y=\\sigma(w_1 x_1+w_2 x_2+b),\\quad \\sigma(z)=1/(1+e^{-z})$',
    params: [
      {
        key: 'w1',
        label: 'w₁',
        meaning: 'Weight on first input.',
        min: -2,
        max: 2,
        step: 0.1,
        default: -1,
      },
      {
        key: 'w2',
        label: 'w₂',
        meaning: 'Weight on second input.',
        min: -2,
        max: 2,
        step: 0.1,
        default: 1,
      },
      {
        key: 'b',
        label: 'bias b',
        meaning: 'Additive bias before the activation.',
        min: -2,
        max: 2,
        step: 0.1,
        default: 0,
      },
      {
        key: 'x1',
        label: 'x₁',
        meaning: 'First input.',
        min: -5,
        max: 15,
        step: 0.5,
        default: 12,
      },
      {
        key: 'x2',
        label: 'x₂',
        meaning: 'Second input.',
        min: -5,
        max: 15,
        step: 0.5,
        default: 8,
      },
    ],
    example(v) {
      const z = v.w1 * v.x1 + v.w2 * v.x2 + v.b;
      return `Σ=${fmt(z, 3)} → σ(Σ). Try the hand check w=(-1,1), x=(12,8), b=0 → Σ=-4.`;
    },
    compute(v) {
      const w1 = clamp(v.w1, -2, 2);
      const w2 = clamp(v.w2, -2, 2);
      const b = clamp(v.b, -2, 2);
      const x1 = clamp(v.x1, -5, 15);
      const x2 = clamp(v.x2, -5, 15);
      const z = w1 * x1 + w2 * x2 + b;
      const y = 1 / (1 + Math.exp(-z));
      const series = [];
      for (let t = -6; t <= 6.01; t += 0.25) {
        series.push({
          x: t,
          y: 1 / (1 + Math.exp(-t)),
          highlight: Math.abs(t - z) < 0.2,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'σ(z) vs z',
        series,
        stats: [
          {label: 'Σ', value: z.toFixed(10)},
          {label: 'y=σ(Σ)', value: y.toFixed(10)},
          {label: 'σ′(Σ)', value: (y * (1 - y)).toFixed(10)},
        ],
        note: 'Labs lock Σ=-4 for the textbook hand check; σ(0)=0.5.',
      };
    },
  },
  nnLossSgd: {
    id: 'nnLossSgd',
    title: 'SGD: one weight step',
    subtitle: 'w ← w − η ∂ℒ/∂w — watch the update size',
    formula: '$w^{\\mathrm{new}}=w-\\eta\\,\\partial\\mathcal{L}/\\partial w$',
    params: [
      {
        key: 'w',
        label: 'w',
        meaning: 'Current weight.',
        min: -2,
        max: 2,
        step: 0.05,
        default: 1,
      },
      {
        key: 'grad',
        label: '∂ℒ/∂w',
        meaning: 'Loss gradient w.r.t. this weight.',
        min: -0.1,
        max: 0.1,
        step: 0.005,
        default: 0.0215,
      },
      {
        key: 'eta',
        label: 'η',
        meaning: 'Learning rate.',
        min: 0.05,
        max: 2,
        step: 0.05,
        default: 0.5,
      },
    ],
    example(v) {
      return `Step Δw = −η·grad = ${fmt(-v.eta * v.grad, 4)}.`;
    },
    compute(v) {
      const w = clamp(v.w, -2, 2);
      const g = clamp(v.grad, -0.1, 0.1);
      const eta = clamp(v.eta, 0.05, 2);
      const wNew = w - eta * g;
      const series = [];
      for (let e = 0.05; e <= 2.001; e += 0.05) {
        series.push({
          x: e,
          y: w - e * g,
          highlight: Math.abs(e - eta) < 0.03,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'w_new vs η',
        series,
        stats: [
          {label: 'w', value: w.toFixed(10)},
          {label: '∂ℒ/∂w', value: g.toFixed(10)},
          {label: 'η', value: eta.toFixed(10)},
          {label: 'w_new', value: wNew.toFixed(10)},
          {label: 'Δw', value: (-eta * g).toFixed(10)},
        ],
        note: 'Lab lock: w=1, η=0.5, grad≈0.02147 → w_new≈0.9893.',
      };
    },
  },
  nnMassExcess: {
    id: 'nnMassExcess',
    title: 'Nuclear mass excess',
    subtitle: 'Δ = (M − A) × 931.494028 MeV/c² — slide M for fixed A',
    formula: '$\\Delta=(M-A)\\times 931.494028$',
    params: [
      {
        key: 'M',
        label: 'M (u)',
        meaning: 'Atomic mass in Daltons.',
        min: 1.0,
        max: 7.1,
        step: 0.001,
        default: 1.008,
      },
      {
        key: 'A',
        label: 'A',
        meaning: 'Mass number (integer-ish).',
        min: 1,
        max: 7,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const d = (v.M - v.A) * 931.494028;
      return `M=${fmt(v.M, 6)} u, A=${Math.round(v.A)} → Δ≈${fmt(d, 4)} MeV/c².`;
    },
    compute(v) {
      const M = clamp(v.M, 1.0, 7.1);
      const A = Math.round(clamp(v.A, 1, 7));
      const factor = 931.494028;
      const excess = (M - A) * factor;
      const series = [];
      for (let a = 1; a <= 7; a += 1) {
        const approxM = a + excess / factor;
        series.push({
          x: a,
          y: (approxM - a) * factor,
          highlight: a === A,
        });
      }
      // Better series: excess vs A at fixed (M-A) offset using current excess
      const offset = M - A;
      const series2 = [];
      for (let a = 1; a <= 7; a += 1) {
        series2.push({
          x: a,
          y: offset * factor,
          highlight: a === A,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'Δ (MeV/c²) at current (M−A)',
        series: series2,
        stats: [
          {label: 'M (u)', value: M.toFixed(10)},
          {label: 'A', value: String(A)},
          {label: 'M−A', value: (M - A).toFixed(10)},
          {label: 'Δ (MeV/c²)', value: excess.toFixed(10)},
        ],
        note: 'Labs lock ¹H: M=1.007827032 → Δ≈7.2908335650 MeV/c².',
      };
    },
  },
  nnKmeans1d: {
    id: 'nnKmeans1d',
    title: '1D k-means assign',
    subtitle: 'Slide a mass between three centroids — watch the nearest label',
    formula: '$\\mathrm{label}=\\arg\\min_j (x-c_j)^2$',
    params: [
      {
        key: 'x',
        label: 'mass x',
        meaning: 'Particle mass (MeV/c²).',
        min: 0,
        max: 1700,
        step: 10,
        default: 140,
      },
      {
        key: 'c0',
        label: 'c₀',
        meaning: 'Centroid 0.',
        min: 0,
        max: 400,
        step: 10,
        default: 100,
      },
      {
        key: 'c1',
        label: 'c₁',
        meaning: 'Centroid 1.',
        min: 200,
        max: 900,
        step: 10,
        default: 600,
      },
      {
        key: 'c2',
        label: 'c₂',
        meaning: 'Centroid 2.',
        min: 800,
        max: 1700,
        step: 20,
        default: 1200,
      },
    ],
    example(v) {
      const cs = [v.c0, v.c1, v.c2];
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < 3; i += 1) {
        const d = (v.x - cs[i]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return `x=${fmt(v.x, 1)} → nearest centroid index ${best} (d²=${fmt(bestD, 1)}).`;
    },
    compute(v) {
      const x = clamp(v.x, 0, 1700);
      const cs = [clamp(v.c0, 0, 400), clamp(v.c1, 200, 900), clamp(v.c2, 800, 1700)];
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < 3; i += 1) {
        const d = (x - cs[i]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      const series = cs.map((c, i) => ({
        x: c,
        y: (x - c) ** 2,
        highlight: i === best,
      }));
      return {
        chartType: 'line',
        yLabel: '(x−c)² vs centroid location',
        series,
        stats: [
          {label: 'x', value: x.toFixed(10)},
          {label: 'label', value: String(best)},
          {label: 'min d²', value: bestD.toFixed(10)},
          {label: 'c₀', value: cs[0].toFixed(10)},
          {label: 'c₁', value: cs[1].toFixed(10)},
          {label: 'c₂', value: cs[2].toFixed(10)},
        ],
        note: 'Labs: init (100,600,1200); electron → label 0; then update c₀≈89.42.',
      };
    },
  },
  nnDenseLinear: {
    id: 'nnDenseLinear',
    title: 'Dense units=1 map',
    subtitle: 'y = w x + b — slide w, b, x (Keras linear layer)',
    formula: '$y=wx+b$',
    params: [
      {
        key: 'w',
        label: 'w',
        meaning: 'Kernel weight.',
        min: -100,
        max: 600,
        step: 10,
        default: 450,
      },
      {
        key: 'b',
        label: 'b',
        meaning: 'Bias.',
        min: -100,
        max: 100,
        step: 5,
        default: -35,
      },
      {
        key: 'x',
        label: 'x (e.g. r)',
        meaning: 'Scalar input (distance).',
        min: 0,
        max: 2.5,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      return `y=${fmt(v.w * v.x + v.b, 2)} for Hubble-style v≈w r+b.`;
    },
    compute(v) {
      const w = clamp(v.w, -100, 600);
      const b = clamp(v.b, -100, 100);
      const x = clamp(v.x, 0, 2.5);
      const y = w * x + b;
      const series = [];
      for (let t = 0; t <= 2.5001; t += 0.1) {
        series.push({
          x: t,
          y: w * t + b,
          highlight: Math.abs(t - x) < 0.06,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'y vs x',
        series,
        stats: [
          {label: 'w', value: w.toFixed(10)},
          {label: 'b', value: b.toFixed(10)},
          {label: 'x', value: x.toFixed(10)},
          {label: 'y', value: y.toFixed(10)},
        ],
        note: 'Lab lock example: w=448.52048, b=-34.726036, x=1 → y=413.794444.',
      };
    },
  },
  qcBlochAmps: {
    id: 'qcBlochAmps',
    title: 'Bloch amplitudes',
    subtitle: 'u=cos(θ/2), |v|=sin(θ/2) — slide θ',
    formula: '$|\\psi\\rangle=\\cos(\\theta/2)|0\\rangle+e^{i\\phi}\\sin(\\theta/2)|1\\rangle$',
    params: [
      {
        key: 'theta',
        label: 'θ (rad)',
        meaning: 'Polar Bloch angle.',
        min: 0,
        max: Math.PI,
        step: 0.05,
        default: Math.PI / 2,
      },
    ],
    example(v) {
      const th = clamp(v.theta, 0, Math.PI);
      return `θ=${fmt(th, 2)} → |u|=${fmt(Math.cos(th / 2), 3)}, |v|=${fmt(Math.sin(th / 2), 3)}.`;
    },
    compute(v) {
      const th = clamp(v.theta, 0, Math.PI);
      const u = Math.cos(th / 2);
      const vv = Math.sin(th / 2);
      const series = [];
      for (let t = 0; t <= Math.PI + 1e-9; t += 0.05) {
        series.push({
          x: t,
          y: Math.cos(t / 2),
          highlight: Math.abs(t - th) < 0.04,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'cos(θ/2) vs θ',
        series,
        stats: [
          {label: 'θ', value: th.toFixed(10)},
          {label: 'cos(θ/2)', value: u.toFixed(10)},
          {label: 'sin(θ/2)', value: vv.toFixed(10)},
          {label: '|u|²+|v|²', value: (u * u + vv * vv).toFixed(10)},
        ],
        note: 'Labs: θ=π/2 → both amplitudes ≈ 0.7071067812.',
      };
    },
  },
  qcSeparability: {
    id: 'qcSeparability',
    title: 'Two-qubit separability',
    subtitle: '|wz − xy| — zero iff product state',
    formula: '$\\text{separable}\\iff wz=xy$',
    params: [
      {
        key: 'w',
        label: 'w (|00⟩)',
        meaning: 'Amplitude of |00⟩.',
        min: -1,
        max: 1,
        step: 0.05,
        default: 0.7071,
      },
      {
        key: 'x',
        label: 'x (|01⟩)',
        meaning: 'Amplitude of |01⟩.',
        min: -1,
        max: 1,
        step: 0.05,
        default: 0,
      },
      {
        key: 'y',
        label: 'y (|10⟩)',
        meaning: 'Amplitude of |10⟩.',
        min: -1,
        max: 1,
        step: 0.05,
        default: 0,
      },
      {
        key: 'z',
        label: 'z (|11⟩)',
        meaning: 'Amplitude of |11⟩.',
        min: -1,
        max: 1,
        step: 0.05,
        default: 0.7071,
      },
    ],
    example(v) {
      const m = Math.abs(v.w * v.z - v.x * v.y);
      return `|wz−xy|=${fmt(m, 4)} → ${m < 1e-6 ? 'separable' : 'entangled'}.`;
    },
    compute(v) {
      const w = clamp(v.w, -1, 1);
      const x = clamp(v.x, -1, 1);
      const y = clamp(v.y, -1, 1);
      const z = clamp(v.z, -1, 1);
      const meas = Math.abs(w * z - x * y);
      const series = [];
      for (let t = -1; t <= 1.001; t += 0.05) {
        series.push({
          x: t,
          y: Math.abs(w * t - x * y),
          highlight: Math.abs(t - z) < 0.04,
        });
      }
      return {
        chartType: 'line',
        yLabel: '|w z − x y| vs z',
        series,
        stats: [
          {label: 'w', value: w.toFixed(10)},
          {label: 'x', value: x.toFixed(10)},
          {label: 'y', value: y.toFixed(10)},
          {label: 'z', value: z.toFixed(10)},
          {label: '|wz−xy|', value: meas.toFixed(10)},
        ],
        note: 'Bell β₀₀ defaults → measure 0.5. Product |00⟩ → 0.',
      };
    },
  },
  qcHadamard: {
    id: 'qcHadamard',
    title: 'Hadamard on |0⟩/|1⟩',
    subtitle: 'Slide which basis state → |+⟩ or |−⟩ amplitudes',
    formula: '$H=\\frac1{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}$',
    params: [
      {
        key: 'ket',
        label: 'input (0=|0⟩, 1=|1⟩)',
        meaning: 'Which computational basis state to transform.',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      const k = Math.round(clamp(v.ket, 0, 1));
      return k === 0
        ? 'H|0⟩ = (|0⟩+|1⟩)/√2'
        : 'H|1⟩ = (|0⟩−|1⟩)/√2';
    },
    compute(v) {
      const k = Math.round(clamp(v.ket, 0, 1));
      const s = 1 / Math.SQRT2;
      const a0 = s;
      const a1 = k === 0 ? s : -s;
      const series = [
        {x: 0, y: a0, highlight: true},
        {x: 1, y: a1, highlight: true},
      ];
      return {
        chartType: 'line',
        yLabel: 'amplitude vs basis index',
        series,
        stats: [
          {label: 'input', value: k === 0 ? '|0⟩' : '|1⟩'},
          {label: 'amp |0⟩', value: a0.toFixed(10)},
          {label: 'amp |1⟩', value: a1.toFixed(10)},
          {label: 'H₀₀', value: s.toFixed(10)},
          {label: 'H₁₁', value: (-s).toFixed(10)},
        ],
        note: 'Labs lock H₀₀≈0.7071067812 and H₁₁≈−0.7071067812.',
      };
    },
  },
  qcHalfAdder: {
    id: 'qcHalfAdder',
    title: 'Half-adder sum & carry',
    subtitle: 'Slide two bits → XOR sum and AND carry',
    formula: '$\\mathrm{sum}=q_0\\oplus q_1,\\;\\mathrm{carry}=q_0\\cdot q_1$',
    params: [
      {
        key: 'q0',
        label: 'q0 (0 or 1)',
        meaning: 'First addend bit.',
        min: 0,
        max: 1,
        step: 1,
        default: 1,
      },
      {
        key: 'q1',
        label: 'q1 (0 or 1)',
        meaning: 'Second addend bit.',
        min: 0,
        max: 1,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const a = Math.round(clamp(v.q0, 0, 1));
      const b = Math.round(clamp(v.q1, 0, 1));
      return `${a}+${b} → sum ${a ^ b}, carry ${a & b}`;
    },
    compute(v) {
      const a = Math.round(clamp(v.q0, 0, 1));
      const b = Math.round(clamp(v.q1, 0, 1));
      const sum = a ^ b;
      const carry = a & b;
      return {
        chartType: 'line',
        yLabel: 'bit value',
        series: [
          {x: 0, y: sum, highlight: true},
          {x: 1, y: carry, highlight: true},
        ],
        stats: [
          {label: 'q0', value: String(a)},
          {label: 'q1', value: String(b)},
          {label: 'sum (XOR)', value: String(sum)},
          {label: 'carry (AND)', value: String(carry)},
        ],
        note: 'Quantum: Toffoli → carry line, then CNOT → sum line.',
      };
    },
  },
  qcGroverIters: {
    id: 'qcGroverIters',
    title: 'Grover iteration estimate',
    subtitle: 'Slide N → π√N/4 optimal rounds',
    formula: '$t\\approx\\dfrac{\\pi}{4}\\sqrt{N}$',
    params: [
      {
        key: 'N',
        label: 'N (database size)',
        meaning: 'Number of unsorted items (power of two ideal).',
        min: 4,
        max: 256,
        step: 4,
        default: 16,
      },
    ],
    example(v) {
      const N = Math.max(1, v.N);
      const t = (Math.PI / 4) * Math.sqrt(N);
      return `N=${N} → t≈${t.toFixed(2)} (round ${Math.round(t)})`;
    },
    compute(v) {
      const N = Math.max(1, clamp(v.N, 4, 256));
      const t = (Math.PI / 4) * Math.sqrt(N);
      const series = [];
      for (let n = 4; n <= 256; n += 4) {
        series.push({
          x: n,
          y: (Math.PI / 4) * Math.sqrt(n),
          highlight: Math.abs(n - N) < 2,
        });
      }
      return {
        chartType: 'line',
        yLabel: 't ≈ π√N/4',
        series,
        stats: [
          {label: 'N', value: String(N)},
          {label: 't', value: t.toFixed(10)},
          {label: 'round(t)', value: String(Math.round(t))},
          {label: '1/√N', value: (1 / Math.sqrt(N)).toFixed(10)},
        ],
        note: 'Labs: N=16 → round(t)=3.',
      };
    },
  },
  fourierGaussianPair: {
    id: 'fourierGaussianPair',
    title: 'Gaussian ↔ Gaussian FT pair',
    subtitle: 'Narrower in t ⇒ wider in ω (and vice versa)',
    formula: '$y(t)=e^{-a t^2}\\;\\longleftrightarrow\\; Y(\\omega)\\propto e^{-\\omega^2/(4a)}/\\sqrt{a}$',
    params: [
      {
        key: 'a',
        label: 'a (time-domain width)',
        meaning: 'Larger a → sharper pulse in t, broader spectrum in ω.',
        min: 0.2,
        max: 4,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      const a = clamp(v.a, 0.2, 4);
      return `a=${a.toFixed(2)}: time FWHM shrinks as √(1/a); spectrum widens.`;
    },
    compute(v) {
      const a = clamp(v.a, 0.2, 4);
      const series = [];
      for (let i = 0; i <= 80; i += 1) {
        const t = -4 + (8 * i) / 80;
        const y = Math.exp(-a * t * t);
        series.push({x: t, y, highlight: Math.abs(t) < 0.05});
      }
      const y0 = 1;
      const Y0 = Math.sqrt(Math.PI / a);
      return {
        chartType: 'line',
        yLabel: 'y(t)=exp(−a t²) vs t',
        series,
        stats: [
          {label: 'a', value: a.toFixed(10)},
          {label: 'y(0)', value: y0.toFixed(10)},
          {label: '∝ Y(0)', value: Y0.toFixed(10)},
          {label: 'time scale 1/√a', value: (1 / Math.sqrt(a)).toFixed(10)},
        ],
        note: 'FT of a Gaussian is a Gaussian. Slide a to feel the uncertainty tradeoff.',
      };
    },
  },
  softOscillatorPeriod: {
    id: 'softOscillatorPeriod',
    title: 'Soft oscillator period vs amplitude',
    subtitle: 'F=−kx(1−αx); larger A softens restoring force',
    formula: '$F=-kx(1-\\alpha x),\\quad V\\approx\\tfrac12 kx^2-\\tfrac13 k\\alpha x^3$',
    params: [
      {
        key: 'A',
        label: 'amplitude A',
        meaning: 'Release from rest at x=A. Soft spring: period grows with A.',
        min: 0.1,
        max: 0.9,
        step: 0.05,
        default: 0.4,
      },
      {
        key: 'alpha',
        label: 'α (softness)',
        meaning: 'α=0 recovers harmonic. Keep Aα < 1 so force still restores near start.',
        min: 0,
        max: 0.8,
        step: 0.05,
        default: 0.3,
      },
    ],
    example(v) {
      const A = clamp(v.A, 0.1, 0.9);
      const al = clamp(v.alpha, 0, 0.8);
      return `A=${A.toFixed(2)}, α=${al.toFixed(2)} (Aα=${(A * al).toFixed(2)}).`;
    },
    compute(v) {
      const A = clamp(v.A, 0.1, 0.9);
      const alpha = clamp(v.alpha, 0, 0.8);
      const k = 1;
      const m = 1;
      const h = 0.002;
      let x = A;
      let vel = 0;
      let t = 0;
      let crossings = 0;
      let tCross = [];
      let prev = x;
      const series = [];
      const tMax = 40;
      while (t < tMax && crossings < 4) {
        const f = (xx) => (-k * xx * (1 - alpha * xx)) / m;
        const a0 = f(x);
        const xMid = x + 0.5 * h * vel;
        const vMid = vel + 0.5 * h * a0;
        const a1 = f(xMid);
        x += h * vMid;
        vel += h * a1;
        t += h;
        if (series.length < 200 && Math.floor(t / 0.05) > series.length) {
          series.push({x: t, y: x, highlight: false});
        }
        if (prev > 0 && x <= 0 && vel < 0) {
          // not used
        }
        if (prev < 0 && x >= 0 && vel > 0) {
          crossings += 1;
          tCross.push(t);
        }
        prev = x;
      }
      let T = 2 * Math.PI;
      if (tCross.length >= 2) T = tCross[1] - tCross[0];
      const Th = 2 * Math.PI * Math.sqrt(m / k);
      return {
        chartType: 'line',
        yLabel: 'x(t) soft oscillator',
        series: series.map((p, i) => ({...p, highlight: i === 0})),
        stats: [
          {label: 'A', value: A.toFixed(10)},
          {label: 'α', value: alpha.toFixed(10)},
          {label: 'T measured', value: T.toFixed(10)},
          {label: 'T harmonic', value: Th.toFixed(10)},
          {label: 'T/T₀', value: (T / Th).toFixed(10)},
        ],
        note: 'α=0 ⇒ T≈T₀. Soft α + larger A stretches the period.',
      };
    },
  },
  odeEnergyDrift: {
    id: 'odeEnergyDrift',
    title: 'Energy drift: Euler vs RK2',
    subtitle: 'Harmonic oscillator; watch |E−E₀| after fixed time',
    formula: '$E=\\tfrac12 v^2+\\tfrac12\\omega^2 x^2$',
    params: [
      {
        key: 'logh',
        label: 'log₁₀ h',
        meaning: 'Step size. Smaller h cuts truncation error.',
        min: -3,
        max: -1,
        step: 0.1,
        default: -2,
      },
    ],
    example(v) {
      const h = 10 ** clamp(v.logh, -3, -1);
      return `Integrate to t=2 with h=${h.toPrecision(3)}; compare energy errors.`;
    },
    compute(v) {
      const logh = clamp(v.logh, -3, -1);
      const h = 10 ** logh;
      const omega = 2 * Math.PI;
      const k = omega * omega;
      const tEnd = 2;
      const integrate = (method) => {
        let x = 0;
        let vel = 1;
        const n = Math.max(1, Math.round(tEnd / h));
        const hh = tEnd / n;
        for (let i = 0; i < n; i += 1) {
          if (method === 'euler') {
            const a = -k * x;
            x += hh * vel;
            vel += hh * a;
          } else {
            const f = (xx, vv) => [vv, -k * xx];
            const [f0, f1] = f(x, vel);
            const [g0, g1] = f(x + 0.5 * hh * f0, vel + 0.5 * hh * f1);
            x += hh * g0;
            vel += hh * g1;
          }
        }
        return 0.5 * vel * vel + 0.5 * k * x * x;
      };
      const E0 = 0.5;
      const eE = Math.abs(integrate('euler') - E0);
      const eR = Math.abs(integrate('rk2') - E0);
      const series = [];
      for (let lh = -3; lh <= -1.001; lh += 0.1) {
        const hh = 10 ** lh;
        let x = 0;
        let vel = 1;
        const n = Math.max(1, Math.round(tEnd / hh));
        const step = tEnd / n;
        for (let i = 0; i < n; i += 1) {
          const a = -k * x;
          x += step * vel;
          vel += step * a;
        }
        const E = 0.5 * vel * vel + 0.5 * k * x * x;
        series.push({
          x: lh,
          y: Math.log10(Math.abs(E - E0) + 1e-16),
          highlight: Math.abs(lh - logh) < 0.06,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀ |E_Euler−E₀| vs log₁₀ h',
        series,
        stats: [
          {label: 'h', value: h.toExponential(2)},
          {label: '|ΔE| Euler', value: eE.toExponential(3)},
          {label: '|ΔE| RK2', value: eR.toExponential(3)},
          {label: 'E₀', value: E0.toFixed(10)},
        ],
        note: 'Energy is a diagnostic, not a degree of freedom. RK2 usually drifts far less than Euler.',
      };
    },
  },
  stftWindowTradeoff: {
    id: 'stftWindowTradeoff',
    title: 'STFT window: time vs frequency blur',
    subtitle: 'Wider window → sharper Δf, blurrier Δt',
    formula: '$\\Delta t\\,\\Delta f\\gtrsim \\mathrm{const}$',
    params: [
      {
        key: 'W',
        label: 'window width W (samples)',
        meaning: 'Longer window averages over more time but resolves closer frequencies.',
        min: 8,
        max: 128,
        step: 8,
        default: 32,
      },
    ],
    example(v) {
      const W = Math.round(clamp(v.W, 8, 128));
      return `W=${W}: Δt∼W, Δf∼1/W (schematic units).`;
    },
    compute(v) {
      const W = Math.round(clamp(v.W, 8, 128));
      const dt = W;
      const df = 1 / W;
      const series = [];
      for (let w = 8; w <= 128; w += 4) {
        series.push({
          x: w,
          y: 1 / w,
          highlight: Math.abs(w - W) < 2,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'schematic Δf ∼ 1/W vs W',
        series,
        stats: [
          {label: 'W', value: String(W)},
          {label: 'Δt ∼', value: dt.toFixed(10)},
          {label: 'Δf ∼', value: df.toFixed(10)},
          {label: 'Δt·Δf', value: (dt * df).toFixed(10)},
        ],
        note: 'Product stays O(1). Choose W for the feature lifetime you care about.',
      };
    },
  },
  autocorrLagPeak: {
    id: 'autocorrLagPeak',
    title: 'Noisy sinusoid autocorrelation',
    subtitle: 'A(τ) peaks at lags multiple of the hidden period',
    formula: '$A(\\tau)=\\langle y(t)y(t+\\tau)\\rangle$',
    params: [
      {
        key: 'period',
        label: 'true period T',
        meaning: 'Hidden sinusoid period. Autocorr should revive near τ=T,2T,…',
        min: 8,
        max: 40,
        step: 1,
        default: 20,
      },
      {
        key: 'noise',
        label: 'noise σ',
        meaning: 'Gaussian noise std. Larger σ buries the signal in y(t) but A(τ) often still shows T.',
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.8,
      },
    ],
    example(v) {
      return `T=${Math.round(v.period)}, σ=${Number(v.noise).toFixed(1)}`;
    },
    compute(v) {
      const T = Math.round(clamp(v.period, 8, 40));
      const sigma = clamp(v.noise, 0, 2);
      const N = 400;
      const y = [];
      let seed = 1234567 + T * 100 + Math.round(sigma * 100);
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      for (let i = 0; i < N; i += 1) {
        const n = sigma * (rand() + rand() + rand() + rand() - 2);
        y.push(Math.sin((2 * Math.PI * i) / T) + n);
      }
      const mean = y.reduce((a, b) => a + b, 0) / N;
      const yc = y.map((v) => v - mean);
      const maxLag = Math.min(120, N - 1);
      const series = [];
      let bestLag = 1;
      let bestA = -Infinity;
      for (let tau = 0; tau <= maxLag; tau += 1) {
        let s = 0;
        let c = 0;
        for (let i = 0; i + tau < N; i += 1) {
          s += yc[i] * yc[i + tau];
          c += 1;
        }
        const A = s / c;
        series.push({x: tau, y: A, highlight: tau === T});
        if (tau > 3 && A > bestA) {
          bestA = A;
          bestLag = tau;
        }
      }
      return {
        chartType: 'line',
        yLabel: 'A(τ) vs lag τ',
        series,
        stats: [
          {label: 'T', value: String(T)},
          {label: 'σ', value: sigma.toFixed(10)},
          {label: 'A(T)', value: (series[T]?.y ?? 0).toFixed(10)},
          {label: 'argmax A (τ>3)', value: String(bestLag)},
        ],
        note: 'Noise wrecks the raw trace; autocorrelation still hints at T.',
      };
    },
  },
  shorPhaseToPeriod: {
    id: 'shorPhaseToPeriod',
    title: 'QPE phase → period candidate',
    subtitle: 'φ = s/2ᵗ ≈ S/T; continued-fraction denominator',
    formula: '$\\phi\\approx S/T$',
    params: [
      {
        key: 'phi',
        label: 'measured φ',
        meaning: 'Phase from QPE (0–1). Classic demo: 0.25 → T=4.',
        min: 0,
        max: 0.95,
        step: 0.05,
        default: 0.25,
      },
      {
        key: 'N',
        label: 'N to factor',
        meaning: 'limit_denominator(N) bound.',
        min: 15,
        max: 35,
        step: 2,
        default: 15,
      },
    ],
    example(v) {
      return `φ=${Number(v.phi).toFixed(2)}, N=${Math.round(v.N)}`;
    },
    compute(v) {
      const phi = clamp(v.phi, 0, 0.95);
      const N = Math.round(clamp(v.N, 15, 35));
      // continued fraction approx
      const approx = (x, maxDen) => {
        let a0 = Math.floor(x);
        let p0 = 1;
        let q0 = 0;
        let p1 = a0;
        let q1 = 1;
        let frac = x - a0;
        for (let i = 0; i < 12; i += 1) {
          if (Math.abs(frac) < 1e-12) break;
          const inv = 1 / frac;
          const a = Math.floor(inv);
          const p = a * p1 + p0;
          const q = a * q1 + q0;
          if (q > maxDen) break;
          p0 = p1;
          q0 = q1;
          p1 = p;
          q1 = q;
          frac = inv - a;
        }
        return {num: p1, den: q1};
      };
      const {num, den} = approx(phi, N);
      const series = [];
      for (let i = 0; i <= 20; i += 1) {
        const ph = i / 20;
        const ap = approx(ph, N);
        series.push({
          x: ph,
          y: ap.den,
          highlight: Math.abs(ph - phi) < 0.03,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'continued-fraction denominator vs φ',
        series,
        stats: [
          {label: 'φ', value: phi.toFixed(10)},
          {label: 'S/T ≈', value: `${num}/${den}`},
          {label: 'T candidate', value: String(den)},
          {label: 'N', value: String(N)},
        ],
        note: 'φ=0.25 → 1/4. Then gcd(a^{T/2}±1, N) for factors.',
      };
    },
  },
  matrixMulFlops: {
    id: 'matrixMulFlops',
    title: 'Dense matmul flop count',
    subtitle: 'Slide n → ~2n³ flops for n×n × n×n',
    formula: '$\\mathrm{flops}\\approx 2n^3$',
    params: [
      {
        key: 'n',
        label: 'n (matrix size)',
        meaning: 'Square matrices C=AB. Leading term 2n³ multiply-adds.',
        min: 2,
        max: 64,
        step: 1,
        default: 16,
      },
    ],
    example(v) {
      const n = Math.round(clamp(v.n, 2, 64));
      return `n=${n} → ≈${(2 * n ** 3).toLocaleString()} flops (leading term).`;
    },
    compute(v) {
      const n = Math.round(clamp(v.n, 2, 64));
      const flops = 2 * n * n * n;
      const series = [];
      for (let k = 2; k <= 64; k += 1) {
        series.push({
          x: k,
          y: Math.log10(2 * k * k * k),
          highlight: k === n,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀(2n³) vs n',
        series,
        stats: [
          {label: 'n', value: String(n)},
          {label: '2n³', value: String(flops)},
          {label: 'n² (memory order)', value: String(n * n)},
          {label: 'flops / n²', value: (flops / (n * n)).toFixed(10)},
        ],
        note: 'Stride / cache decide wall time; flop count sets the work lower bound.',
      };
    },
  },
  opencvHistBins: {
    id: 'opencvHistBins',
    title: 'RGB histogram bin count',
    subtitle: 'Per-channel bins; 256³ is the full 8-bit cube',
    formula: '$N_{\\mathrm{bins}}=b^3\\;\\text{(joint RGB)}$',
    params: [
      {
        key: 'b',
        label: 'bins per channel',
        meaning: 'Classic 8-bit images use b=256 for a full hist. Joint RGB uses b³ cells.',
        min: 2,
        max: 256,
        step: 2,
        default: 16,
      },
    ],
    example(v) {
      const b = Math.round(clamp(v.b, 2, 256));
      return `b=${b} → joint cells ${b ** 3}; per-channel length ${b}.`;
    },
    compute(v) {
      const b = Math.round(clamp(v.b, 2, 256));
      const series = [];
      for (let k = 2; k <= 64; k += 2) {
        series.push({
          x: k,
          y: Math.log10(k * k * k),
          highlight: k === b || (b > 64 && k === 64),
        });
      }
      return {
        chartType: 'line',
        yLabel: 'log₁₀(b³) vs bins/channel (to 64)',
        series,
        stats: [
          {label: 'b', value: String(b)},
          {label: 'per-channel bins', value: String(b)},
          {label: 'joint b³', value: String(b * b * b)},
          {label: '8-bit full cube', value: String(256 ** 3)},
        ],
        note: 'Labs often lock 256³ = 16,777,216 for the full RGB cube.',
      };
    },
  },
  nnLayerParams: {
    id: 'nnLayerParams',
    title: 'Dense layer parameter count',
    subtitle: 'weights + biases for Dense(in→out)',
    formula: '$n_{\\mathrm{params}}=n_{\\mathrm{in}}n_{\\mathrm{out}}+n_{\\mathrm{out}}$',
    params: [
      {
        key: 'nin',
        label: 'n_in',
        meaning: 'Incoming features / previous layer width.',
        min: 1,
        max: 64,
        step: 1,
        default: 4,
      },
      {
        key: 'nout',
        label: 'n_out',
        meaning: 'Units in this Dense layer.',
        min: 1,
        max: 64,
        step: 1,
        default: 8,
      },
    ],
    example(v) {
      const a = Math.round(clamp(v.nin, 1, 64));
      const b = Math.round(clamp(v.nout, 1, 64));
      return `${a}→${b}: ${a * b + b} params.`;
    },
    compute(v) {
      const nin = Math.round(clamp(v.nin, 1, 64));
      const nout = Math.round(clamp(v.nout, 1, 64));
      const w = nin * nout;
      const bias = nout;
      const series = [];
      for (let o = 1; o <= 32; o += 1) {
        series.push({
          x: o,
          y: nin * o + o,
          highlight: o === nout || (nout > 32 && o === 32),
        });
      }
      return {
        chartType: 'line',
        yLabel: `params vs n_out (n_in=${nin})`,
        series,
        stats: [
          {label: 'n_in', value: String(nin)},
          {label: 'n_out', value: String(nout)},
          {label: 'weights', value: String(w)},
          {label: 'biases', value: String(bias)},
          {label: 'total', value: String(w + bias)},
        ],
        note: 'Deep nets sum this over layers. Labs lock small Dense counts.',
      };
    },
  },
};

function quadraticPair(a, b, c) {
  const disc = Math.sqrt(Math.max(0, b * b - 4 * a * c));
  const naivePlus = (-b + disc) / (2 * a);
  const naiveMinus = (-b - disc) / (2 * a);
  const signed = b >= 0 ? -b - disc : -b + disc;
  const big = signed / (2 * a);
  const stableSmall = c / (a * big);
  const naiveSmall = Math.abs(naivePlus) < Math.abs(naiveMinus) ? naivePlus : naiveMinus;
  const rel = Math.abs(naiveSmall - stableSmall) / (Math.abs(stableSmall) + 1e-30);
  return {naiveSmall, stableSmall, rel, big};
}

function threeSums(N) {
  let s1 = 0;
  let odd = 0;
  let even = 0;
  let s3 = 0;
  for (let n = 1; n <= N; n += 1) {
    const a = 2 * n - 1;
    const b = 2 * n;
    s1 += -a / (a + 1) + b / (b + 1);
    odd += a / b;
    even += b / (b + 1);
    s3 += 1 / (b * (b + 1));
  }
  return {s1, s2: -odd + even, s3};
}

function threeSumsTrack(maxN, targets) {
  const want = new Set(targets);
  want.add(maxN);
  let s1 = 0;
  let odd = 0;
  let even = 0;
  let s3 = 0;
  const rows = [];
  for (let n = 1; n <= maxN; n += 1) {
    const a = 2 * n - 1;
    const b = 2 * n;
    s1 += -a / (a + 1) + b / (b + 1);
    odd += a / b;
    even += b / (b + 1);
    s3 += 1 / (b * (b + 1));
    if (want.has(n)) {
      rows.push({N: n, s1, s2: -odd + even, s3});
    }
  }
  return rows;
}

function harmonicPair(N) {
  let up = 0;
  let down = 0;
  for (let n = 1; n <= N; n += 1) {
    up += 1 / n;
  }
  for (let n = N; n >= 1; n -= 1) {
    down += 1 / n;
  }
  const rel = (up - down) / (Math.abs(up) + Math.abs(down) + 1e-30);
  return {up, down, rel};
}

function nStar(alpha, beta, eps) {
  return (2 * alpha * beta / Math.max(eps, 1e-30)) ** (1 / (beta + 0.5));
}

function epsTot(N, alpha, beta, eps) {
  return alpha / N ** beta + Math.sqrt(N) * eps;
}

function twoNRel(N, alpha, beta, eps) {
  const aN = 1 + alpha / N ** beta + Math.sqrt(N) * eps;
  const a2 = 1 + alpha / (2 * N) ** beta + Math.sqrt(2 * N) * eps;
  return Math.abs(aN - a2) / Math.abs(a2);
}

function sineRecurrence(x, maxN) {
  const rows = [{n: 1, term: x, sum: x, ratio: 1}];
  let term = x;
  let sum = x;
  for (let n = 2; n <= maxN; n += 1) {
    term *= (-x * x) / ((2 * n - 1) * (2 * n - 2));
    sum += term;
    const ratio = Math.abs(term / (sum || 1e-30));
    rows.push({n, term, sum, ratio});
  }
  return rows;
}

function j0anal(x) {
  return x === 0 ? 1 : Math.sin(x) / x;
}

function j1anal(x) {
  return x === 0 ? 0 : Math.sin(x) / (x * x) - Math.cos(x) / x;
}

function besselUp(x, L) {
  const js = new Array(L + 1).fill(0);
  js[0] = j0anal(x);
  if (L >= 1) js[1] = j1anal(x);
  for (let ell = 1; ell < L; ell += 1) {
    js[ell + 1] = ((2 * ell + 1) / x) * js[ell] - js[ell - 1];
  }
  return js;
}

function besselDown(x, L, start) {
  const m = Math.max(start || L + 25, L + 2);
  const j = new Array(m + 2).fill(0);
  j[m + 1] = 0;
  j[m] = 1;
  for (let k = m; k >= 1; k -= 1) {
    j[k - 1] = ((2 * k + 1) / x) * j[k] - j[k + 1];
  }
  const scale = j0anal(x) / (j[0] || 1e-30);
  return Array.from({length: L + 1}, (_, ell) => j[ell] * scale);
}

/** mode 0: bad pedagogical LCG; 1: modest LCG; 2: mulberry scramble → [0,1). */
function lcgSequence(mode, seed, count) {
  const out = [];
  if (mode === 2) {
    let t = seed >>> 0;
    for (let i = 0; i < count; i += 1) {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      out.push(((r ^ (r >>> 14)) >>> 0) / 4294967296);
    }
    return out;
  }
  const a = mode === 0 ? 57 : 1664525;
  const c = mode === 0 ? 1 : 1013904223;
  const M = mode === 0 ? 256 : 4294967296;
  let r = seed % M;
  for (let i = 0; i < count; i += 1) {
    out.push(r / M);
    r = (a * r + c) % M;
  }
  return out;
}

function walkEndR(seed, steps) {
  let t = seed >>> 0;
  const rnd = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  let x = 0;
  let y = 0;
  for (let i = 0; i < steps; i += 1) {
    let dx = rnd() * 2 - 1;
    let dy = rnd() * 2 - 1;
    const L = Math.hypot(dx, dy) || 1;
    x += dx / L;
    y += dy / L;
  }
  return Math.hypot(x, y);
}

function decayRun(N0, lambda, seed) {
  let tState = seed >>> 0;
  const rnd = () => {
    tState += 0x6d2b79f5;
    let r = Math.imul(tState ^ (tState >>> 15), 1 | tState);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  let N = N0;
  let t = 0;
  const series = [{t: 0, N, Delta: 0}];
  while (N > 0 && t < 8000) {
    let Delta = 0;
    for (let i = 0; i < N; i += 1) {
      if (rnd() < lambda) Delta += 1;
    }
    t += 1;
    N -= Delta;
    series.push({t, N: Math.max(N, 0), Delta});
  }
  return {series};
}

function earlyLnSlope(N0, lambda, seed, tmax) {
  const {series} = decayRun(N0, lambda, seed);
  const pts = series.filter((p) => p.t <= tmax && p.N > 0);
  if (pts.length < 2) return 0;
  const xs = pts.map((p) => p.t);
  const ys = pts.map((p) => Math.log(p.N));
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function extrapolatedDiff(y, t, h) {
  return (8 * (y(t + h / 4) - y(t - h / 4)) - (y(t + h / 2) - y(t - h / 2))) / (3 * h);
}

/** Tabulated Gauss–Legendre nodes/weights on [-1,1] for N=2..6. */
function gaussLegendreNW(N) {
  const table = {
    2: {
      nodes: [-0.5773502691896257, 0.5773502691896257],
      weights: [1, 1],
    },
    3: {
      nodes: [-0.7745966692414834, 0, 0.7745966692414834],
      weights: [0.5555555555555556, 0.8888888888888888, 0.5555555555555556],
    },
    4: {
      nodes: [-0.8611363115940526, -0.3399810435848563, 0.3399810435848563, 0.8611363115940526],
      weights: [0.34785484513745385, 0.6521451548625461, 0.6521451548625461, 0.34785484513745385],
    },
    5: {
      nodes: [
        -0.906179845938664,
        -0.5384693101056831,
        0,
        0.5384693101056831,
        0.906179845938664,
      ],
      weights: [
        0.23692688502264126,
        0.47862867049936647,
        0.5688888888888889,
        0.47862867049936647,
        0.23692688502264126,
      ],
    },
    6: {
      nodes: [
        -0.9324695142031521,
        -0.6612093864662645,
        -0.2386191860831969,
        0.2386191860831969,
        0.6612093864662645,
        0.9324695142031521,
      ],
      weights: [
        0.1713244923791704,
        0.3607615730481386,
        0.46791393457269104,
        0.46791393457269104,
        0.3607615730481386,
        0.1713244923791704,
      ],
    },
  };
  return table[N] || table[4];
}

/** Chapter LCG floats in [0,1): r ← (1103515245 r + 12345) % 2³¹. */
function lcgFloatSeq(seed, N) {
  // BigInt keeps the chapter LCG exact: Number loses bits once 1103515245*r exceeds 2^53.
  let r = BigInt(seed | 0);
  const M = 2147483648n;
  const a = 1103515245n;
  const c = 12345n;
  const out = new Array(N);
  const mNum = 2147483648;
  for (let i = 0; i < N; i += 1) {
    r = (a * r + c) % M;
    out[i] = Number(r) / mNum;
  }
  return out;
}

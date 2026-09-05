import {clamp, fmt, normalPdf} from './probMath.js';

/** Deterministic [0,1) from integer index + seed. */
function hash01(i, seed) {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function bernoulli(p, i, seed) {
  return hash01(i, seed) < p ? 1 : 0;
}

function exponential(lambda, i, seed) {
  const u = Math.max(1e-12, hash01(i, seed));
  return -Math.log(u) / lambda;
}

function gauss(i, seed) {
  // Box-Muller with two hashes
  const u1 = Math.max(1e-12, hash01(i, seed));
  const u2 = hash01(i + 99991, seed + 1);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function corrPair(rho, i, seed) {
  const z1 = gauss(i, seed);
  const z2 = gauss(i + 50000, seed);
  const x = z1;
  const y = rho * z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2;
  return {x, y};
}

/** @type {Record<string, object>} */
export const STATS_PRESETS = {
  meanVarDiscrete: {
    id: 'meanVarDiscrete',
    title: 'Expectation & variance',
    subtitle: 'Slide probability masses on {1,2,3,4} — watch E[X] and Var(X)',
    formula: 'E[X]=Σ x f(x)    Var(X)=E[X²]−(E[X])²',
    params: [
      {key: 'p1', label: 'P(X=1)', meaning: 'Probability mass at outcome 1.', min: 0.05, max: 0.7, step: 0.01, default: 0.1},
      {key: 'p2', label: 'P(X=2)', meaning: 'Probability mass at outcome 2.', min: 0.05, max: 0.7, step: 0.01, default: 0.2},
      {key: 'p3', label: 'P(X=3)', meaning: 'Probability mass at outcome 3.', min: 0.05, max: 0.7, step: 0.01, default: 0.3},
    ],
    example(v) {
      const masses = normalize4(v);
      const ex = 1 * masses[0] + 2 * masses[1] + 3 * masses[2] + 4 * masses[3];
      return `Sample: a mini game pays $1–$4 with probabilities you set. Fair price ≈ E[X]=${fmt(ex, 2)}.`;
    },
    compute(v) {
      const m = normalize4(v);
      const xs = [1, 2, 3, 4];
      let ex = 0;
      let ex2 = 0;
      const series = xs.map((x, i) => {
        ex += x * m[i];
        ex2 += x * x * m[i];
        return {x, y: m[i], label: String(x)};
      });
      const vr = ex2 - ex * ex;
      return {
        chartType: 'bar',
        yLabel: 'P(X=x)',
        series,
        stats: [
          {label: 'E[X]', value: fmt(ex, 2)},
          {label: 'E[X²]', value: fmt(ex2, 2)},
          {label: 'Var(X)', value: fmt(vr, 2)},
          {label: 'σ', value: fmt(Math.sqrt(Math.max(0, vr)), 2)},
        ],
        note: 'Variance is always ≥ 0. σ = √Var is the usual scale for “typical distance from the mean”.',
      };
    },
  },

  corrDemo: {
    id: 'corrDemo',
    title: 'Correlation scatter',
    subtitle: 'Slide ρ — points come from a bivariate Normal with that correlation',
    formula: 'ρ = Cov(X,Y) / (σ_X σ_Y)    ∈ [−1, 1]',
    params: [
      {key: 'rho', label: 'ρ correlation', meaning: 'Linear association strength (−1 to +1).', min: -0.95, max: 0.95, step: 0.05, default: 0.7},
      {key: 'seed', label: 'sample seed', meaning: 'Resample the cloud with a different deterministic draw.', min: 1, max: 40, step: 1, default: 3},
    ],
    example(v) {
      return `Sample: ad spend (X) vs conversions (Y) with correlation ρ=${fmt(v.rho, 2)}. Strong |ρ| → tight cloud; ρ=0 → no linear pattern.`;
    },
    compute(v) {
      const rho = clamp(v.rho, -0.99, 0.99);
      const seed = Math.floor(v.seed);
      const series = [];
      for (let i = 0; i < 80; i++) series.push(corrPair(rho, i, seed));
      return {
        chartType: 'scatter',
        yLabel: 'Y vs X',
        series,
        stats: [
          {label: 'ρ (set)', value: fmt(rho, 2)},
          {label: 'Cov (std Normal)', value: fmt(rho, 2)},
        ],
        note: 'X,Y standardized ≈ N(0,1); Cov(X,Y)=ρ when Var=1.',
      };
    },
  },

  uniformMoments: {
    id: 'uniformMoments',
    title: 'Uniform mean & variance',
    subtitle: 'Classic interview derivation targets for Uniform(a,b)',
    formula: 'E[X]=(a+b)/2    Var(X)=(b−a)²/12',
    params: [
      {key: 'a', label: 'a', meaning: 'Left endpoint of the support.', min: 0, max: 8, step: 0.5, default: 2},
      {key: 'b', label: 'b', meaning: 'Right endpoint (must exceed a).', min: 1, max: 12, step: 0.5, default: 8},
    ],
    example(v) {
      let a = v.a;
      let b = v.b;
      if (b <= a + 0.5) b = a + 0.5;
      return `Sample: delivery time ~ Uniform(${fmt(a, 1)}, ${fmt(b, 1)}) hours. Expected time ${(a + b) / 2}.`;
    },
    compute(v) {
      let a = v.a;
      let b = v.b;
      if (b <= a + 0.5) b = a + 0.5;
      const series = [];
      for (let i = 0; i <= 60; i++) {
        const x = a - 1 + ((b - a + 2) * i) / 60;
        const y = x >= a && x <= b ? 1 / (b - a) : 0;
        series.push({x, y});
      }
      return {
        chartType: 'line',
        yLabel: 'x',
        series,
        refLineX: (a + b) / 2,
        stats: [
          {label: 'E[X]', value: fmt((a + b) / 2, 2)},
          {label: 'Var', value: fmt(((b - a) ** 2) / 12, 2)},
          {label: 'σ', value: fmt(Math.abs(b - a) / Math.sqrt(12), 2)},
        ],
      };
    },
  },

  llnSim: {
    id: 'llnSim',
    title: 'Law of Large Numbers',
    subtitle: 'Running average of coin flips → true p',
    formula: 'X̄_n → E[X] as n → ∞',
    params: [
      {key: 'p', label: 'true P(heads)', meaning: 'Underlying Bernoulli mean the average should approach.', min: 0.2, max: 0.8, step: 0.05, default: 0.5},
      {key: 'n', label: 'n flips shown', meaning: 'How many independent flips to accumulate.', min: 10, max: 500, step: 10, default: 120},
      {key: 'seed', label: 'seed', meaning: 'Different deterministic random path.', min: 1, max: 30, step: 1, default: 1},
    ],
    example(v) {
      return `Sample: a casino game wins with probability ${fmt(v.p, 2)}. After many plays the observed win rate hugs that value (LLN) — not luck on a short streak.`;
    },
    compute(v) {
      const p = clamp(v.p, 0.01, 0.99);
      const n = Math.floor(v.n);
      const seed = Math.floor(v.seed);
      let sum = 0;
      const series = [];
      for (let i = 1; i <= n; i++) {
        sum += bernoulli(p, i, seed);
        series.push({x: i, y: sum / i});
      }
      return {
        chartType: 'line',
        yLabel: 'n (flips)',
        series,
        refLineY: p,
        stats: [
          {label: 'true p', value: fmt(p, 2)},
          {label: `X̄_${n}`, value: fmt(sum / n, 2)},
          {label: '|X̄ − p|', value: fmt(Math.abs(sum / n - p), 2)},
        ],
        note: 'Green dashed = true expectation. Blue = running sample mean.',
      };
    },
  },

  cltSim: {
    id: 'cltSim',
    title: 'Central Limit Theorem',
    subtitle: 'Histogram of sample means from an Exponential parent → bell shape',
    formula: 'X̄ ≈ Normal(μ, σ²/n) for large n',
    params: [
      {key: 'n', label: 'sample size n', meaning: 'Draws per sample mean (larger → tighter, more Normal).', min: 5, max: 80, step: 5, default: 20},
      {key: 'lambda', label: 'Expo λ', meaning: 'Parent Exponential rate (skewed!); μ=1/λ.', min: 0.5, max: 2, step: 0.1, default: 1},
      {key: 'reps', label: '# of means', meaning: 'How many sample means to histogram.', min: 80, max: 400, step: 20, default: 200},
      {key: 'seed', label: 'seed', meaning: 'Resample the Monte Carlo cloud.', min: 1, max: 20, step: 1, default: 2},
    ],
    example(v) {
      const mu = 1 / Math.max(0.1, v.lambda);
      return `Sample: wait times ~ Exponential(λ=${fmt(v.lambda, 1)}), mean ${fmt(mu, 2)}. Averages of n=${Math.floor(v.n)} waits look nearly Normal by CLT.`;
    },
    compute(v) {
      const n = Math.floor(v.n);
      const lambda = Math.max(0.2, v.lambda);
      const reps = Math.floor(v.reps);
      const seed = Math.floor(v.seed);
      const mu = 1 / lambda;
      const sigma = 1 / lambda;
      const means = [];
      let idx = 0;
      for (let r = 0; r < reps; r++) {
        let s = 0;
        for (let j = 0; j < n; j++) s += exponential(lambda, idx++, seed);
        means.push(s / n);
      }
      const se = sigma / Math.sqrt(n);
      const lo = mu - 4 * se;
      const hi = mu + 4 * se;
      const bins = 16;
      const counts = Array(bins).fill(0);
      for (const m of means) {
        let b = Math.floor(((m - lo) / (hi - lo)) * bins);
        b = clamp(b, 0, bins - 1);
        counts[b]++;
      }
      const series = counts.map((c, i) => ({
        x: i,
        y: c / reps,
        label: i % 4 === 0 ? fmt(lo + ((hi - lo) * (i + 0.5)) / bins, 1) : '',
      }));
      return {
        chartType: 'bar',
        yLabel: 'sample means',
        series,
        stats: [
          {label: 'μ parent', value: fmt(mu, 2)},
          {label: 'SE=σ/√n', value: fmt(se, 2)},
          {label: 'mean of means', value: fmt(means.reduce((a, b) => a + b, 0) / means.length, 2)},
        ],
        note: 'Parent is skewed Exponential; means still pile into a mound near μ.',
      };
    },
  },

  zTCompare: {
    id: 'zTCompare',
    title: 'Normal vs t tails',
    subtitle: 't has heavier tails — important when σ is estimated from small n',
    formula: 'Z uses σ    t uses s with df = n−1',
    params: [
      {key: 'df', label: 'df = n−1', meaning: 'Degrees of freedom for the t curve (small → fat tails).', min: 2, max: 40, step: 1, default: 5},
      {key: 'x', label: 'x cutoff', meaning: 'Compare density height / tail thinking at this x.', min: 0, max: 4, step: 0.1, default: 2},
    ],
    example(v) {
      return `Sample: n=${Math.floor(v.df) + 1} with unknown σ → use t_${Math.floor(v.df)}. Large df → t ≈ Normal.`;
    },
    compute(v) {
      const df = Math.max(2, Math.floor(v.df));
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = -4 + (8 * i) / 80;
        series.push({x, y: tPdf(df, x), highlight: Math.abs(x - v.x) < 0.06});
      }
      // Also show normal as second series? Chart is single series — show t, stats compare to Normal.
      return {
        chartType: 'line',
        yLabel: 'x',
        series,
        shadeToX: -Math.abs(v.x),
        stats: [
          {label: `t_${df} dens @ x`, value: fmt(tPdf(df, v.x), 3)},
          {label: 'N(0,1) dens @ x', value: fmt(normalPdf(0, 1, v.x), 3)},
          {label: 'when to use t', value: 'small n, σ unknown'},
        ],
        note: 'Blue curve = Student-t. Compare density to Normal in the stats row.',
      };
    },
  },

  chiSqBars: {
    id: 'chiSqBars',
    title: 'Chi-squared goodness of fit',
    subtitle: 'Observed vs expected counts → Σ (O−E)²/E',
    formula: 'χ² = Σ (Oᵢ − Eᵢ)² / Eᵢ',
    params: [
      {key: 'o1', label: 'O₁ observed', meaning: 'Count in category 1.', min: 5, max: 60, step: 1, default: 40},
      {key: 'o2', label: 'O₂ observed', meaning: 'Count in category 2.', min: 5, max: 60, step: 1, default: 35},
      {key: 'o3', label: 'O₃ observed', meaning: 'Count in category 3.', min: 5, max: 60, step: 1, default: 25},
    ],
    example(v) {
      const o = [v.o1, v.o2, v.o3].map(Math.floor);
      const n = o[0] + o[1] + o[2];
      const e = n / 3;
      const chi = o.reduce((s, oi) => s + (oi - e) ** 2 / e, 0);
      return `Sample: die fairness check with 3 grouped faces. Under fair H₀ each E=${fmt(e, 1)}. χ²=${fmt(chi, 2)}.`;
    },
    compute(v) {
      const o = [Math.floor(v.o1), Math.floor(v.o2), Math.floor(v.o3)];
      const n = o[0] + o[1] + o[2];
      const e = n / 3;
      const chi = o.reduce((s, oi) => s + (oi - e) ** 2 / e, 0);
      return {
        chartType: 'bar',
        yLabel: 'counts',
        series: [
          {x: 0, y: o[0], label: 'O₁', highlight: true},
          {x: 1, y: e, label: 'E₁'},
          {x: 2, y: o[1], label: 'O₂', highlight: true},
          {x: 3, y: e, label: 'E₂'},
          {x: 4, y: o[2], label: 'O₃', highlight: true},
          {x: 5, y: e, label: 'E₃'},
        ],
        stats: [
          {label: 'n', value: fmt(n, 0)},
          {label: 'Eᵢ (equal)', value: fmt(e, 2)},
          {label: 'χ²', value: fmt(chi, 2)},
          {label: 'df', value: '2'},
        ],
        note: 'Orange = observed, blue = expected under equal proportions.',
      };
    },
  },

  abProp: {
    id: 'abProp',
    title: 'A/B proportion z-test',
    subtitle: 'Two conversion rates under H₀: p_A = p_B',
    formula: 'z = (p̂_B − p̂_A) / √(p̂(1−p̂)(1/n_A+1/n_B))',
    params: [
      {key: 'nA', label: 'n_A control', meaning: 'Users in control.', min: 100, max: 2000, step: 50, default: 800},
      {key: 'cA', label: 'conversions A', meaning: 'Successes in control.', min: 10, max: 800, step: 5, default: 80},
      {key: 'nB', label: 'n_B treatment', meaning: 'Users in treatment.', min: 100, max: 2000, step: 50, default: 800},
      {key: 'cB', label: 'conversions B', meaning: 'Successes in treatment.', min: 10, max: 800, step: 5, default: 110},
    ],
    example(v) {
      const pA = v.cA / v.nA;
      const pB = v.cB / v.nB;
      return `Sample: Uber Eats email test — control ${fmt(pA, 2)} vs treatment ${fmt(pB, 2)}. Is the lift significant under a two-proportion z-test?`;
    },
    compute(v) {
      const nA = Math.max(1, Math.floor(v.nA));
      const nB = Math.max(1, Math.floor(v.nB));
      const cA = clamp(Math.floor(v.cA), 0, nA);
      const cB = clamp(Math.floor(v.cB), 0, nB);
      const pA = cA / nA;
      const pB = cB / nB;
      const pPool = (cA + cB) / (nA + nB);
      const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));
      const z = se > 0 ? (pB - pA) / se : 0;
      return {
        chartType: 'bar',
        yLabel: 'conversion rate',
        series: [
          {x: 0, y: pA, label: 'p̂_A'},
          {x: 1, y: pB, label: 'p̂_B', highlight: true},
          {x: 2, y: pPool, label: 'p̂ pool'},
        ],
        stats: [
          {label: 'p̂_A', value: fmt(pA, 2)},
          {label: 'p̂_B', value: fmt(pB, 2)},
          {label: 'SE', value: fmt(se, 3)},
          {label: 'z', value: fmt(z, 2)},
        ],
        note: 'Pooled H₀ SE from CLT on Bernoulli averages — core of A/B interviews.',
      };
    },
  },

  ciExplorer: {
    id: 'ciExplorer',
    title: 'Confidence interval for a mean',
    subtitle: 'x̄ ± z · (σ/√n) — toggle confidence level',
    formula: 'CI = x̄ ± z_{α/2} · σ/√n',
    params: [
      {key: 'xbar', label: 'x̄ sample mean', meaning: 'Point estimate from the sample.', min: 0, max: 20, step: 0.1, default: 10},
      {key: 'sigma', label: 'σ (known)', meaning: 'Population SD (Z-interval).', min: 0.5, max: 8, step: 0.1, default: 3},
      {key: 'n', label: 'n', meaning: 'Sample size.', min: 10, max: 400, step: 10, default: 100},
      {key: 'conf', label: 'confidence %', meaning: '95 → z≈1.96; 90 → 1.645; 99 → 2.576.', min: 80, max: 99, step: 1, default: 95},
    ],
    example(v) {
      const z = zFromConf(v.conf);
      const se = v.sigma / Math.sqrt(v.n);
      const half = z * se;
      return `Sample: mean session length x̄=${fmt(v.xbar, 1)}. ${Math.floor(v.conf)}% CI ≈ [${fmt(v.xbar - half, 2)}, ${fmt(v.xbar + half, 2)}].`;
    },
    compute(v) {
      const z = zFromConf(v.conf);
      const se = v.sigma / Math.sqrt(Math.max(1, v.n));
      const half = z * se;
      const lo = v.xbar - half;
      const hi = v.xbar + half;
      // Show as three bars: lo, mean, hi on a line chart of Normal of estimator
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = v.xbar - 4 * se + ((8 * se) * i) / 80;
        series.push({x, y: normalPdf(v.xbar, se, x)});
      }
      return {
        chartType: 'line',
        yLabel: 'estimate',
        series,
        shadeToX: lo,
        refLineX: v.xbar,
        stats: [
          {label: 'z', value: fmt(z, 2)},
          {label: 'SE', value: fmt(se, 2)},
          {label: 'CI low', value: fmt(lo, 2)},
          {label: 'CI high', value: fmt(hi, 2)},
        ],
        note: 'Curve = sampling Normal of x̄. Interval is x̄ ± z·SE.',
      };
    },
  },

  errorPower: {
    id: 'errorPower',
    title: 'Type I / II & Bonferroni',
    subtitle: 'α false positive rate; power; multi-test α/m',
    formula: 'Type I = α    power = 1−β    Bonferroni: α′ = α/m',
    params: [
      {key: 'alpha', label: 'α (Type I)', meaning: 'P(reject H₀ | H₀ true) you tolerate.', min: 0.01, max: 0.2, step: 0.01, default: 0.05},
      {key: 'm', label: 'm tests', meaning: 'Number of simultaneous hypothesis tests.', min: 1, max: 100, step: 1, default: 20},
      {key: 'beta', label: 'β (Type II)', meaning: 'P(miss a real effect). Power = 1−β.', min: 0.05, max: 0.5, step: 0.05, default: 0.2},
    ],
    example(v) {
      const a = v.alpha / Math.max(1, v.m);
      return `Sample: run m=${Math.floor(v.m)} A/B metrics at family α=${fmt(v.alpha, 2)}. Bonferroni per-test α′=${fmt(a, 4)}.`;
    },
    compute(v) {
      const alpha = clamp(v.alpha, 0.001, 0.5);
      const m = Math.max(1, Math.floor(v.m));
      const beta = clamp(v.beta, 0.01, 0.9);
      const per = alpha / m;
      return {
        chartType: 'bar',
        yLabel: 'rate',
        series: [
          {x: 0, y: alpha, label: 'α'},
          {x: 1, y: per, label: 'α/m', highlight: true},
          {x: 2, y: beta, label: 'β'},
          {x: 3, y: 1 - beta, label: 'power'},
        ],
        stats: [
          {label: 'α', value: fmt(alpha, 2)},
          {label: 'Bonferroni α/m', value: fmt(per, 4)},
          {label: 'power 1−β', value: fmt(1 - beta, 2)},
        ],
        note: 'Expected false positives ≈ m·α if you do not correct.',
      };
    },
  },

  mleBernoulli: {
    id: 'mleBernoulli',
    title: 'MLE for Bernoulli p',
    subtitle: 'Log-likelihood peaks at p̂ = successes / n',
    formula: 'ℓ(p)=k log p+(n−k)log(1−p)    p̂_MLE=k/n',
    params: [
      {key: 'n', label: 'n trials', meaning: 'Total independent Bernoulli trials.', min: 5, max: 40, step: 1, default: 20},
      {key: 'k', label: 'k successes', meaning: 'Observed successes.', min: 0, max: 40, step: 1, default: 7},
    ],
    example(v) {
      const n = Math.floor(v.n);
      const k = clamp(Math.floor(v.k), 0, n);
      return `Sample: ${k} clicks out of ${n} impressions. MLE conversion rate = ${fmt(k / n, 2)}. MAP would shrink this toward a prior.`;
    },
    compute(v) {
      const n = Math.floor(v.n);
      const k = clamp(Math.floor(v.k), 0, n);
      const series = [];
      for (let i = 1; i <= 60; i++) {
        const p = i / 61;
        const ll = k * Math.log(p) + (n - k) * Math.log(1 - p);
        series.push({x: p, y: ll});
      }
      const phat = k / n;
      return {
        chartType: 'line',
        yLabel: 'p',
        series,
        refLineX: phat,
        stats: [
          {label: 'p̂_MLE', value: fmt(phat, 2)},
          {label: 'ℓ(p̂)', value: fmt(k * Math.log(Math.max(1e-9, phat)) + (n - k) * Math.log(Math.max(1e-9, 1 - phat)), 2)},
        ],
        note: 'Orange line = MLE. MAP multiplies by a prior g(p) before maximizing.',
      };
    },
  },
};

function normalize4(v) {
  let a = Math.max(0.01, v.p1);
  let b = Math.max(0.01, v.p2);
  let c = Math.max(0.01, v.p3);
  let d = Math.max(0.01, 1 - a - b - c);
  const s = a + b + c + d;
  return [a / s, b / s, c / s, d / s];
}

function zFromConf(conf) {
  const c = Math.floor(conf);
  if (c >= 99) return 2.576;
  if (c >= 95) return 1.96;
  if (c >= 90) return 1.645;
  return 1.28; // ~80%
}

/** Rough Student-t PDF via Gamma ratios — good enough for viz. */
function tPdf(df, x) {
  const v = df;
  const c = Math.exp(logGamma((v + 1) / 2) - logGamma(v / 2)) / (Math.sqrt(v * Math.PI));
  return c * Math.pow(1 + (x * x) / v, -(v + 1) / 2);
}

function logGamma(z) {
  // Lanczos-ish simple Stirling for z>0.5
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843696540789e-6,
    1.5056327351493116e-7,
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

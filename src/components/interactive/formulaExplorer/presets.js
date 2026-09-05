import {
  binomialPmf,
  clamp,
  comb,
  exponentialPdf,
  fmt,
  normalCdf,
  normalPdf,
  perm,
  poissonPmf,
  uniformCdf,
  uniformPdf,
} from './probMath';

/**
 * @typedef {{
 *   key: string,
 *   label: string,
 *   meaning: string,
 *   min: number,
 *   max: number,
 *   step: number,
 *   default: number,
 * }} ParamDef
 *
 * @typedef {{
 *   id: string,
 *   title: string,
 *   subtitle: string,
 *   formula: string,
 *   params: ParamDef[],
 *   example: (v: Record<string, number>) => string,
 *   compute: (v: Record<string, number>) => object,
 * }} Preset
 */

/** @type {Record<string, Preset>} */
export const PRESETS = {
  bayes: {
    id: 'bayes',
    title: 'Bayes’ rule',
    subtitle: 'Slide prior and test accuracy — watch prior vs posterior',
    formula: 'P(A|B) = P(B|A) P(A) / P(B)',
    params: [
      {
        key: 'prior',
        label: 'P(A) prior',
        meaning: 'Base rate — how common event A is before you see evidence (e.g. disease prevalence).',
        min: 0.001,
        max: 0.5,
        step: 0.001,
        default: 0.01,
      },
      {
        key: 'sens',
        label: 'P(B|A) sensitivity',
        meaning: 'True positive rate — if A is true, chance the test/evidence B shows up.',
        min: 0.5,
        max: 1,
        step: 0.01,
        default: 0.99,
      },
      {
        key: 'fpr',
        label: 'P(B|Aᶜ) false positive',
        meaning: 'False positive rate — if A is false, chance you still see evidence B.',
        min: 0,
        max: 0.5,
        step: 0.01,
        default: 0.05,
      },
    ],
    example(v) {
      const prior = clamp(v.prior, 0.0001, 0.9999);
      const sens = clamp(v.sens, 0, 1);
      const fpr = clamp(v.fpr, 0, 1);
      const pB = sens * prior + fpr * (1 - prior);
      const post = pB > 0 ? (sens * prior) / pB : 0;
      return (
        `Sample: A rare disease has prevalence P(A)=${fmt(prior)} (that’s n-style “how common”). ` +
        `A test is positive (B) with sensitivity ${fmt(sens)} and false-positive rate ${fmt(fpr)}. ` +
        `Question: given a positive test, what’s P(disease|positive)? → posterior ${fmt(post)}.`
      );
    },
    compute(v) {
      const prior = clamp(v.prior, 0.0001, 0.9999);
      const sens = clamp(v.sens, 0, 1);
      const fpr = clamp(v.fpr, 0, 1);
      const pB = sens * prior + fpr * (1 - prior);
      const post = pB > 0 ? (sens * prior) / pB : 0;
      return {
        chartType: 'bar',
        yLabel: 'probability',
        series: [
          {x: 0, y: prior, label: 'prior', highlight: false},
          {x: 1, y: post, label: 'posterior', highlight: true},
        ],
        stats: [
          {label: 'P(B)', value: fmt(pB)},
          {label: 'P(A|B) posterior', value: fmt(post)},
          {label: 'lift vs prior', value: fmt(prior > 0 ? post / prior : 0, 2) + '×'},
        ],
        note: 'Low prior + nonzero FPR → posterior stays modest even with high sensitivity.',
      };
    },
  },

  totalProb: {
    id: 'totalProb',
    title: 'Law of total probability',
    subtitle: 'Two segments: overall P(A) = Σ P(A|Bᵢ) P(Bᵢ)',
    formula: 'P(A) = P(A|B₁)P(B₁) + P(A|B₂)P(B₂)',
    params: [
      {
        key: 'pB1',
        label: 'P(B₁) segment weight',
        meaning: 'Share of traffic/customers in segment 1 (B₂ gets the rest: 1 − P(B₁)).',
        min: 0.05,
        max: 0.95,
        step: 0.01,
        default: 0.4,
      },
      {
        key: 'pA1',
        label: 'P(A|B₁)',
        meaning: 'Chance of the outcome A inside segment 1 (e.g. purchase rate for new users).',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
      },
      {
        key: 'pA2',
        label: 'P(A|B₂)',
        meaning: 'Chance of outcome A inside segment 2 (e.g. purchase rate for returning users).',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.1,
      },
    ],
    example(v) {
      const pB1 = clamp(v.pB1, 0.01, 0.99);
      const pB2 = 1 - pB1;
      const pA = v.pA1 * pB1 + v.pA2 * pB2;
      return (
        `Sample: ${fmt(100 * pB1, 0)}% of users are new (B₁) and buy with probability ${fmt(v.pA1)}; ` +
        `the other ${fmt(100 * pB2, 0)}% are returning (B₂) and buy with probability ${fmt(v.pA2)}. ` +
        `Overall purchase rate P(A) = ${fmt(pA)}.`
      );
    },
    compute(v) {
      const pB1 = clamp(v.pB1, 0.01, 0.99);
      const pB2 = 1 - pB1;
      const c1 = v.pA1 * pB1;
      const c2 = v.pA2 * pB2;
      const pA = c1 + c2;
      return {
        chartType: 'bar',
        yLabel: 'contribution',
        series: [
          {x: 0, y: c1, label: 'B₁ branch', highlight: false},
          {x: 1, y: c2, label: 'B₂ branch', highlight: false},
          {x: 2, y: pA, label: 'P(A)', highlight: true},
        ],
        stats: [
          {label: 'P(B₂)', value: fmt(pB2)},
          {label: 'P(A)', value: fmt(pA)},
        ],
      };
    },
  },

  counting: {
    id: 'counting',
    title: 'Permutations vs combinations',
    subtitle: 'Order matters → P(n,k); order does not → C(n,k)',
    formula: 'P(n,k) = n!/(n−k)!    C(n,k) = n!/(k!(n−k)!)',
    params: [
      {
        key: 'n',
        label: 'n (pool size)',
        meaning: 'How many items you have to choose from (candidates, cards, people at a table).',
        min: 1,
        max: 20,
        step: 1,
        default: 4,
      },
      {
        key: 'k',
        label: 'k (take this many)',
        meaning: 'How many you select or arrange from the pool (slots, committee seats, cards drawn).',
        min: 0,
        max: 20,
        step: 1,
        default: 2,
      },
    ],
    example(v) {
      const n = Math.floor(v.n);
      const k = Math.min(Math.floor(v.k), n);
      const p = perm(n, k);
      const c = comb(n, k);
      return (
        `Sample: You have ${n} candidates (n = ${n}) and ${k} interview slots (k = ${k}). ` +
        `If order of interviews matters (who goes first vs second), count permutations P(${n},${k}) = ${fmt(p, 0)}. ` +
        `If you only pick an unordered shortlist of ${k}, count combinations C(${n},${k}) = ${fmt(c, 0)}.`
      );
    },
    compute(v) {
      const n = Math.floor(v.n);
      const k = Math.min(Math.floor(v.k), n);
      const series = [];
      for (let i = 0; i <= n; i++) {
        series.push({
          x: i,
          y: comb(n, i),
          label: String(i),
          highlight: i === k,
        });
      }
      return {
        chartType: 'bar',
        yLabel: 'C(n, k) for each k',
        series,
        stats: [
          {label: `P(${n},${k}) ordered`, value: fmt(perm(n, k), 0)},
          {label: `C(${n},${k}) unordered`, value: fmt(comb(n, k), 0)},
          {label: 'ratio P/C (= k!)', value: k === 0 ? '1' : fmt(factorialSafeRatio(n, k), 2)},
        ],
        note: 'Bars show C(n,·) across every possible k. Highlighted bar is your current k.',
      };
    },
  },

  discreteCdf: {
    id: 'discreteCdf',
    title: 'PMF and CDF (Binomial)',
    subtitle: 'Mass at each k vs cumulative F(x) = P(X ≤ x)',
    formula: 'f(k) = P(X=k)    F(x) = Σ_{k≤x} f(k)',
    params: [
      {
        key: 'n',
        label: 'n (trials)',
        meaning: 'Fixed number of independent yes/no trials (flips, users shown an ad).',
        min: 2,
        max: 30,
        step: 1,
        default: 12,
      },
      {
        key: 'p',
        label: 'p (success chance)',
        meaning: 'Probability of “success” on one trial (heads, click, conversion).',
        min: 0.05,
        max: 0.95,
        step: 0.01,
        default: 0.4,
      },
      {
        key: 'x',
        label: 'x (CDF cutoff)',
        meaning: 'Count threshold — CDF answers P(X ≤ x), “at most x successes”.',
        min: 0,
        max: 30,
        step: 1,
        default: 5,
      },
    ],
    example(v) {
      const n = Math.floor(v.n);
      const p = clamp(v.p, 0, 1);
      const x = clamp(Math.floor(v.x), 0, n);
      let Fx = 0;
      for (let k = 0; k <= x; k++) Fx += binomialPmf(n, p, k);
      return (
        `Sample: You run ${n} independent trials (n), each succeeds with probability ${fmt(p)} (p). ` +
        `X = number of successes. What’s P(X ≤ ${x})? That’s F(${x}) = ${fmt(Fx)}.`
      );
    },
    compute(v) {
      const n = Math.floor(v.n);
      const p = clamp(v.p, 0, 1);
      const x = clamp(Math.floor(v.x), 0, n);
      const pmf = [];
      let cdf = 0;
      let Fx = 0;
      for (let k = 0; k <= n; k++) {
        const mass = binomialPmf(n, p, k);
        cdf += mass;
        if (k === x) Fx = cdf;
        pmf.push({x: k, y: mass, label: String(k), highlight: k === x});
      }
      return {
        chartType: 'bar',
        yLabel: 'PMF P(X=k)',
        series: pmf,
        stats: [
          {label: `P(X=${x})`, value: fmt(binomialPmf(n, p, x))},
          {label: `F(${x}) = P(X≤${x})`, value: fmt(Fx)},
          {label: 'E[X]', value: fmt(n * p, 2)},
        ],
      };
    },
  },

  jointDiscrete: {
    id: 'jointDiscrete',
    title: 'Joint → marginal',
    subtitle: '2×2 joint masses; margins are row/column sums',
    formula: 'f_X(x) = Σ_y f(x,y)',
    params: [
      {
        key: 'p00',
        label: 'P(X=0,Y=0)',
        meaning: 'Joint mass — both variables are 0 together (e.g. no click & no purchase).',
        min: 0.05,
        max: 0.7,
        step: 0.01,
        default: 0.4,
      },
      {
        key: 'p01',
        label: 'P(X=0,Y=1)',
        meaning: 'Joint mass — X=0 and Y=1 (e.g. no click but somehow purchased — rare cell).',
        min: 0.05,
        max: 0.7,
        step: 0.01,
        default: 0.1,
      },
      {
        key: 'p10',
        label: 'P(X=1,Y=0)',
        meaning: 'Joint mass — X=1 and Y=0 (e.g. click but no purchase).',
        min: 0.05,
        max: 0.7,
        step: 0.01,
        default: 0.2,
      },
    ],
    example(v) {
      let a = Math.max(0.01, v.p00);
      let b = Math.max(0.01, v.p01);
      let c = Math.max(0.01, v.p10);
      let d = Math.max(0.01, 1 - a - b - c);
      const s = a + b + c + d;
      a /= s;
      b /= s;
      c /= s;
      d /= s;
      return (
        `Sample: X = clicked ad (0/1), Y = purchased (0/1). Joint cell P(X=0,Y=0)=${fmt(a)}. ` +
        `Marginal P(clicked)=P(X=1)=${fmt(c + d)} is the sum of the X=1 row. ` +
        `P(X=1,Y=1) is filled automatically so the table sums to 1 (= ${fmt(d)}).`
      );
    },
    compute(v) {
      let a = Math.max(0.01, v.p00);
      let b = Math.max(0.01, v.p01);
      let c = Math.max(0.01, v.p10);
      let d = Math.max(0.01, 1 - a - b - c);
      const s = a + b + c + d;
      a /= s;
      b /= s;
      c /= s;
      d /= s;
      const mX0 = a + b;
      const mX1 = c + d;
      const mY0 = a + c;
      const mY1 = b + d;
      return {
        chartType: 'heatmap',
        series: [
          {i: 0, j: 0, v: a, label: fmt(a, 2)},
          {i: 0, j: 1, v: b, label: fmt(b, 2)},
          {i: 1, j: 0, v: c, label: fmt(c, 2)},
          {i: 1, j: 1, v: d, label: fmt(d, 2)},
        ],
        stats: [
          {label: 'P(X=0)', value: fmt(mX0)},
          {label: 'P(X=1)', value: fmt(mX1)},
          {label: 'P(Y=0)', value: fmt(mY0)},
          {label: 'P(Y=1)', value: fmt(mY1)},
        ],
        note: 'Rows X=0,1 · columns Y=0,1. P(X=1,Y=1) fills so the joint sums to 1.',
      };
    },
  },

  binomial: {
    id: 'binomial',
    title: 'Binomial PMF',
    subtitle: 'k successes in n Bernoulli trials with success p',
    formula: 'P(X=k) = C(n,k) p^k (1−p)^{n−k}',
    params: [
      {
        key: 'n',
        label: 'n (trials)',
        meaning: 'How many independent attempts (coin flips, users in an A/B cell).',
        min: 1,
        max: 40,
        step: 1,
        default: 20,
      },
      {
        key: 'p',
        label: 'p (success per trial)',
        meaning: 'Chance one trial succeeds (fair coin → 0.5; click-through rate, etc.).',
        min: 0.05,
        max: 0.95,
        step: 0.01,
        default: 0.35,
      },
      {
        key: 'k',
        label: 'k (successes to highlight)',
        meaning: 'A specific count of successes you care about — chart highlights P(X=k).',
        min: 0,
        max: 40,
        step: 1,
        default: 7,
      },
    ],
    example(v) {
      const n = Math.floor(v.n);
      const p = clamp(v.p, 0, 1);
      const k = clamp(Math.floor(v.k), 0, n);
      return (
        `Sample: ${n} users each convert with probability ${fmt(p)}. ` +
        `n = users tried, p = conversion rate, k = ${k} conversions. ` +
        `P(exactly ${k} conversions) = ${fmt(binomialPmf(n, p, k))}.`
      );
    },
    compute(v) {
      const n = Math.floor(v.n);
      const p = clamp(v.p, 0, 1);
      const k = clamp(Math.floor(v.k), 0, n);
      const series = [];
      for (let i = 0; i <= n; i++) {
        series.push({x: i, y: binomialPmf(n, p, i), label: String(i), highlight: i === k});
      }
      return {
        chartType: 'bar',
        yLabel: 'P(X=k)',
        series,
        stats: [
          {label: `P(X=${k})`, value: fmt(binomialPmf(n, p, k))},
          {label: 'E[X]=np', value: fmt(n * p, 2)},
          {label: 'Var=np(1−p)', value: fmt(n * p * (1 - p), 2)},
        ],
      };
    },
  },

  poisson: {
    id: 'poisson',
    title: 'Poisson PMF',
    subtitle: 'Event counts at rate λ over a fixed interval',
    formula: 'P(X=k) = e^{−λ} λ^k / k!',
    params: [
      {
        key: 'lambda',
        label: 'λ (average rate)',
        meaning: 'Expected number of events in the interval (visits/hour, defects per sheet).',
        min: 0.2,
        max: 20,
        step: 0.1,
        default: 4,
      },
      {
        key: 'k',
        label: 'k (count to highlight)',
        meaning: 'A specific count — “probability of exactly k events”.',
        min: 0,
        max: 30,
        step: 1,
        default: 3,
      },
    ],
    example(v) {
      const lambda = Math.max(0.05, v.lambda);
      const k = Math.floor(v.k);
      return (
        `Sample: A site averages λ=${fmt(lambda, 1)} visits per minute. ` +
        `What’s P(exactly ${k} visits in the next minute)? → ${fmt(poissonPmf(lambda, k))}.`
      );
    },
    compute(v) {
      const lambda = Math.max(0.05, v.lambda);
      const kMax = Math.min(40, Math.max(12, Math.ceil(lambda + 6 * Math.sqrt(lambda))));
      const k = clamp(Math.floor(v.k), 0, kMax);
      const series = [];
      for (let i = 0; i <= kMax; i++) {
        series.push({x: i, y: poissonPmf(lambda, i), label: String(i), highlight: i === k});
      }
      return {
        chartType: 'bar',
        yLabel: 'P(X=k)',
        series,
        stats: [
          {label: `P(X=${k})`, value: fmt(poissonPmf(lambda, k))},
          {label: 'E[X]=λ', value: fmt(lambda, 2)},
          {label: 'Var=λ', value: fmt(lambda, 2)},
        ],
      };
    },
  },

  uniform: {
    id: 'uniform',
    title: 'Uniform PDF',
    subtitle: 'Constant density on [a, b]',
    formula: 'f(x) = 1/(b−a) on [a,b]',
    params: [
      {
        key: 'a',
        label: 'a (left endpoint)',
        meaning: 'Smallest possible value — start of the flat support.',
        min: -5,
        max: 5,
        step: 0.1,
        default: 0,
      },
      {
        key: 'b',
        label: 'b (right endpoint)',
        meaning: 'Largest possible value — end of the flat support (must be > a).',
        min: -4,
        max: 10,
        step: 0.1,
        default: 4,
      },
      {
        key: 'x',
        label: 'x (point for CDF)',
        meaning: 'A value on the number line — shade shows P(X ≤ x).',
        min: -5,
        max: 10,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      let a = v.a;
      let b = v.b;
      if (b <= a + 0.2) b = a + 0.2;
      return (
        `Sample: A random spinner lands uniformly between a=${fmt(a, 1)} and b=${fmt(b, 1)}. ` +
        `P(X ≤ ${fmt(v.x, 1)}) = F(${fmt(v.x, 1)}) = ${fmt(uniformCdf(a, b, v.x))}.`
      );
    },
    compute(v) {
      let a = v.a;
      let b = v.b;
      if (b <= a + 0.2) b = a + 0.2;
      const xs = [];
      const steps = 80;
      for (let i = 0; i <= steps; i++) {
        const x = a - 1 + ((b - a + 2) * i) / steps;
        xs.push({x, y: uniformPdf(a, b, x), highlight: Math.abs(x - v.x) < (b - a + 2) / steps});
      }
      return {
        chartType: 'line',
        yLabel: 'x',
        series: xs,
        shadeToX: v.x,
        stats: [
          {label: 'f(x) height', value: fmt(1 / (b - a))},
          {label: 'E[X]', value: fmt((a + b) / 2, 2)},
          {label: 'Var', value: fmt(((b - a) ** 2) / 12, 3)},
          {label: `F(${fmt(v.x, 1)})`, value: fmt(uniformCdf(a, b, v.x))},
        ],
      };
    },
  },

  exponential: {
    id: 'exponential',
    title: 'Exponential PDF',
    subtitle: 'Waiting times; memoryless in s and t',
    formula: 'f(x) = λ e^{−λx}   (x ≥ 0)',
    params: [
      {
        key: 'lambda',
        label: 'λ (rate)',
        meaning: 'How quickly events happen — mean wait is 1/λ (larger λ → shorter waits).',
        min: 0.2,
        max: 3,
        step: 0.05,
        default: 1,
      },
      {
        key: 's',
        label: 's (already waited)',
        meaning: 'Time you have already been waiting — used in the memoryless check.',
        min: 0,
        max: 5,
        step: 0.1,
        default: 1,
      },
      {
        key: 't',
        label: 't (extra wait)',
        meaning: 'Additional time from now — compare P(T>t) vs P(T>s+t | T>s).',
        min: 0.1,
        max: 5,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      const lambda = Math.max(0.05, v.lambda);
      return (
        `Sample: Support tickets arrive at rate λ=${fmt(lambda, 2)} per hour (mean wait ${fmt(1 / lambda, 2)} h). ` +
        `You’ve already waited s=${fmt(v.s, 1)} h. Chance you wait another t=${fmt(v.t, 1)} h ` +
        `equals P(T>${fmt(v.t, 1)}) = ${fmt(Math.exp(-lambda * v.t))} — memoryless.`
      );
    },
    compute(v) {
      const lambda = Math.max(0.05, v.lambda);
      const xmax = Math.max(6, 6 / lambda);
      const series = [];
      const steps = 100;
      for (let i = 0; i <= steps; i++) {
        const x = (xmax * i) / steps;
        series.push({x, y: exponentialPdf(lambda, x)});
      }
      const mem = Math.exp(-lambda * v.t);
      return {
        chartType: 'line',
        yLabel: 'x (time)',
        series,
        shadeToX: v.s + v.t,
        stats: [
          {label: 'E[X]=1/λ', value: fmt(1 / lambda, 3)},
          {label: 'Var=1/λ²', value: fmt(1 / (lambda * lambda), 3)},
          {label: 'P(T>t)', value: fmt(mem)},
          {label: 'P(T>s+t | T>s)', value: fmt(mem)},
        ],
        note: 'Memoryless: P(T>s+t | T>s) equals P(T>t) for any s.',
      };
    },
  },

  normal: {
    id: 'normal',
    title: 'Normal PDF',
    subtitle: 'Bell curve; shade shows approximate P(X ≤ x)',
    formula: 'f(x) = (1/√(2π)σ) exp(−(x−μ)²/(2σ²))',
    params: [
      {
        key: 'mu',
        label: 'μ (mean)',
        meaning: 'Center of the bell — typical / average value of X.',
        min: -5,
        max: 5,
        step: 0.1,
        default: 0,
      },
      {
        key: 'sigma',
        label: 'σ (std. dev.)',
        meaning: 'Spread — how wide the bell is (larger σ → flatter, wider).',
        min: 0.3,
        max: 3,
        step: 0.05,
        default: 1,
      },
      {
        key: 'x',
        label: 'x (cutoff)',
        meaning: 'A threshold — shaded area ≈ P(X ≤ x).',
        min: -6,
        max: 6,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      const mu = v.mu;
      const sigma = Math.max(0.15, v.sigma);
      return (
        `Sample: Exam scores ~ Normal(μ=${fmt(mu, 1)}, σ=${fmt(sigma, 2)}). ` +
        `What’s P(score ≤ ${fmt(v.x, 1)})? ≈ ${fmt(normalCdf(mu, sigma, v.x))}.`
      );
    },
    compute(v) {
      const mu = v.mu;
      const sigma = Math.max(0.15, v.sigma);
      const lo = mu - 4 * sigma;
      const hi = mu + 4 * sigma;
      const series = [];
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const x = lo + ((hi - lo) * i) / steps;
        series.push({
          x,
          y: normalPdf(mu, sigma, x),
          highlight: Math.abs(x - v.x) < (hi - lo) / steps,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'x',
        series,
        shadeToX: v.x,
        stats: [
          {label: 'f(x)', value: fmt(normalPdf(mu, sigma, v.x))},
          {label: `P(X≤${fmt(v.x, 1)})`, value: fmt(normalCdf(mu, sigma, v.x))},
          {label: 'Var=σ²', value: fmt(sigma * sigma, 3)},
        ],
      };
    },
  },

  markov2: {
    id: 'markov2',
    title: '2-state Markov chain',
    subtitle: 'Long-run π from transition probabilities',
    formula: 'π = πP   (stationary)',
    params: [
      {
        key: 'p01',
        label: 'P(0→1)',
        meaning: 'Chance of leaving state 0 for state 1 in one step (e.g. inactive → active).',
        min: 0.01,
        max: 0.99,
        step: 0.01,
        default: 0.3,
      },
      {
        key: 'p10',
        label: 'P(1→0)',
        meaning: 'Chance of leaving state 1 for state 0 (e.g. active → churned/inactive).',
        min: 0.01,
        max: 0.99,
        step: 0.01,
        default: 0.2,
      },
      {
        key: 'steps',
        label: 'steps from state 0',
        meaning: 'How many transitions to simulate starting from state 0 — watch mass approach π.',
        min: 0,
        max: 40,
        step: 1,
        default: 10,
      },
    ],
    example(v) {
      const p01 = clamp(v.p01, 0.01, 0.99);
      const p10 = clamp(v.p10, 0.01, 0.99);
      const pi0 = p10 / (p01 + p10);
      const pi1 = p01 / (p01 + p10);
      return (
        `Sample: Users are inactive (0) or active (1). Each week, P(0→1)=${fmt(p01)} and P(1→0)=${fmt(p10)}. ` +
        `Long-run share active π₁ = ${fmt(pi1)}; inactive π₀ = ${fmt(pi0)}. ` +
        `Orange bars = distribution after ${Math.floor(v.steps)} weeks from inactive.`
      );
    },
    compute(v) {
      const p01 = clamp(v.p01, 0.01, 0.99);
      const p10 = clamp(v.p10, 0.01, 0.99);
      const p00 = 1 - p01;
      const p11 = 1 - p10;
      const pi0 = p10 / (p01 + p10);
      const pi1 = p01 / (p01 + p10);
      let a = 1;
      let b = 0;
      const n = Math.floor(v.steps);
      for (let t = 0; t < n; t++) {
        const na = a * p00 + b * p10;
        const nb = a * p01 + b * p11;
        a = na;
        b = nb;
      }
      return {
        chartType: 'bar',
        yLabel: 'probability mass',
        series: [
          {x: 0, y: pi0, label: 'π₀ stationary', highlight: false},
          {x: 1, y: pi1, label: 'π₁ stationary', highlight: false},
          {x: 2, y: a, label: `p₀ after ${n}`, highlight: true},
          {x: 3, y: b, label: `p₁ after ${n}`, highlight: true},
        ],
        stats: [
          {label: 'P(0→0)', value: fmt(p00)},
          {label: 'P(1→1)', value: fmt(p11)},
          {label: 'π₀', value: fmt(pi0)},
          {label: 'π₁', value: fmt(pi1)},
        ],
        note: 'Start in state 0; orange bars approach blue stationary π as steps grow.',
      };
    },
  },
};

function factorialSafeRatio(_n, k) {
  let r = 1;
  for (let i = 2; i <= k; i++) r *= i;
  return r;
}

export function getPreset(id) {
  return PRESETS[id] || null;
}

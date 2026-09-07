import {clamp, fmt} from './probMath.js';

/**
 * FormulaExplorer presets for ML math foundations (lesson-22).
 * Same slider + chart pattern as probability / statistics explorers.
 */
export const ML_PRESETS = {
  mlEigenScale: {
    id: 'mlEigenScale',
    title: 'Eigenvalue scaling',
    subtitle: 'On an eigenvector, A only stretches — slide λ and watch Ax = λx',
    formula: '$Ax = \\lambda x\\quad\\text{(here: 1-D map }x\\mapsto\\lambda x\\text{)}$',
    params: [
      {
        key: 'lambda',
        label: 'λ eigenvalue',
        meaning: 'Stretch factor along the eigenvector direction (negative = reverse).',
        min: -2,
        max: 3,
        step: 0.1,
        default: 2,
      },
      {
        key: 'x',
        label: 'x (input)',
        meaning: 'Coordinate along the eigenvector.',
        min: -2,
        max: 2,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      const lam = v.lambda;
      const x = v.x;
      return `Sample: covariance stretch in PCA — direction x=${fmt(x, 1)} is scaled by λ=${fmt(lam, 1)} → Ax=${fmt(lam * x, 2)}.`;
    },
    compute(v) {
      const lam = v.lambda;
      const x0 = v.x;
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = -2.5 + (5 * i) / 80;
        series.push({x, y: lam * x});
      }
      return {
        chartType: 'line',
        yLabel: 'Ax',
        series,
        refLineX: x0,
        stats: [
          {label: 'λ', value: fmt(lam, 2)},
          {label: 'x', value: fmt(x0, 2)},
          {label: 'Ax = λx', value: fmt(lam * x0, 2)},
        ],
        note: 'Orange dashed = your x. Blue line = the linear map y=λx (eigen-direction only).',
      };
    },
  },

  mlGradLandscape: {
    id: 'mlGradLandscape',
    title: 'Gradient descent on a bowl',
    subtitle: 'Cost ½(x−μ)² — slide start, step size, and steps; watch where you land',
    formula: '$x \\leftarrow x - \\alpha\\nabla f(x)\\qquad f(x)=\\tfrac12(x-\\mu)^2\\qquad \\nabla f=x-\\mu$',
    params: [
      {
        key: 'mu',
        label: 'μ (minimum)',
        meaning: 'Where the bowl bottoms out.',
        min: -2,
        max: 4,
        step: 0.5,
        default: 2,
      },
      {
        key: 'x0',
        label: 'x₀ start',
        meaning: 'Initial parameter guess.',
        min: -3,
        max: 6,
        step: 0.25,
        default: -1,
      },
      {
        key: 'alpha',
        label: 'α learning rate',
        meaning: 'Step size. Too large → overshoot; too small → crawl.',
        min: 0.05,
        max: 1.2,
        step: 0.05,
        default: 0.35,
      },
      {
        key: 'steps',
        label: 'GD steps',
        meaning: 'How many updates to run from x₀.',
        min: 0,
        max: 25,
        step: 1,
        default: 8,
      },
    ],
    example(v) {
      return `Sample: fit a 1-D parameter toward μ=${fmt(v.mu, 1)}. Start at ${fmt(v.x0, 1)}, take ${Math.floor(v.steps)} steps with α=${fmt(v.alpha, 2)}.`;
    },
    compute(v) {
      const mu = v.mu;
      const alpha = clamp(v.alpha, 0.01, 1.5);
      const steps = Math.floor(v.steps);
      let x = v.x0;
      for (let t = 0; t < steps; t++) {
        x = x - alpha * (x - mu);
      }
      const series = [];
      for (let i = 0; i <= 100; i++) {
        const t = -3.5 + (10 * i) / 100;
        const f = 0.5 * (t - mu) ** 2;
        series.push({x: t, y: f});
      }
      const fNow = 0.5 * (x - mu) ** 2;
      return {
        chartType: 'line',
        yLabel: 'f(x)',
        series,
        refLineX: x,
        refLineY: null,
        stats: [
          {label: 'x after steps', value: fmt(x, 2)},
          {label: 'f(x)', value: fmt(fNow, 2)},
          {label: '|x−μ|', value: fmt(Math.abs(x - mu), 2)},
          {label: 'α', value: fmt(alpha, 2)},
        ],
        note: 'Blue = cost landscape. Orange dashed = parameter after your GD run. Try α>1 — notice overshoot.',
      };
    },
  },

  mlGradPath: {
    id: 'mlGradPath',
    title: 'GD path over iterations',
    subtitle: 'Same bowl — x-axis is iteration; watch x_t approach μ',
    formula: '$x_{t+1} = x_t - \\alpha(x_t - \\mu)$',
    params: [
      {
        key: 'mu',
        label: 'μ target',
        meaning: 'True minimizer.',
        min: -1,
        max: 4,
        step: 0.5,
        default: 2,
      },
      {
        key: 'x0',
        label: 'x₀',
        meaning: 'Start value.',
        min: -2,
        max: 5,
        step: 0.25,
        default: 0,
      },
      {
        key: 'alpha',
        label: 'α',
        meaning: 'Learning rate.',
        min: 0.05,
        max: 1.4,
        step: 0.05,
        default: 0.4,
      },
      {
        key: 'T',
        label: 'iterations shown',
        meaning: 'Length of the path plot.',
        min: 5,
        max: 40,
        step: 1,
        default: 20,
      },
    ],
    example(v) {
      return `Sample: interview whiteboard of GD on a quadratic — after several steps x hugs μ=${fmt(v.mu, 1)}.`;
    },
    compute(v) {
      const mu = v.mu;
      const alpha = clamp(v.alpha, 0.01, 1.5);
      const T = Math.floor(v.T);
      let x = v.x0;
      const series = [{x: 0, y: x}];
      for (let t = 1; t <= T; t++) {
        x = x - alpha * (x - mu);
        series.push({x: t, y: x});
      }
      return {
        chartType: 'line',
        yLabel: 'x_t',
        series,
        refLineY: mu,
        stats: [
          {label: 'μ', value: fmt(mu, 2)},
          {label: `x_${T}`, value: fmt(x, 2)},
          {label: 'α', value: fmt(alpha, 2)},
        ],
        note: 'Green dashed = μ. Blue = parameter trajectory. Large α can oscillate around the target.',
      };
    },
  },

  mlBiasVariance: {
    id: 'mlBiasVariance',
    title: 'Bias–variance vs complexity',
    subtitle: 'Slide model complexity — watch bias² drop, variance rise, total error U-shape',
    formula: '$E[\\mathrm{error}] \\approx \\mathrm{bias}^{2} + \\mathrm{variance} + \\sigma^{2}_{\\mathrm{noise}}$',
    params: [
      {
        key: 'c',
        label: 'complexity',
        meaning: '0 = very simple (high bias); 1 = very flexible (high variance).',
        min: 0,
        max: 1,
        step: 0.02,
        default: 0.35,
      },
      {
        key: 'noise',
        label: 'irreducible σ²',
        meaning: 'Noise floor you cannot remove.',
        min: 0.05,
        max: 0.4,
        step: 0.01,
        default: 0.12,
      },
    ],
    example(v) {
      return `Sample: choosing polynomial degree / tree depth. Complexity=${fmt(v.c, 2)} — too low underfits; too high overfits.`;
    },
    compute(v) {
      const noise = clamp(v.noise, 0.01, 0.5);
      const cStar = v.c;
      const series = [];
      for (let i = 0; i <= 60; i++) {
        const c = i / 60;
        const bias2 = 0.85 * (1 - c) ** 2;
        const variance = 0.9 * c ** 2;
        const total = bias2 + variance + noise;
        series.push({x: c, y: total});
      }
      const bias2 = 0.85 * (1 - cStar) ** 2;
      const variance = 0.9 * cStar ** 2;
      const total = bias2 + variance + noise;
      return {
        chartType: 'line',
        yLabel: 'expected error',
        series,
        refLineX: cStar,
        stats: [
          {label: 'bias²', value: fmt(bias2, 2)},
          {label: 'variance', value: fmt(variance, 2)},
          {label: 'σ² noise', value: fmt(noise, 2)},
          {label: 'total', value: fmt(total, 2)},
        ],
        note: 'Blue = total expected error vs complexity. Orange = your operating point. Sweet spot is the valley.',
      };
    },
  },

  mlRidgeShrink: {
    id: 'mlRidgeShrink',
    title: 'Ridge shrinkage',
    subtitle: 'Slide λ — OLS coefficients shrink toward 0 (1-D closed form)',
    formula: '$\\hat{\\beta}_{\\mathrm{ridge}} = (x^{\\mathsf{T}}x + \\lambda)^{-1} x^{\\mathsf{T}}y\\quad\\text{(scalar feature, no intercept)}$',
    params: [
      {
        key: 'lam',
        label: 'λ ridge',
        meaning: 'Penalty strength. λ=0 → OLS; large λ → stronger shrink.',
        min: 0,
        max: 40,
        step: 0.5,
        default: 5,
      },
      {
        key: 'xty',
        label: 'xᵀy',
        meaning: 'Unnormalized correlation of feature with target.',
        min: 5,
        max: 40,
        step: 1,
        default: 20,
      },
      {
        key: 'xtx',
        label: 'xᵀx',
        meaning: 'Feature energy (sum of squares).',
        min: 5,
        max: 40,
        step: 1,
        default: 10,
      },
    ],
    example(v) {
      const ols = v.xty / v.xtx;
      return `Sample: one standardized feature. OLS β=${fmt(ols, 2)}; ridge pulls it toward 0 as λ grows.`;
    },
    compute(v) {
      const xtx = Math.max(0.5, v.xtx);
      const xty = v.xty;
      const lam = Math.max(0, v.lam);
      const ols = xty / xtx;
      const ridge = xty / (xtx + lam);
      const series = [];
      for (let i = 0; i <= 50; i++) {
        const L = (40 * i) / 50;
        series.push({x: L, y: xty / (xtx + L)});
      }
      return {
        chartType: 'line',
        yLabel: 'β̂(λ)',
        series,
        refLineX: lam,
        refLineY: ols,
        stats: [
          {label: 'β OLS', value: fmt(ols, 2)},
          {label: 'β ridge', value: fmt(ridge, 2)},
          {label: '|β_r|/|β_o|', value: fmt(Math.abs(ols) < 1e-9 ? 0 : Math.abs(ridge / ols), 2)},
          {label: 'λ', value: fmt(lam, 1)},
        ],
        note: 'Blue = β̂ vs λ. Green dashed = OLS. Orange = your λ. Same story as L2 penalty in interviews.',
      };
    },
  },

  mlSoftThreshold: {
    id: 'mlSoftThreshold',
    title: 'Lasso soft-threshold',
    subtitle: 'Proximal map for L1 — slide threshold t; values inside (−t,t) die',
    formula: '$S_t(v) = \\mathrm{sign}(v)\\cdot\\max(|v|-t,\\,0)$',
    params: [
      {
        key: 't',
        label: 't threshold',
        meaning: 'Soft-threshold level (related to λ in ISTA / coordinate descent).',
        min: 0,
        max: 1.5,
        step: 0.05,
        default: 0.5,
      },
      {
        key: 'v',
        label: 'input v',
        meaning: 'A coefficient before the proximal step.',
        min: -2,
        max: 2,
        step: 0.05,
        default: 1.2,
      },
    ],
    example(v) {
      return `Sample: one coordinate update in lasso. Input v=${fmt(v.v, 2)}; after soft-threshold at t=${fmt(v.t, 2)} small weights zero out (sparsity).`;
    },
    compute(v) {
      const t = Math.max(0, v.t);
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = -2.2 + (4.4 * i) / 80;
        let y = 0;
        if (x > t) y = x - t;
        else if (x < -t) y = x + t;
        series.push({x, y});
      }
      let out = 0;
      if (v.v > t) out = v.v - t;
      else if (v.v < -t) out = v.v + t;
      return {
        chartType: 'line',
        yLabel: 'S_t(v)',
        series,
        refLineX: v.v,
        stats: [
          {label: 't', value: fmt(t, 2)},
          {label: 'v', value: fmt(v.v, 2)},
          {label: 'S_t(v)', value: fmt(out, 2)},
          {label: 'zeroed?', value: Math.abs(out) < 1e-12 ? 'yes' : 'no'},
        ],
        note: 'Blue = soft-threshold function. Orange = your v. Flat zero band is why L1 sparsifies.',
      };
    },
  },

  // —— Linear regression ——
  lrLine: {
    id: 'lrLine',
    title: 'Linear model ŷ = β₀ + β₁x',
    subtitle: 'Slide intercept and slope — watch the prediction line and a sample point',
    formula: '$\\hat{y} = \\beta_0 + \\beta_1 x$',
    params: [
      {
        key: 'b0',
        label: 'β₀ intercept',
        meaning: 'Predicted y when x = 0.',
        min: -2,
        max: 5,
        step: 0.25,
        default: 1,
      },
      {
        key: 'b1',
        label: 'β₁ slope',
        meaning: 'Change in ŷ per one-unit change in x.',
        min: -1,
        max: 3,
        step: 0.1,
        default: 1.5,
      },
      {
        key: 'x',
        label: 'query x',
        meaning: 'A feature value to read off the line.',
        min: 0,
        max: 6,
        step: 0.25,
        default: 2,
      },
    ],
    example(v) {
      const yhat = v.b0 + v.b1 * v.x;
      return `Sample: price ≈ ${fmt(v.b0, 2)} + ${fmt(v.b1, 2)}·sqft. At x=${fmt(v.x, 2)}, ŷ=${fmt(yhat, 2)}.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 60; i++) {
        const x = (6 * i) / 60;
        series.push({x, y: v.b0 + v.b1 * x});
      }
      const yhat = v.b0 + v.b1 * v.x;
      return {
        chartType: 'line',
        yLabel: 'ŷ',
        series,
        refLineX: v.x,
        stats: [
          {label: 'β₀', value: fmt(v.b0, 2)},
          {label: 'β₁', value: fmt(v.b1, 2)},
          {label: 'ŷ(x)', value: fmt(yhat, 2)},
        ],
        note: 'Orange dashed = your query x. Blue = the linear predictor.',
      };
    },
  },

  lrMseVsSlope: {
    id: 'lrMseVsSlope',
    title: 'MSE vs slope (fixed data)',
    subtitle: 'Tiny dataset y≈1+2x — slide β₁ (β₀ fixed at 1) and find the MSE valley',
    formula: '$\\mathrm{MSE} = \\dfrac{1}{n}\\sum\\bigl(y_i - (\\beta_0 + \\beta_1 x_i)\\bigr)^2$',
    params: [
      {
        key: 'b1',
        label: 'β₁ try',
        meaning: 'Candidate slope (intercept locked at 1).',
        min: 0,
        max: 4,
        step: 0.05,
        default: 1.2,
      },
    ],
    example() {
      return 'Sample: points (0,1), (1,3), (2,5), (3,7). True line is 1+2x — MSE bottoms near β₁=2.';
    },
    compute(v) {
      const xs = [0, 1, 2, 3];
      const ys = [1, 3, 5, 7];
      const b0 = 1;
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const b1 = (4 * i) / 80;
        let sse = 0;
        for (let j = 0; j < xs.length; j++) {
          const e = ys[j] - (b0 + b1 * xs[j]);
          sse += e * e;
        }
        series.push({x: b1, y: sse / xs.length});
      }
      let sse = 0;
      for (let j = 0; j < xs.length; j++) {
        const e = ys[j] - (b0 + v.b1 * xs[j]);
        sse += e * e;
      }
      const mse = sse / xs.length;
      return {
        chartType: 'line',
        yLabel: 'MSE',
        series,
        refLineX: v.b1,
        stats: [
          {label: 'β₀ (fixed)', value: '1'},
          {label: 'β₁', value: fmt(v.b1, 2)},
          {label: 'MSE', value: fmt(mse, 2)},
        ],
        note: 'Blue = MSE landscape over slope. Orange = your β₁. OLS sits at the bottom of the bowl.',
      };
    },
  },

  lrR2Demo: {
    id: 'lrR2Demo',
    title: 'R² vs residual noise',
    subtitle: 'Predictions = truth + noise scale — slide noise and watch R² collapse',
    formula: '$R^2 = 1 - \\dfrac{\\mathrm{SS}_{\\mathrm{res}}}{\\mathrm{SS}_{\\mathrm{tot}}}$',
    params: [
      {
        key: 'noise',
        label: 'noise scale',
        meaning: 'How far predictions wander from the true y values.',
        min: 0,
        max: 3,
        step: 0.1,
        default: 0.5,
      },
      {
        key: 'seed',
        label: 'seed',
        meaning: 'Different deterministic residual pattern.',
        min: 1,
        max: 20,
        step: 1,
        default: 3,
      },
    ],
    example(v) {
      return `Sample: hold out a fit that is “mostly right” but residuals grow with noise=${fmt(v.noise, 1)}. R² tells how much variance you still explain.`;
    },
    compute(v) {
      const y = [1, 2, 3, 4, 5, 6];
      const ybar = 3.5;
      const ssTot = y.reduce((s, a) => s + (a - ybar) ** 2, 0);
      const seed = Math.floor(v.seed);
      const noise = v.noise;
      const pred = y.map((yi, i) => {
        const u = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
        const r = u - Math.floor(u);
        return yi + noise * (2 * r - 1);
      });
      const ssRes = y.reduce((s, a, i) => s + (a - pred[i]) ** 2, 0);
      const r2 = 1 - ssRes / ssTot;
      const series = y.map((yi, i) => ({x: i + 1, y: Math.abs(yi - pred[i]), label: String(i + 1)}));
      return {
        chartType: 'bar',
        yLabel: '|residual|',
        series,
        stats: [
          {label: 'SS_res', value: fmt(ssRes, 2)},
          {label: 'SS_tot', value: fmt(ssTot, 2)},
          {label: 'R²', value: fmt(r2, 2)},
          {label: 'noise', value: fmt(noise, 1)},
        ],
        note: 'Bars = |y − ŷ| per point. More noise → larger SS_res → lower R².',
      };
    },
  },

  // —— Classification evaluation ——
  clfThresholdMetrics: {
    id: 'clfThresholdMetrics',
    title: 'Threshold → precision / recall / F1',
    subtitle: 'Slide the decision threshold on scored examples — metrics trade off',
    formula: '$\\text{predict }+\\text{ if score }\\ge \\tau$',
    params: [
      {
        key: 'tau',
        label: 'τ threshold',
        meaning: 'Scores at/above τ count as predicted positive.',
        min: 0.05,
        max: 0.95,
        step: 0.05,
        default: 0.5,
      },
      {
        key: 'sep',
        label: 'class separation',
        meaning: 'How far positive scores sit above negatives (higher = easier).',
        min: 0.5,
        max: 3,
        step: 0.1,
        default: 1.6,
      },
    ],
    example(v) {
      return `Sample: fraud scores. Lower τ → more alerts (higher recall, often lower precision). Separation=${fmt(v.sep, 1)}.`;
    },
    compute(v) {
      const sep = v.sep;
      const scores = [];
      // 40 neg ~ N(0.35), 20 pos ~ N(0.35+sep*0.25) clipped
      for (let i = 0; i < 40; i++) {
        const u = Math.sin(i * 7.1 + 2) * 43758.5453;
        const r = u - Math.floor(u);
        scores.push({s: clamp(0.15 + 0.4 * r, 0.01, 0.99), y: 0});
      }
      for (let i = 0; i < 20; i++) {
        const u = Math.sin(i * 9.3 + 5) * 43758.5453;
        const r = u - Math.floor(u);
        scores.push({s: clamp(0.35 + sep * 0.2 + 0.25 * r, 0.01, 0.99), y: 1});
      }
      const series = [];
      for (let i = 1; i <= 19; i++) {
        const tau = i / 20;
        const m = confusionFromScores(scores, tau);
        series.push({x: tau, y: m.f1});
      }
      const cur = confusionFromScores(scores, v.tau);
      return {
        chartType: 'line',
        yLabel: 'F1',
        series,
        refLineX: v.tau,
        stats: [
          {label: 'precision', value: fmt(cur.prec, 2)},
          {label: 'recall', value: fmt(cur.rec, 2)},
          {label: 'F1', value: fmt(cur.f1, 2)},
          {label: 'τ', value: fmt(v.tau, 2)},
        ],
        note: 'Blue = F1 vs threshold. Orange = your τ. Read precision/recall in the chips.',
      };
    },
  },

  clfRocSweep: {
    id: 'clfRocSweep',
    title: 'ROC from score separation',
    formula: '$\\mathrm{TPR} = \\dfrac{\\mathrm{TP}}{\\mathrm{TP}+\\mathrm{FN}}\\qquad \\mathrm{FPR} = \\dfrac{\\mathrm{FP}}{\\mathrm{FP}+\\mathrm{TN}}$',
    params: [
      {
        key: 'sep',
        label: 'separation',
        meaning: 'Gap between negative and positive score clouds.',
        min: 0.2,
        max: 3,
        step: 0.1,
        default: 1.4,
      },
    ],
    example(v) {
      return `Sample: better ranking models push positives to higher scores (separation=${fmt(v.sep, 1)}) → higher AUC.`;
    },
    compute(v) {
      const sep = v.sep;
      const scores = [];
      for (let i = 0; i < 50; i++) {
        const u = Math.sin(i * 3.7 + 1) * 43758.5453;
        const r = u - Math.floor(u);
        scores.push({s: clamp(0.2 + 0.45 * r, 0.01, 0.99), y: 0});
      }
      for (let i = 0; i < 50; i++) {
        const u = Math.sin(i * 4.1 + 8) * 43758.5453;
        const r = u - Math.floor(u);
        scores.push({s: clamp(0.25 + sep * 0.22 + 0.35 * r, 0.01, 0.99), y: 1});
      }
      const sorted = [...scores].sort((a, b) => b.s - a.s);
      const P = scores.filter((z) => z.y === 1).length;
      const N = scores.length - P;
      let tp = 0;
      let fp = 0;
      const series = [{x: 0, y: 0}];
      let prev = null;
      for (const row of sorted) {
        if (prev != null && row.s !== prev) {
          series.push({x: fp / N, y: tp / P});
        }
        if (row.y === 1) tp += 1;
        else fp += 1;
        prev = row.s;
      }
      series.push({x: 1, y: 1});
      // trapezoid AUC
      let auc = 0;
      for (let i = 1; i < series.length; i++) {
        const x0 = series[i - 1].x;
        const y0 = series[i - 1].y;
        const x1 = series[i].x;
        const y1 = series[i].y;
        auc += ((y0 + y1) / 2) * (x1 - x0);
      }
      return {
        chartType: 'line',
        yLabel: 'TPR',
        series,
        stats: [
          {label: 'AUC', value: fmt(auc, 2)},
          {label: 'separation', value: fmt(sep, 1)},
        ],
        note: 'x-axis is FPR, y-axis TPR (ROC). Stronger separation → curve lifts toward the top-left.',
      };
    },
  },

  // —— Classification models ——
  clfSigmoidCurve: {
    id: 'clfSigmoidCurve',
    title: 'Sigmoid σ(z)',
    subtitle: 'Slide z — output is a probability in (0, 1)',
    formula: '$\\sigma(z) = \\dfrac{1}{1+e^{-z}}$',
    params: [
      {
        key: 'z',
        label: 'z = Xβ',
        meaning: 'Linear score before the squash.',
        min: -6,
        max: 6,
        step: 0.1,
        default: 0,
      },
    ],
    example(v) {
      const s = 1 / (1 + Math.exp(-v.z));
      return `Sample: logistic regression score z=${fmt(v.z, 1)} → P(Y=1|X)=${fmt(s, 2)}. Threshold 0.5 ⇔ z=0.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const z = -6 + (12 * i) / 80;
        series.push({x: z, y: 1 / (1 + Math.exp(-z))});
      }
      const s = 1 / (1 + Math.exp(-v.z));
      return {
        chartType: 'line',
        yLabel: 'σ(z)',
        series,
        refLineX: v.z,
        refLineY: 0.5,
        stats: [
          {label: 'z', value: fmt(v.z, 2)},
          {label: 'σ(z)', value: fmt(s, 2)},
          {label: 'class @0.5', value: s >= 0.5 ? '1' : '0'},
        ],
        note: 'Green dashed = 0.5 threshold. Orange = your z.',
      };
    },
  },

  clfLogistic1d: {
    id: 'clfLogistic1d',
    title: '1-D logistic curve',
    subtitle: 'P(Y=1|x)=σ(β₀+β₁x) — slide coefficients; watch the S-curve shift/steepen',
    formula: '$P(Y=1\\mid x) = \\sigma(\\beta_0 + \\beta_1 x)$',
    params: [
      {
        key: 'b0',
        label: 'β₀',
        meaning: 'Bias — shifts the curve left/right.',
        min: -4,
        max: 4,
        step: 0.25,
        default: 0,
      },
      {
        key: 'b1',
        label: 'β₁',
        meaning: 'Weight on x — steeper |β₁| → sharper transition.',
        min: -3,
        max: 3,
        step: 0.1,
        default: 1.5,
      },
      {
        key: 'x',
        label: 'query x',
        meaning: 'Feature value to evaluate.',
        min: -4,
        max: 4,
        step: 0.25,
        default: 0.5,
      },
    ],
    example(v) {
      const z = v.b0 + v.b1 * v.x;
      const p = 1 / (1 + Math.exp(-z));
      return `Sample: churn probability at x=${fmt(v.x, 2)} is ${fmt(p, 2)} with β=(${fmt(v.b0, 1)}, ${fmt(v.b1, 1)}).`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = -4 + (8 * i) / 80;
        const z = v.b0 + v.b1 * x;
        series.push({x, y: 1 / (1 + Math.exp(-z))});
      }
      const z = v.b0 + v.b1 * v.x;
      const p = 1 / (1 + Math.exp(-z));
      return {
        chartType: 'line',
        yLabel: 'P(Y=1|x)',
        series,
        refLineX: v.x,
        refLineY: 0.5,
        stats: [
          {label: 'P(Y=1|x)', value: fmt(p, 2)},
          {label: 'z', value: fmt(z, 2)},
          {label: 'class @0.5', value: p >= 0.5 ? '1' : '0'},
        ],
        note: 'S-curve decision surface in 1-D. Orange = query x; green = 0.5 cut.',
      };
    },
  },

  clfEntropyCurve: {
    id: 'clfEntropyCurve',
    title: 'Binary entropy H(p)',
    subtitle: 'Slide class probability — entropy peaks at 50/50, vanishes at certainty',
    formula: '$H(p) = -p\\log_2 p - (1-p)\\log_2(1-p)$',
    params: [
      {
        key: 'p',
        label: 'p = P(Y=1)',
        meaning: 'Positive-class rate in a node / Bernoulli parameter.',
        min: 0,
        max: 1,
        step: 0.02,
        default: 0.5,
      },
    ],
    example(v) {
      return `Sample: a tree node with positive rate p=${fmt(v.p, 2)}. High entropy → impure node; splits try to reduce it.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 50; i++) {
        const p = i / 50;
        series.push({x: p, y: binaryEntropy(p)});
      }
      return {
        chartType: 'line',
        yLabel: 'H(p)',
        series,
        refLineX: v.p,
        stats: [
          {label: 'p', value: fmt(v.p, 2)},
          {label: 'H(p)', value: fmt(binaryEntropy(v.p), 2)},
        ],
        note: 'Orange = your p. Trees chase splits that move child nodes toward the sides (low H).',
      };
    },
  },

  clfNbPosteriors: {
    id: 'clfNbPosteriors',
    title: 'Naive Bayes posteriors (2 features)',
    subtitle: 'Slide likelihoods and prior — watch which class wins argmax',
    formula: '$\\mathrm{score}(y) \\propto P(y)\\,P(x_1\\mid y)\\,P(x_2\\mid y)$',
    params: [
      {
        key: 'prior1',
        label: 'P(Y=1)',
        meaning: 'Prior for the positive class (P(Y=0)=1−this).',
        min: 0.05,
        max: 0.95,
        step: 0.05,
        default: 0.3,
      },
      {
        key: 'l1_1',
        label: 'P(x₁|Y=1)',
        meaning: 'Likelihood of feature 1 under class 1.',
        min: 0.05,
        max: 0.95,
        step: 0.05,
        default: 0.8,
      },
      {
        key: 'l2_1',
        label: 'P(x₂|Y=1)',
        meaning: 'Likelihood of feature 2 under class 1.',
        min: 0.05,
        max: 0.95,
        step: 0.05,
        default: 0.7,
      },
      {
        key: 'l1_0',
        label: 'P(x₁|Y=0)',
        meaning: 'Likelihood of feature 1 under class 0.',
        min: 0.05,
        max: 0.95,
        step: 0.05,
        default: 0.3,
      },
      {
        key: 'l2_0',
        label: 'P(x₂|Y=0)',
        meaning: 'Likelihood of feature 2 under class 0.',
        min: 0.05,
        max: 0.95,
        step: 0.05,
        default: 0.4,
      },
    ],
    example(v) {
      return `Sample: spam vs ham with two word indicators. Prior P(spam)=${fmt(v.prior1, 2)}; multiply class-conditionals (naive independence).`;
    },
    compute(v) {
      const prior1 = clamp(v.prior1, 0.01, 0.99);
      const prior0 = 1 - prior1;
      const s1 = prior1 * v.l1_1 * v.l2_1;
      const s0 = prior0 * v.l1_0 * v.l2_0;
      const z = s0 + s1;
      const post1 = z > 0 ? s1 / z : 0.5;
      const post0 = 1 - post1;
      return {
        chartType: 'bar',
        yLabel: 'posterior',
        series: [
          {x: 0, y: post0, label: 'P(Y=0|x)'},
          {x: 1, y: post1, label: 'P(Y=1|x)', highlight: post1 >= post0},
        ],
        stats: [
          {label: 'score₀', value: fmt(s0, 3)},
          {label: 'score₁', value: fmt(s1, 3)},
          {label: 'post₁', value: fmt(post1, 2)},
          {label: 'pred', value: post1 >= post0 ? '1' : '0'},
        ],
        note: 'Bars = normalized posteriors after Bayes with independent features.',
      };
    },
  },

  // —— Ensembles (RF / boosting) ——
  ensBagAvg: {
    id: 'ensBagAvg',
    title: 'Bagging: average reduces variance',
    subtitle: 'Independent tree noise σ² — slide B trees and watch Var(mean)=σ²/B drop',
    formula: '$\\hat{y}_{\\mathrm{RF}} = \\dfrac{1}{B}\\sum \\hat{y}_b\\qquad \\mathrm{Var}(\\mathrm{mean})\\approx\\sigma^2/B\\quad\\text{(uncorrelated)}$',
    params: [
      {
        key: 'sigma2',
        label: 'tree variance σ²',
        meaning: 'How noisy one deep tree’s prediction is.',
        min: 0.5,
        max: 8,
        step: 0.25,
        default: 4,
      },
      {
        key: 'B',
        label: 'B trees',
        meaning: 'Number of bagged trees to average.',
        min: 1,
        max: 100,
        step: 1,
        default: 10,
      },
    ],
    example(v) {
      return `Sample: each tree has σ²=${fmt(v.sigma2, 2)}. Averaging B=${v.B} uncorrelated trees → Var≈${fmt(v.sigma2 / v.B, 2)}.`;
    },
    compute(v) {
      const s2 = clamp(v.sigma2, 0.1, 20);
      const Bstar = Math.max(1, Math.round(v.B));
      const series = [];
      for (let i = 1; i <= 100; i++) {
        series.push({x: i, y: s2 / i});
      }
      const vMean = s2 / Bstar;
      return {
        chartType: 'line',
        yLabel: 'Var(average)',
        series,
        refLineX: Bstar,
        stats: [
          {label: 'σ²', value: fmt(s2, 2)},
          {label: 'B', value: String(Bstar)},
          {label: 'σ²/B', value: fmt(vMean, 2)},
        ],
        note: 'Blue = variance of the average vs forest size. Correlation between trees shrinks the gain — RF also randomizes features.',
      };
    },
  },

  ensMtry: {
    id: 'ensMtry',
    title: 'RF feature subsample (mtry)',
    subtitle: 'At each split, try m of p features — slide mtry and see how often the top feature is eligible',
    formula: '$P(\\text{top feature tried}) = m/p$',
    params: [
      {
        key: 'p',
        label: 'p features',
        meaning: 'Total features available.',
        min: 4,
        max: 40,
        step: 1,
        default: 16,
      },
      {
        key: 'm',
        label: 'mtry',
        meaning: 'Features randomly considered at a split (classic default ≈ √p for classification).',
        min: 1,
        max: 20,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      const p = Math.max(1, Math.round(v.p));
      const m = clamp(Math.round(v.m), 1, p);
      return `Sample: p=${p}, mtry=${m}. Chance the single best feature is in the candidate set ≈ ${fmt(m / p, 2)}.`;
    },
    compute(v) {
      const p = Math.max(1, Math.round(v.p));
      const mStar = clamp(Math.round(v.m), 1, p);
      const series = [];
      for (let m = 1; m <= p; m++) {
        series.push({x: m, y: m / p});
      }
      const sqrtDefault = Math.max(1, Math.floor(Math.sqrt(p)));
      return {
        chartType: 'line',
        yLabel: 'P(include top feat)',
        series,
        refLineX: mStar,
        stats: [
          {label: 'p', value: String(p)},
          {label: 'mtry', value: String(mStar)},
          {label: 'P(top)', value: fmt(mStar / p, 2)},
          {label: '√p default', value: String(sqrtDefault)},
        ],
        note: 'Smaller mtry → more diverse trees (less correlation). Larger mtry → each tree looks more like greedily using the same strong features.',
      };
    },
  },

  ensBoostWeights: {
    id: 'ensBoostWeights',
    title: 'AdaBoost reweighting',
    subtitle: 'Slide α — misclassified points get weight × e^α, then renormalize',
    formula: '$w_i \\leftarrow w_i\\cdot e^{\\alpha\\cdot\\mathbf{1}[\\mathrm{wrong}_i]}\\quad\\text{then normalize }\\sum w=1$',
    params: [
      {
        key: 'alpha',
        label: 'α stump weight',
        meaning: 'How strongly this weak learner boosts errors (larger α → harder focus on mistakes).',
        min: 0,
        max: 2,
        step: 0.05,
        default: 0.7,
      },
      {
        key: 'errRate',
        label: 'error fraction',
        meaning: 'Share of points the current stump got wrong (toy: first ⌊n·err⌋ indices).',
        min: 0.1,
        max: 0.5,
        step: 0.05,
        default: 0.25,
      },
    ],
    example(v) {
      return `Sample: n=8 equal weights. After a stump with α=${fmt(v.alpha, 2)}, wrong points swell — next stump focuses there.`;
    },
    compute(v) {
      const n = 8;
      const alpha = clamp(v.alpha, 0, 3);
      const nWrong = Math.max(1, Math.min(n - 1, Math.round(n * clamp(v.errRate, 0.05, 0.5))));
      let w = Array.from({length: n}, () => 1 / n);
      w = w.map((wi, i) => wi * Math.exp(alpha * (i < nWrong ? 1 : 0)));
      const s = w.reduce((a, b) => a + b, 0);
      w = w.map((wi) => wi / s);
      const series = w.map((wi, i) => ({
        x: i,
        y: wi,
        label: i < nWrong ? `err ${i}` : `ok ${i}`,
        highlight: i < nWrong,
      }));
      return {
        chartType: 'bar',
        yLabel: 'weight',
        series,
        stats: [
          {label: 'α', value: fmt(alpha, 2)},
          {label: '# wrong', value: String(nWrong)},
          {label: 'w_wrong', value: fmt(w[0], 3)},
          {label: 'w_ok', value: fmt(w[nWrong], 3)},
        ],
        note: 'Highlighted bars = misclassified. AdaBoost raises their weight so the next weak learner prioritizes them.',
      };
    },
  },

  ensBoostResidual: {
    id: 'ensBoostResidual',
    title: 'Gradient boosting residual step',
    subtitle: 'Fit a stump to residuals y−F, then F ← F + ν·h — slide ν and steps',
    formula: '$r = y - F\\qquad F \\leftarrow F + \\nu h(x)\\quad\\text{(}h\\text{ fits }r\\text{)}$',
    params: [
      {
        key: 'nu',
        label: 'ν shrinkage',
        meaning: 'Learning rate for each added tree (small ν → slower, often better).',
        min: 0.05,
        max: 1,
        step: 0.05,
        default: 0.3,
      },
      {
        key: 'steps',
        label: 'boosting rounds',
        meaning: 'How many residual-fitting updates to run.',
        min: 0,
        max: 12,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      return `Sample: target y=3 at one point, start F=0. Each round a perfect residual fit moves F toward y by factor ν=${fmt(v.nu, 2)}.`;
    },
    compute(v) {
      const y = 3;
      const nu = clamp(v.nu, 0.01, 1);
      const T = Math.max(0, Math.round(v.steps));
      const series = [];
      let F = 0;
      series.push({x: 0, y: F});
      for (let t = 1; t <= 12; t++) {
        const r = y - F;
        F = F + nu * r; // perfect weak learner on residual
        series.push({x: t, y: F});
      }
      let Fstar = 0;
      for (let t = 1; t <= T; t++) {
        Fstar = Fstar + nu * (y - Fstar);
      }
      return {
        chartType: 'line',
        yLabel: 'F(x)',
        series,
        refLineX: T,
        stats: [
          {label: 'y', value: String(y)},
          {label: 'ν', value: fmt(nu, 2)},
          {label: `F_${T}`, value: fmt(Fstar, 2)},
          {label: 'residual', value: fmt(y - Fstar, 2)},
        ],
        note: 'Green target is y=3. Blue path = additive model after residual updates. XGBoost / GBM do this in function space via gradients.',
      };
    },
  },

  // —— Dimensionality reduction / PCA ——
  pcaScree: {
    id: 'pcaScree',
    title: 'PCA scree / cumulative variance',
    subtitle: 'Slide k — how much total variance the top-k components keep',
    formula: '$\\mathrm{explained}(k) = \\dfrac{\\lambda_1+\\cdots+\\lambda_k}{\\lambda_1+\\cdots+\\lambda_p}$',
    params: [
      {
        key: 'k',
        label: 'k components',
        meaning: 'How many leading PCs to keep.',
        min: 1,
        max: 6,
        step: 1,
        default: 2,
      },
      {
        key: 'decay',
        label: 'spectrum decay',
        meaning: 'Faster decay → more variance in the first few PCs (easier compression).',
        min: 0.4,
        max: 0.95,
        step: 0.05,
        default: 0.7,
      },
    ],
    example(v) {
      return `Sample: choose k so cumulative variance ≥ 90%. Decay=${fmt(v.decay, 2)} controls how peaked the eigenvalue spectrum is.`;
    },
    compute(v) {
      const p = 6;
      const decay = clamp(v.decay, 0.2, 0.99);
      const evals = [];
      let e = 1;
      for (let i = 0; i < p; i++) {
        evals.push(e);
        e *= decay;
      }
      const total = evals.reduce((a, b) => a + b, 0);
      const kStar = clamp(Math.round(v.k), 1, p);
      const series = [];
      let run = 0;
      for (let k = 1; k <= p; k++) {
        run += evals[k - 1];
        series.push({x: k, y: run / total});
      }
      const kept = evals.slice(0, kStar).reduce((a, b) => a + b, 0) / total;
      return {
        chartType: 'line',
        yLabel: 'cumulative variance',
        series,
        refLineX: kStar,
        stats: [
          {label: 'k', value: String(kStar)},
          {label: 'kept', value: fmt(kept, 2)},
          {label: 'λ₁ share', value: fmt(evals[0] / total, 2)},
        ],
        note: 'Blue = cumulative explained variance vs k. Pick the smallest k meeting your variance budget (interview default story).',
      };
    },
  },

  pcaProject1d: {
    id: 'pcaProject1d',
    title: 'PCA projection onto PC1',
    subtitle: '2-D point → score on the first principal axis — slide the point and the PC angle',
    formula: '$\\mathrm{score} = x\\cdot w_1\\quad(\\lVert w_1\\rVert=1)$',
    params: [
      {
        key: 'theta',
        label: 'PC1 angle (°)',
        meaning: 'Direction of the first principal axis in the plane.',
        min: 0,
        max: 180,
        step: 5,
        default: 45,
      },
      {
        key: 'x',
        label: 'x₁',
        meaning: 'First coordinate of the data point (centered).',
        min: -3,
        max: 3,
        step: 0.25,
        default: 2,
      },
      {
        key: 'y',
        label: 'x₂',
        meaning: 'Second coordinate of the data point (centered).',
        min: -3,
        max: 3,
        step: 0.25,
        default: 1,
      },
    ],
    example(v) {
      const rad = (v.theta * Math.PI) / 180;
      const w1 = Math.cos(rad);
      const w2 = Math.sin(rad);
      const score = v.x * w1 + v.y * w2;
      return `Sample: w₁=(${fmt(w1, 2)}, ${fmt(w2, 2)}). Point (${fmt(v.x, 1)}, ${fmt(v.y, 1)}) → score ${fmt(score, 2)}.`;
    },
    compute(v) {
      const rad = (v.theta * Math.PI) / 180;
      const w1 = Math.cos(rad);
      const w2 = Math.sin(rad);
      const series = [];
      for (let i = 0; i <= 60; i++) {
        const t = -3 + (6 * i) / 60;
        // plot reconstruction along PC1 in x1 vs projected coordinate? Show score vs x1 for fixed x2
        series.push({x: t, y: t * w1 + v.y * w2});
      }
      const score = v.x * w1 + v.y * w2;
      return {
        chartType: 'line',
        yLabel: 'score (vary x₁)',
        series,
        refLineX: v.x,
        stats: [
          {label: 'w₁', value: `(${fmt(w1, 2)}, ${fmt(w2, 2)})`},
          {label: 'score', value: fmt(score, 2)},
          {label: '‖w‖', value: '1'},
        ],
        note: 'Orange = your x₁. Blue = score as x₁ varies (x₂ fixed). PCA picks w maximizing Var(x·w) subject to ‖w‖=1, then next orthogonal direction.',
      };
    },
  },

  // —— Clustering ——
  clustKmeans1d: {
    id: 'clustKmeans1d',
    title: 'k-means assign (1-D)',
    subtitle: 'Two centroids on a line — slide them and a query point; watch which cluster wins',
    formula: '$\\text{assign }x\\to\\arg\\min_j \\lVert x-\\mu_j\\rVert^2$',
    params: [
      {
        key: 'mu0',
        label: 'μ₀',
        meaning: 'Centroid of cluster 0.',
        min: -2,
        max: 8,
        step: 0.25,
        default: 1,
      },
      {
        key: 'mu1',
        label: 'μ₁',
        meaning: 'Centroid of cluster 1.',
        min: -2,
        max: 12,
        step: 0.25,
        default: 9,
      },
      {
        key: 'x',
        label: 'point x',
        meaning: 'Query observation to assign.',
        min: -2,
        max: 12,
        step: 0.25,
        default: 4,
      },
    ],
    example(v) {
      const d0 = (v.x - v.mu0) ** 2;
      const d1 = (v.x - v.mu1) ** 2;
      return `Sample: customer spend x=${fmt(v.x, 1)}. Closer to μ₀=${fmt(v.mu0, 1)} or μ₁=${fmt(v.mu1, 1)}? Dist² → ${fmt(d0, 2)} vs ${fmt(d1, 2)}.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = -2 + (14 * i) / 80;
        const d0 = (x - v.mu0) ** 2;
        const d1 = (x - v.mu1) ** 2;
        series.push({x, y: Math.min(d0, d1)});
      }
      const d0 = (v.x - v.mu0) ** 2;
      const d1 = (v.x - v.mu1) ** 2;
      const lab = d0 <= d1 ? 0 : 1;
      const boundary = (v.mu0 + v.mu1) / 2;
      return {
        chartType: 'line',
        yLabel: 'min dist² to centroid',
        series,
        refLineX: v.x,
        stats: [
          {label: 'd²→μ₀', value: fmt(d0, 2)},
          {label: 'd²→μ₁', value: fmt(d1, 2)},
          {label: 'assign', value: String(lab)},
          {label: 'midpoint', value: fmt(boundary, 2)},
        ],
        note: 'Blue = distance to nearest centroid. Orange = your x. Voronoi boundary sits at the midpoint of μ₀ and μ₁ (equal variance spheres).',
      };
    },
  },

  clustKmeansSse: {
    id: 'clustKmeansSse',
    title: 'k-means distortion (SSE)',
    subtitle: 'Fixed 1-D points in two clumps — slide μ₀, μ₁ and watch within-cluster sum of squares',
    formula: '$L = \\sum_j \\sum_{x\\in S_j} \\lVert x-\\mu_j\\rVert^2$',
    params: [
      {
        key: 'mu0',
        label: 'μ₀',
        meaning: 'Centroid for the left clump (true mean ≈ 1).',
        min: -1,
        max: 5,
        step: 0.25,
        default: 0,
      },
      {
        key: 'mu1',
        label: 'μ₁',
        meaning: 'Centroid for the right clump (true mean ≈ 9).',
        min: 5,
        max: 12,
        step: 0.25,
        default: 7,
      },
    ],
    example() {
      return 'Sample: points {0,1,2} and {8,9,10}. Optimal centroids near 1 and 9 — SSE bottoms there.';
    },
    compute(v) {
      const left = [0, 1, 2];
      const right = [8, 9, 10];
      const sseAt = (mu0, mu1) => {
        let s = 0;
        for (const x of left) s += (x - mu0) ** 2;
        for (const x of right) s += (x - mu1) ** 2;
        return s;
      };
      const series = [];
      for (let i = 0; i <= 60; i++) {
        const mu0 = -1 + (6 * i) / 60;
        // fix mu1 at current for a 1-D slice? Better: plot SSE vs mu0 with mu1 fixed at v.mu1
        series.push({x: mu0, y: sseAt(mu0, v.mu1)});
      }
      const L = sseAt(v.mu0, v.mu1);
      const Lstar = sseAt(1, 9);
      return {
        chartType: 'line',
        yLabel: 'SSE (μ₁ fixed)',
        series,
        refLineX: v.mu0,
        stats: [
          {label: 'μ₀', value: fmt(v.mu0, 2)},
          {label: 'μ₁', value: fmt(v.mu1, 2)},
          {label: 'SSE', value: fmt(L, 2)},
          {label: 'SSE@opt', value: fmt(Lstar, 2)},
        ],
        note: 'Blue = SSE vs μ₀ with your μ₁ held fixed. k-means alternates assignment + centroid update until L stops dropping.',
      };
    },
  },

  clustElbow: {
    id: 'clustElbow',
    title: 'Elbow: SSE vs k',
    subtitle: 'Toy decreasing distortion curve — slide k and spot the diminishing-returns “elbow”',
    formula: '$\\text{choose }k\\text{ near where SSE flattens}$',
    params: [
      {
        key: 'k',
        label: 'k clusters',
        meaning: 'Candidate number of clusters.',
        min: 1,
        max: 8,
        step: 1,
        default: 3,
      },
    ],
    example(v) {
      return `Sample: plot inertia for k=1…8 on customer segments. Your k=${v.k} — look for the bend, not the absolute minimum.`;
    },
    compute(v) {
      // Synthetic elbow: SSE ≈ a/k^p + floor
      const series = [];
      for (let k = 1; k <= 8; k++) {
        const sse = 40 / k ** 1.2 + 2;
        series.push({x: k, y: sse});
      }
      const kStar = clamp(Math.round(v.k), 1, 8);
      const sse = 40 / kStar ** 1.2 + 2;
      return {
        chartType: 'line',
        yLabel: 'SSE / inertia',
        series,
        refLineX: kStar,
        stats: [
          {label: 'k', value: String(kStar)},
          {label: 'SSE≈', value: fmt(sse, 2)},
        ],
        note: 'SSE always falls as k rises — pick the elbow (or use silhouette / domain knowledge). k is a hyperparameter you choose.',
      };
    },
  },

  clustGmm1d: {
    id: 'clustGmm1d',
    title: 'GMM soft assignment (1-D)',
    subtitle: 'Two Gaussians — slide means / σ and a point; watch responsibilities γ',
    formula: '$\\gamma_j(x) \\propto \\pi_j\\,\\mathcal{N}(x\\mid\\mu_j,\\sigma_j^2)$',
    params: [
      {
        key: 'mu0',
        label: 'μ₀',
        meaning: 'Mean of component 0.',
        min: -2,
        max: 6,
        step: 0.25,
        default: 1,
      },
      {
        key: 'mu1',
        label: 'μ₁',
        meaning: 'Mean of component 1.',
        min: 2,
        max: 12,
        step: 0.25,
        default: 8,
      },
      {
        key: 'sig0',
        label: 'σ₀',
        meaning: 'Std. of component 0 (k-means is like equal spherical σ→0 hard assign).',
        min: 0.4,
        max: 3,
        step: 0.1,
        default: 1.2,
      },
      {
        key: 'sig1',
        label: 'σ₁',
        meaning: 'Std. of component 1.',
        min: 0.4,
        max: 3,
        step: 0.1,
        default: 1.5,
      },
      {
        key: 'x',
        label: 'point x',
        meaning: 'Observation to soft-cluster.',
        min: -2,
        max: 12,
        step: 0.25,
        default: 4,
      },
    ],
    example(v) {
      return `Sample: account activity x=${fmt(v.x, 1)} under two user-behavior Gaussians. Soft membership uses mean and variance — not just the closest mean.`;
    },
    compute(v) {
      const gauss = (x, mu, sig) => {
        const s = Math.max(sig, 0.05);
        const z = (x - mu) / s;
        return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * Math.PI));
      };
      const pi0 = 0.5;
      const pi1 = 0.5;
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = -2 + (14 * i) / 80;
        const n0 = pi0 * gauss(x, v.mu0, v.sig0);
        const n1 = pi1 * gauss(x, v.mu1, v.sig1);
        const z = n0 + n1;
        series.push({x, y: z > 0 ? n1 / z : 0.5});
      }
      const n0 = pi0 * gauss(v.x, v.mu0, v.sig0);
      const n1 = pi1 * gauss(v.x, v.mu1, v.sig1);
      const z = n0 + n1;
      const g1 = z > 0 ? n1 / z : 0.5;
      const g0 = 1 - g1;
      return {
        chartType: 'line',
        yLabel: 'P(comp 1 | x)',
        series,
        refLineX: v.x,
        stats: [
          {label: 'γ₀', value: fmt(g0, 2)},
          {label: 'γ₁', value: fmt(g1, 2)},
          {label: 'hard', value: g1 >= g0 ? '1' : '0'},
        ],
        note: 'Blue = responsibility for component 1 vs x. Wider σ pulls soft mass — GMMs model variance; k-means only uses means.',
      };
    },
  },

  // —— Neural networks ——
  nnRelu: {
    id: 'nnRelu',
    title: 'ReLU activation',
    subtitle: 'σ(z)=max(0,z) — slide z; derivative is 0 or 1 (no tiny tanh/sigmoid slopes)',
    formula: '$\\mathrm{ReLU}(z) = \\max(0,z)$',
    params: [
      {
        key: 'z',
        label: 'pre-activation z',
        meaning: 'Weighted sum into the neuron.',
        min: -4,
        max: 4,
        step: 0.1,
        default: -1,
      },
    ],
    example(v) {
      return `Sample: hidden unit with z=${fmt(v.z, 1)} → output ${fmt(Math.max(0, v.z), 2)}. Dead ReLU when z stays negative.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const z = -4 + (8 * i) / 80;
        series.push({x: z, y: Math.max(0, z)});
      }
      const y = Math.max(0, v.z);
      const dy = v.z > 0 ? 1 : 0;
      return {
        chartType: 'line',
        yLabel: 'ReLU(z)',
        series,
        refLineX: v.z,
        stats: [
          {label: 'z', value: fmt(v.z, 2)},
          {label: 'ReLU', value: fmt(y, 2)},
          {label: "ReLU'", value: String(dy)},
        ],
        note: 'Orange = your z. Flat left side → gradient 0 (can “die”). Positive side passes gradient = 1 — helps with vanishing gradients vs sigmoid/tanh.',
      };
    },
  },

  nnTanh: {
    id: 'nnTanh',
    title: 'tanh activation & slope',
    subtitle: 'Slide z — output in (−1,1); derivative 1−tanh²(z) shrinks in the tails',
    formula: '$\\tanh(z)\\qquad \\tanh\'(z)=1-\\tanh^2(z)$',
    params: [
      {
        key: 'z',
        label: 'z',
        meaning: 'Pre-activation.',
        min: -3,
        max: 3,
        step: 0.1,
        default: 1.5,
      },
    ],
    example(v) {
      const t = Math.tanh(v.z);
      return `Sample: |z| large → tanh saturates (~${fmt(t, 2)}) and tanh′≈${fmt(1 - t * t, 3)} — chain-rule products get tiny.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const z = -3 + (6 * i) / 80;
        series.push({x: z, y: Math.tanh(z)});
      }
      const t = Math.tanh(v.z);
      return {
        chartType: 'line',
        yLabel: 'tanh(z)',
        series,
        refLineX: v.z,
        stats: [
          {label: 'tanh', value: fmt(t, 2)},
          {label: "tanh′", value: fmt(1 - t * t, 3)},
        ],
        note: 'Saturated tails → small local gradients → vanishing-gradient risk in deep stacks.',
      };
    },
  },

  nnPerceptron: {
    id: 'nnPerceptron',
    title: 'Perceptron / neuron',
    subtitle: 'z = w·x + b then nonlinear σ — slide weights and activation type',
    formula: '$z = wx + b\\qquad \\hat{y} = \\sigma(z)$',
    params: [
      {
        key: 'w',
        label: 'weight w',
        meaning: 'Feature weight (1-D toy neuron).',
        min: -2,
        max: 3,
        step: 0.1,
        default: 1.2,
      },
      {
        key: 'b',
        label: 'bias b',
        meaning: 'Offset before the activation.',
        min: -2,
        max: 2,
        step: 0.1,
        default: -0.5,
      },
      {
        key: 'act',
        label: 'activation',
        meaning: '0=linear, 1=sigmoid, 2=ReLU, 3=tanh.',
        min: 0,
        max: 3,
        step: 1,
        default: 1,
      },
    ],
    example(v) {
      const names = ['linear', 'sigmoid', 'ReLU', 'tanh'];
      return `Sample: one feature x. Activation=${names[Math.round(v.act)] || 'linear'} turns the linear score into a nonlinear map (except pure linear).`;
    },
    compute(v) {
      const act = Math.round(clamp(v.act, 0, 3));
      const sigma = (z) => {
        if (act === 0) return z;
        if (act === 1) return 1 / (1 + Math.exp(-clamp(z, -20, 20)));
        if (act === 2) return Math.max(0, z);
        return Math.tanh(z);
      };
      const series = [];
      for (let i = 0; i <= 80; i++) {
        const x = -3 + (6 * i) / 80;
        series.push({x, y: sigma(v.w * x + v.b)});
      }
      const x0 = 1;
      const z0 = v.w * x0 + v.b;
      const names = ['linear', 'sigmoid', 'ReLU', 'tanh'];
      return {
        chartType: 'line',
        yLabel: 'σ(wx+b)',
        series,
        refLineX: x0,
        stats: [
          {label: 'σ', value: names[act]},
          {label: 'z@x=1', value: fmt(z0, 2)},
          {label: 'ŷ@x=1', value: fmt(sigma(z0), 2)},
        ],
        note: 'Orange = x=1. Nonlinear σ is why MLPs approximate nonlinear functions — stacks of linear layers alone collapse to one linear map.',
      };
    },
  },

  nnBackprop1d: {
    id: 'nnBackprop1d',
    title: 'Backprop on ŷ=wx (MSE)',
    subtitle: 'L=½(wx−y)² — slide w, x, y, α; watch ∂L/∂w and one SGD step',
    formula: '$\\dfrac{\\partial L}{\\partial w} = (wx-y)\\cdot x\\qquad w \\leftarrow w - \\alpha\\dfrac{\\partial L}{\\partial w}$',
    params: [
      {
        key: 'w',
        label: 'weight w',
        meaning: 'Current parameter.',
        min: -1,
        max: 2,
        step: 0.05,
        default: 0.5,
      },
      {
        key: 'x',
        label: 'input x',
        meaning: 'Feature (scalar).',
        min: 0.5,
        max: 3,
        step: 0.25,
        default: 2,
      },
      {
        key: 'y',
        label: 'target y',
        meaning: 'Desired output.',
        min: -1,
        max: 3,
        step: 0.25,
        default: 0,
      },
      {
        key: 'alpha',
        label: 'α learning rate',
        meaning: 'SGD step size.',
        min: 0.01,
        max: 0.5,
        step: 0.01,
        default: 0.1,
      },
    ],
    example(v) {
      const z = v.w * v.x;
      const g = (z - v.y) * v.x;
      return `Sample: whiteboard backprop for linear regression. Residual=${fmt(z - v.y, 2)} → ∂L/∂w=${fmt(g, 2)}.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 60; i++) {
        const w = -1 + (3 * i) / 60;
        const z = w * v.x;
        series.push({x: w, y: 0.5 * (z - v.y) ** 2});
      }
      const z = v.w * v.x;
      const g = (z - v.y) * v.x;
      const wNew = v.w - v.alpha * g;
      return {
        chartType: 'line',
        yLabel: 'L(w)',
        series,
        refLineX: v.w,
        stats: [
          {label: 'z=wx', value: fmt(z, 2)},
          {label: '∂L/∂w', value: fmt(g, 2)},
          {label: 'w′', value: fmt(wNew, 2)},
        ],
        note: 'Blue = loss bowl over w. Orange = current w. Same chain-rule idea scales to deeper nets (multiply local Jacobians).',
      };
    },
  },

  nnVanish: {
    id: 'nnVanish',
    title: 'Vanishing gradients (product)',
    subtitle: 'Backprop multiplies layer slopes — slide depth and typical |∂σ/∂z|',
    formula: '$\\lVert\\nabla_{\\mathrm{early}}\\rVert \\sim (\\mathrm{slope})^{\\mathrm{depth}}$',
    params: [
      {
        key: 'slope',
        label: 'typical |slope|',
        meaning: 'Local activation derivative per layer (tanh/sigmoid ≪ 1 in tails).',
        min: 0.2,
        max: 1.2,
        step: 0.05,
        default: 0.5,
      },
      {
        key: 'depth',
        label: 'depth L',
        meaning: 'How many factors in the chain rule.',
        min: 1,
        max: 20,
        step: 1,
        default: 8,
      },
    ],
    example(v) {
      return `Sample: if each layer contributes factor ${fmt(v.slope, 2)}, after L=${v.depth} layers the product is tiny — early weights barely move.`;
    },
    compute(v) {
      const s = clamp(v.slope, 0.05, 2);
      const Lstar = Math.max(1, Math.round(v.depth));
      const series = [];
      for (let L = 1; L <= 20; L++) {
        series.push({x: L, y: s ** L});
      }
      const prod = s ** Lstar;
      return {
        chartType: 'line',
        yLabel: 'product of slopes',
        series,
        refLineX: Lstar,
        stats: [
          {label: 'slope', value: fmt(s, 2)},
          {label: 'L', value: String(Lstar)},
          {label: 'product', value: fmt(prod, 4)},
        ],
        note: 'ReLU (slope 0/1), residuals / LSTMs (skip paths), and careful init fight this exponential decay — and the opposite “exploding” case when slopes > 1.',
      };
    },
  },

  nnDropout: {
    id: 'nnDropout',
    title: 'Dropout keep probability',
    subtitle: 'Each unit kept with p — slide p and width; expected active units = p·n',
    formula: '$\\text{train: drop units w.p. }1-p\\qquad \\text{expected active}\\approx p\\,n$',
    params: [
      {
        key: 'p',
        label: 'keep prob p',
        meaning: 'Probability a neuron stays active this step (common p≈0.5–0.8).',
        min: 0.2,
        max: 1,
        step: 0.05,
        default: 0.5,
      },
      {
        key: 'n',
        label: 'layer width n',
        meaning: 'Neurons in the layer.',
        min: 4,
        max: 64,
        step: 2,
        default: 32,
      },
    ],
    example(v) {
      return `Sample: n=${Math.round(v.n)} hidden units, keep p=${fmt(v.p, 2)} → on average ${fmt(v.p * v.n, 1)} units fire — like sampling many thinner nets.`;
    },
    compute(v) {
      const n = Math.max(1, Math.round(v.n));
      const p = clamp(v.p, 0.05, 1);
      const series = [];
      for (let i = 0; i <= 40; i++) {
        const pp = 0.2 + (0.8 * i) / 40;
        series.push({x: pp, y: pp * n});
      }
      return {
        chartType: 'line',
        yLabel: 'E[# active]',
        series,
        refLineX: p,
        stats: [
          {label: 'p', value: fmt(p, 2)},
          {label: 'n', value: String(n)},
          {label: 'E[active]', value: fmt(p * n, 1)},
        ],
        note: 'Dropout ≈ noise + ensemble of subnetworks. At test time usually scale weights by p (or use inverted dropout).',
      };
    },
  },

  nnMomentum: {
    id: 'nnMomentum',
    title: 'SGD with momentum',
    subtitle: 'v ← βv + g; w ← w − αv — slide β and a constant gradient g',
    formula: '$v \\leftarrow \\beta v + g\\qquad w \\leftarrow w - \\alpha v$',
    params: [
      {
        key: 'beta',
        label: 'β momentum',
        meaning: 'How much past velocity to keep (typical ~0.9).',
        min: 0,
        max: 0.99,
        step: 0.01,
        default: 0.9,
      },
      {
        key: 'g',
        label: 'gradient g',
        meaning: 'Toy constant ∂L/∂w each step.',
        min: -2,
        max: 2,
        step: 0.1,
        default: 1,
      },
      {
        key: 'alpha',
        label: 'α',
        meaning: 'Learning rate.',
        min: 0.05,
        max: 0.5,
        step: 0.05,
        default: 0.1,
      },
      {
        key: 'steps',
        label: 'steps',
        meaning: 'How many momentum updates from v=0, w=0.',
        min: 1,
        max: 20,
        step: 1,
        default: 8,
      },
    ],
    example(v) {
      return `Sample: noisy SGD gets a consistent push when gradients align — velocity builds with β=${fmt(v.beta, 2)}.`;
    },
    compute(v) {
      const beta = clamp(v.beta, 0, 0.99);
      const T = Math.max(1, Math.round(v.steps));
      const series = [];
      let vel = 0;
      let w = 0;
      series.push({x: 0, y: w});
      for (let t = 1; t <= 20; t++) {
        vel = beta * vel + v.g;
        w = w - v.alpha * vel;
        series.push({x: t, y: w});
      }
      let velS = 0;
      let wS = 0;
      for (let t = 1; t <= T; t++) {
        velS = beta * velS + v.g;
        wS = wS - v.alpha * velS;
      }
      return {
        chartType: 'line',
        yLabel: 'w(t)',
        series,
        refLineX: T,
        stats: [
          {label: 'v_T', value: fmt(velS, 2)},
          {label: 'w_T', value: fmt(wS, 2)},
          {label: 'β', value: fmt(beta, 2)},
        ],
        note: 'Blue = weight trajectory under constant g. Momentum accumulates velocity so steps grow when gradients agree — helps escape noisy flat regions.',
      };
    },
  },

  // —— Reinforcement learning ——
  rlDiscountReturn: {
    id: 'rlDiscountReturn',
    title: 'Discounted return',
    subtitle: 'Slide γ — later rewards shrink; G_t = r_t + γ r_{t+1} + γ² r_{t+2} + …',
    formula: '$G = \\sum_{k=0}^{T-1} \\gamma^k r_{t+k}$',
    params: [
      {
        key: 'gamma',
        label: 'γ discount',
        meaning: 'How much future reward counts. γ=0 → myopic; γ→1 → long-horizon.',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.9,
      },
      {
        key: 'r0',
        label: 'r₀ (now)',
        meaning: 'Immediate reward.',
        min: -2,
        max: 5,
        step: 0.5,
        default: 1,
      },
      {
        key: 'r1',
        label: 'r₁',
        meaning: 'Reward one step later.',
        min: -2,
        max: 5,
        step: 0.5,
        default: 1,
      },
      {
        key: 'r2',
        label: 'r₂',
        meaning: 'Reward two steps later.',
        min: -2,
        max: 5,
        step: 0.5,
        default: 1,
      },
    ],
    example(v) {
      const G = v.r0 + v.gamma * v.r1 + v.gamma * v.gamma * v.r2;
      return `Sample: episode rewards [${fmt(v.r0, 1)}, ${fmt(v.r1, 1)}, ${fmt(v.r2, 1)}] with γ=${fmt(v.gamma, 2)} → G≈${fmt(G, 2)}.`;
    },
    compute(v) {
      const g = clamp(v.gamma, 0, 1);
      const series = [];
      for (let i = 0; i <= 40; i++) {
        const gg = i / 40;
        series.push({x: gg, y: v.r0 + gg * v.r1 + gg * gg * v.r2});
      }
      const G = v.r0 + g * v.r1 + g * g * v.r2;
      return {
        chartType: 'line',
        yLabel: 'return G',
        series,
        refLineX: g,
        stats: [
          {label: 'γ', value: fmt(g, 2)},
          {label: 'G', value: fmt(G, 2)},
          {label: 'γ² r₂', value: fmt(g * g * v.r2, 2)},
        ],
        note: 'Blue = return vs γ for fixed rewards. Low γ ignores the future; high γ cares about long-term value.',
      };
    },
  },

  rlBellman: {
    id: 'rlBellman',
    title: 'One-step Bellman backup',
    subtitle: 'V ← r + γ V′ — slide reward, discount, and next-state value',
    formula: '$V(s) \\approx r + \\gamma V(s\')$',
    params: [
      {
        key: 'r',
        label: 'reward r',
        meaning: 'Immediate payoff for the transition.',
        min: -5,
        max: 10,
        step: 0.5,
        default: 1,
      },
      {
        key: 'gamma',
        label: 'γ',
        meaning: 'Discount factor.',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.9,
      },
      {
        key: 'vp',
        label: "V(s′)",
        meaning: 'Estimated value of the next state.',
        min: 0,
        max: 20,
        step: 0.5,
        default: 10,
      },
    ],
    example(v) {
      return `Sample: after taking an action you get r=${fmt(v.r, 1)} and land in a state worth ${fmt(v.vp, 1)}. Backup = r+γV′.`;
    },
    compute(v) {
      const g = clamp(v.gamma, 0, 1);
      const series = [];
      for (let i = 0; i <= 40; i++) {
        const vp = (20 * i) / 40;
        series.push({x: vp, y: v.r + g * vp});
      }
      const backup = v.r + g * v.vp;
      return {
        chartType: 'line',
        yLabel: 'backup',
        series,
        refLineX: v.vp,
        stats: [
          {label: 'r', value: fmt(v.r, 2)},
          {label: 'γ', value: fmt(g, 2)},
          {label: 'backup', value: fmt(backup, 2)},
        ],
        note: 'Orange = your V(s′). Value functions re-estimate long-term expected return; policies map states → actions.',
      };
    },
  },

  rlQLearning: {
    id: 'rlQLearning',
    title: 'Q-learning update',
    subtitle: 'Q ← Q + α [r + γ max Q(s′,·) − Q] — slide α, r, γ, maxQ′',
    formula: '$Q \\leftarrow Q + \\alpha\\bigl(r + \\gamma\\max_{a\'} Q(s\',a\') - Q\\bigr)$',
    params: [
      {
        key: 'Q',
        label: 'current Q',
        meaning: 'Q(s,a) before the update.',
        min: -2,
        max: 5,
        step: 0.25,
        default: 0,
      },
      {
        key: 'alpha',
        label: 'α step size',
        meaning: 'Learning rate for the TD update.',
        min: 0.05,
        max: 1,
        step: 0.05,
        default: 0.1,
      },
      {
        key: 'r',
        label: 'r',
        meaning: 'Observed reward.',
        min: -2,
        max: 5,
        step: 0.5,
        default: 1,
      },
      {
        key: 'gamma',
        label: 'γ',
        meaning: 'Discount.',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.9,
      },
      {
        key: 'maxQp',
        label: 'max Q(s′,·)',
        meaning: 'Best action-value in the next state (bootstrap target).',
        min: 0,
        max: 10,
        step: 0.5,
        default: 0,
      },
    ],
    example(v) {
      const target = v.r + v.gamma * v.maxQp;
      const Qn = v.Q + v.alpha * (target - v.Q);
      return `Sample: TD target=${fmt(target, 2)}; new Q≈${fmt(Qn, 2)}.`;
    },
    compute(v) {
      const series = [];
      for (let i = 0; i <= 40; i++) {
        const a = 0.05 + (0.95 * i) / 40;
        const target = v.r + v.gamma * v.maxQp;
        series.push({x: a, y: v.Q + a * (target - v.Q)});
      }
      const target = v.r + v.gamma * v.maxQp;
      const Qn = v.Q + v.alpha * (target - v.Q);
      return {
        chartType: 'line',
        yLabel: 'Q after update',
        series,
        refLineX: v.alpha,
        stats: [
          {label: 'TD target', value: fmt(target, 2)},
          {label: 'δ', value: fmt(target - v.Q, 2)},
          {label: 'Q′', value: fmt(Qn, 2)},
        ],
        note: 'Blue = updated Q vs α. Larger α moves faster toward the TD target (can be noisy).',
      };
    },
  },

  rlEpsilonGreedy: {
    id: 'rlEpsilonGreedy',
    title: 'ε-greedy exploration',
    subtitle: 'With prob 1−ε pick greedy action; else explore — slide ε',
    formula: '$P(\\mathrm{greedy}) = 1-\\varepsilon\\qquad P(\\mathrm{explore}) = \\varepsilon$',
    params: [
      {
        key: 'eps',
        label: 'ε',
        meaning: 'Exploration rate. ε=0 → always exploit; ε=1 → always random.',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.2,
      },
      {
        key: 'nActions',
        label: '# actions',
        meaning: 'Discrete action set size (uniform explore).',
        min: 2,
        max: 10,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      return `Sample: ε=${fmt(v.eps, 2)} → exploit ${(100 * (1 - v.eps)).toFixed(0)}% of the time; otherwise pick uniformly among ${Math.round(v.nActions)} actions.`;
    },
    compute(v) {
      const eps = clamp(v.eps, 0, 1);
      const n = Math.max(2, Math.round(v.nActions));
      const series = [];
      for (let i = 0; i <= 40; i++) {
        const e = i / 40;
        series.push({x: e, y: 1 - e});
      }
      return {
        chartType: 'line',
        yLabel: 'P(greedy)',
        series,
        refLineX: eps,
        stats: [
          {label: 'ε', value: fmt(eps, 2)},
          {label: 'P(greedy)', value: fmt(1 - eps, 2)},
          {label: 'P(each rand)', value: fmt(eps / n, 3)},
        ],
        note: 'RL needs exploration because “good” actions are not labeled — you discover them via reward feedback.',
      };
    },
  },

  // —— End-to-end workflow helpers ——
  wfPrecisionRecallTrade: {
    id: 'wfPrecisionRecallTrade',
    title: 'Metric trade-off (satisficing)',
    subtitle: 'Slide operating point — precision vs recall; imagine optimizing precision @ recall ≥ floor',
    formula: '$\\text{optimize precision subject to recall }\\ge\\rho$',
    params: [
      {
        key: 'recallFloor',
        label: 'recall floor ρ',
        meaning: 'Satisficing constraint (e.g. catch ≥95% of spam).',
        min: 0.5,
        max: 0.99,
        step: 0.01,
        default: 0.9,
      },
      {
        key: 'op',
        label: 'operating recall',
        meaning: 'Your chosen recall on a toy PR curve.',
        min: 0.4,
        max: 1,
        step: 0.02,
        default: 0.92,
      },
    ],
    example(v) {
      return `Sample: require recall≥${fmt(v.recallFloor, 2)}; pick an operating point and read precision. Interview tip: name one primary metric, then hedge with constraints.`;
    },
    compute(v) {
      // Toy: precision ≈ 1 - 0.7*(recall)^1.5
      const series = [];
      for (let i = 0; i <= 50; i++) {
        const rec = 0.4 + (0.6 * i) / 50;
        const prec = Math.max(0.05, 1 - 0.75 * rec ** 1.4);
        series.push({x: rec, y: prec});
      }
      const rec = clamp(v.op, 0.4, 1);
      const prec = Math.max(0.05, 1 - 0.75 * rec ** 1.4);
      const ok = rec + 1e-9 >= v.recallFloor;
      return {
        chartType: 'line',
        yLabel: 'precision',
        series,
        refLineX: rec,
        stats: [
          {label: 'recall', value: fmt(rec, 2)},
          {label: 'precision', value: fmt(prec, 2)},
          {label: 'meets ρ?', value: ok ? 'yes' : 'no'},
        ],
        note: 'Blue = toy PR curve. Align model metrics to business KPIs (e.g. ticket routing → time-to-resolution).',
      };
    },
  },

  wfTrainServingSkew: {
    id: 'wfTrainServingSkew',
    title: 'Training–serving skew',
    subtitle: 'Slide feature drift — train accuracy stays high while served accuracy drops',
    formula: '$\\text{monitor live metrics; retrain on schedule / triggers}$',
    params: [
      {
        key: 'drift',
        label: 'feature drift',
        meaning: '0 = same as train; 1 = strong distribution shift (season change, etc.).',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.4,
      },
    ],
    example(v) {
      return `Sample: winter-trained fashion recommender in summer — drift=${fmt(v.drift, 2)} tanks serving quality even if offline metrics looked fine.`;
    },
    compute(v) {
      const d = clamp(v.drift, 0, 1);
      const series = [];
      for (let i = 0; i <= 40; i++) {
        const x = i / 40;
        series.push({x, y: 0.92 - 0.55 * x});
      }
      const train = 0.92;
      const serve = 0.92 - 0.55 * d;
      return {
        chartType: 'line',
        yLabel: 'served accuracy (toy)',
        series,
        refLineX: d,
        stats: [
          {label: 'train acc', value: fmt(train, 2)},
          {label: 'serve acc', value: fmt(serve, 2)},
          {label: 'gap', value: fmt(train - serve, 2)},
        ],
        note: 'Orange = current drift. Mention logging, refresh cadence, and how much new vs historical data to mix.',
      };
    },
  },
};

function binaryEntropy(p) {
  const x = clamp(p, 0, 1);
  if (x <= 0 || x >= 1) return 0;
  return -(x * Math.log2(x) + (1 - x) * Math.log2(1 - x));
}

function confusionFromScores(scores, tau) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (const row of scores) {
    const pred = row.s >= tau ? 1 : 0;
    if (pred === 1 && row.y === 1) tp += 1;
    else if (pred === 1 && row.y === 0) fp += 1;
    else if (pred === 0 && row.y === 1) fn += 1;
    else tn += 1;
  }
  const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec);
  return {tp, fp, fn, tn, prec, rec, f1};
}

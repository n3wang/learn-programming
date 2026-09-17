import {clamp, fmt} from './probMath';

/** Calculus explorers for Law of the Mean / monotone from f′. */

/** @type {Record<string, import('./presets').Preset>} */
export const CALCULUS_PRESETS = {
  meanValueSlope: {
    id: 'meanValueSlope',
    title: 'Mean Value Theorem — slopes',
    subtitle: 'Compare secant slope (f(b)−f(a))/(b−a) with f′(x) on a parabola',
    formula: '$\\dfrac{f(b)-f(a)}{b-a}=f\'(x_0)\\quad\\text{for some }x_0\\in(a,b)$',
    params: [
      {
        key: 'a',
        label: 'a',
        meaning: 'Left endpoint of [a,b].',
        min: -1,
        max: 1.5,
        step: 0.05,
        default: 0,
      },
      {
        key: 'b',
        label: 'b',
        meaning: 'Right endpoint (kept > a).',
        min: 0.5,
        max: 3,
        step: 0.05,
        default: 2,
      },
      {
        key: 'c',
        label: 'quadratic c',
        meaning: 'f(x)=c x² + d x with d=0.2 — slide c to change curvature.',
        min: 0.1,
        max: 1.2,
        step: 0.05,
        default: 0.4,
      },
    ],
    example(v) {
      const a = v.a;
      const b = Math.max(v.b, a + 0.2);
      const c = clamp(v.c, 0.05, 2);
      const d = 0.2;
      const f = (x) => c * x * x + d * x;
      const fp = (x) => 2 * c * x + d;
      const sec = (f(b) - f(a)) / (b - a);
      const x0 = (sec - d) / (2 * c);
      return (
        `f(x)=${fmt(c)}x²+0.2x on [${fmt(a)},${fmt(b)}]. ` +
        `Secant slope ${fmt(sec)}; MVT point x₀=${fmt(x0)} where f′(x₀) matches.`
      );
    },
    compute(v) {
      const a = v.a;
      const b = Math.max(v.b, a + 0.2);
      const c = clamp(v.c, 0.05, 2);
      const d = 0.2;
      const f = (x) => c * x * x + d * x;
      const fp = (x) => 2 * c * x + d;
      const sec = (f(b) - f(a)) / (b - a);
      const x0 = (sec - d) / (2 * c);
      const series = [];
      const n = 60;
      for (let i = 0; i <= n; i += 1) {
        const x = a + ((b - a) * i) / n;
        series.push({
          x,
          y: fp(x),
          highlight: Math.abs(x - x0) < (b - a) / n,
        });
      }
      return {
        chartType: 'line',
        yLabel: "f'(x) on [a,b]",
        series,
        refLineY: sec,
        stats: [
          {label: 'secant', value: fmt(sec)},
          {label: 'x₀', value: fmt(x0)},
          {label: "f'(x₀)", value: fmt(fp(x0))},
          {label: '|gap|', value: fmt(Math.abs(fp(x0) - sec))},
        ],
        note: 'Green dashed line = secant slope. Orange mark = where f′ crosses it (the MVT point for this parabola).',
      };
    },
  },

  rolleZeroDerivative: {
    id: 'rolleZeroDerivative',
    title: 'Rolle — f′ must hit zero',
    subtitle: 'Equal endpoint values on a smooth bump; slide the peak and watch f′ change sign',
    formula: '$f(a)=f(b)\\ \\Rightarrow\\ \\exists\\,x_0\\in(a,b):\\ f\'(x_0)=0$',
    params: [
      {
        key: 'peak',
        label: 'peak location',
        meaning: 'Where the sine-like bump is tallest between 0 and 1.',
        min: 0.2,
        max: 0.8,
        step: 0.02,
        default: 0.5,
      },
    ],
    example(v) {
      const p = clamp(v.peak, 0.15, 0.85);
      return (
        `Model a bump on [0,1] with f(0)=f(1)=0 and peak near ${fmt(p)}. ` +
        `Rolle guarantees some x₀ with f′(x₀)=0 — here the crest itself.`
      );
    },
    compute(v) {
      const p = clamp(v.peak, 0.15, 0.85);
      // Piecewise-smooth tent-like via scaled sin on [0,1] warped so max at p
      const f = (x) => {
        if (x <= 0 || x >= 1) return 0;
        if (x <= p) return Math.sin((Math.PI / 2) * (x / p));
        return Math.sin((Math.PI / 2) * ((1 - x) / (1 - p)));
      };
      const series = [];
      let xStar = p;
      let best = Infinity;
      for (let i = 0; i <= 80; i += 1) {
        const x = i / 80;
        const h = 1e-4;
        const fp = (f(x + h) - f(x - h)) / (2 * h);
        series.push({x, y: fp, highlight: false});
        if (Math.abs(fp) < best && x > 0.02 && x < 0.98) {
          best = Math.abs(fp);
          xStar = x;
        }
      }
      for (const pt of series) {
        if (Math.abs(pt.x - xStar) < 0.012) pt.highlight = true;
      }
      return {
        chartType: 'line',
        yLabel: "f'(x) on (0,1)",
        series,
        refLineY: 0,
        stats: [
          {label: 'peak≈', value: fmt(p)},
          {label: 'x₀≈', value: fmt(xStar)},
          {label: '|f′|≈', value: fmt(best)},
        ],
        note: 'f′ changes from + to − across the peak, so it crosses 0 — Rolle’s horizontal tangent.',
      };
    },
  },

  monoFromDerivative: {
    id: 'monoFromDerivative',
    title: 'Increasing / decreasing from f′',
    subtitle: 'Slide a linear drift vs oscillation — watch whether f′ stays positive',
    formula: '$f\'>0\\Rightarrow f\\uparrow,\\quad f\'<0\\Rightarrow f\\downarrow$',
    params: [
      {
        key: 'drift',
        label: 'linear drift',
        meaning: 'Baseline slope added to a mild sine wiggle.',
        min: -0.6,
        max: 1.2,
        step: 0.05,
        default: 0.5,
      },
      {
        key: 'wiggle',
        label: 'wiggle size',
        meaning: 'Amplitude of cos contribution to f′.',
        min: 0,
        max: 0.8,
        step: 0.05,
        default: 0.25,
      },
    ],
    example(v) {
      const d = v.drift;
      const w = v.wiggle;
      const minFp = d - w;
      const verdict =
        minFp > 0 ? 'always increasing on the window' : d + w < 0 ? 'always decreasing' : 'not monotone (f′ changes sign)';
      return `f′(x)=${fmt(d)}+${fmt(w)}cos x. Minimum of f′ is ${fmt(minFp)} → ${verdict}.`;
    },
    compute(v) {
      const d = v.drift;
      const w = clamp(v.wiggle, 0, 1);
      const series = [];
      let minFp = Infinity;
      let maxFp = -Infinity;
      for (let i = 0; i <= 80; i += 1) {
        const x = (i / 80) * Math.PI * 2;
        const fp = d + w * Math.cos(x);
        minFp = Math.min(minFp, fp);
        maxFp = Math.max(maxFp, fp);
        series.push({x, y: fp, highlight: Math.abs(fp) < 0.05});
      }
      const verdict =
        minFp > 0.02 ? 'increasing' : maxFp < -0.02 ? 'decreasing' : 'mixed signs';
      return {
        chartType: 'line',
        yLabel: "f'(x) over [0,2π]",
        series,
        refLineY: 0,
        stats: [
          {label: 'min f′', value: fmt(minFp)},
          {label: 'max f′', value: fmt(maxFp)},
          {label: 'verdict', value: verdict},
        ],
        note: 'Orange marks near f′≈0. If f′ never crosses zero with a fixed sign, Theorem 13.7 gives monotone behavior.',
      };
    },
  },

  secondDerivativeTest: {
    id: 'secondDerivativeTest',
    title: 'Second derivative test',
    subtitle: 'At a critical number with f′(c)=0, the sign of f″(c) decides max vs min',
    formula: '$f\'(c)=0:\\; f\'\'(c)<0\\Rightarrow\\text{rel max},\\; f\'\'(c)>0\\Rightarrow\\text{rel min}$',
    params: [
      {
        key: 'which',
        label: 'example',
        meaning: '0: 7x²−3x+5 at 3/14. 1: cubic at 1. 2: cubic at 1/3. 3: x⁴ at 0 (inconclusive).',
        min: 0,
        max: 3,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      const names = ['parabola min', 'cubic min at 1', 'cubic max at 1/3', 'x⁴ inconclusive'];
      return `Example ${Math.floor(v.which)}: ${names[Math.floor(clamp(v.which, 0, 3))]}.`;
    },
    compute(v) {
      const which = Math.floor(clamp(v.which, 0, 3));
      const cases = [
        {c: 3 / 14, fpp: 14, label: 'min'},
        {c: 1, fpp: 2, label: 'min'},
        {c: 1 / 3, fpp: -2, label: 'max'},
        {c: 0, fpp: 0, label: '?'},
      ];
      const {c, fpp, label} = cases[which];
      const series = [
        {x: 0, y: fpp < 0 ? 1 : 0, label: 'rel max?', highlight: label === 'max'},
        {x: 1, y: fpp > 0 ? 1 : 0, label: 'rel min?', highlight: label === 'min'},
        {x: 2, y: fpp === 0 ? 1 : 0, label: 'inconclusive?', highlight: label === '?'},
      ];
      return {
        chartType: 'bar',
        yLabel: 'test fires (1=yes)',
        series,
        stats: [
          {label: 'c', value: fmt(c)},
          {label: "f''(c)", value: fmt(fpp)},
          {label: 'verdict', value: label === '?' ? 'inconclusive' : `relative ${label}`},
        ],
        note: 'Bars show which conclusion the second-derivative test supports for the selected example.',
      };
    },
  },

  absoluteExtremaTable: {
    id: 'absoluteExtremaTable',
    title: 'Absolute extrema table',
    subtitle: 'On [a,b]: evaluate f at endpoints and interior critical numbers',
    formula: '$\\max/\\min\\{f(a),f(c_i),f(b)\\}$',
    params: [
      {
        key: 'a',
        label: 'a',
        meaning: 'Left endpoint.',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0,
      },
      {
        key: 'b',
        label: 'b',
        meaning: 'Right endpoint (book uses 2).',
        min: 1,
        max: 3,
        step: 0.05,
        default: 2,
      },
    ],
    example(v) {
      return `Book cubic f(x)=x³−x²−x+2 on [${fmt(v.a)},${fmt(v.b)}]. Critical in (0,2): x=1.`;
    },
    compute(v) {
      const a = clamp(v.a, 0, 1.5);
      const b = Math.max(v.b, a + 0.2);
      const f = (x) => x ** 3 - x ** 2 - x + 2;
      const pts = [
        {x: a, y: f(a), label: 'a'},
        {x: 1, y: f(1), label: 'c=1'},
        {x: b, y: f(b), label: 'b'},
      ].filter((p) => p.label !== 'c=1' || (1 > a && 1 < b));
      let maxP = pts[0];
      let minP = pts[0];
      for (const p of pts) {
        if (p.y > maxP.y) maxP = p;
        if (p.y < minP.y) minP = p;
      }
      return {
        chartType: 'bar',
        yLabel: 'f(x)',
        series: pts.map((p) => ({
          x: p.x,
          y: p.y,
          label: p.label,
          highlight: p === maxP || p === minP,
        })),
        stats: [
          {label: 'abs max', value: `${fmt(maxP.y)} at ${maxP.label}`},
          {label: 'abs min', value: `${fmt(minP.y)} at ${minP.label}`},
        ],
        note: 'Orange bars mark the winning absolute max/min among the table candidates.',
      };
    },
  },

  concavitySign: {
    id: 'concavitySign',
    title: 'Concavity from f″',
    subtitle: 'Sign of the second derivative decides cup vs cap',
    formula: '$f\'\'>0\\Rightarrow\\text{concave up},\\quad f\'\'<0\\Rightarrow\\text{concave down}$',
    params: [
      {
        key: 'which',
        label: 'example',
        meaning: '0: x² always up. 1: −x² always down. 2: x³ changes at 0. 3: x⁴ always up (no inflection).',
        min: 0,
        max: 3,
        step: 1,
        default: 2,
      },
    ],
    example(v) {
      const names = ['x² cup', '−x² cap', 'x³ inflection at 0', 'x⁴ no inflection'];
      return names[Math.floor(clamp(v.which, 0, 3))];
    },
    compute(v) {
      const which = Math.floor(clamp(v.which, 0, 3));
      const series = [];
      for (let i = 0; i <= 40; i += 1) {
        const x = -1.5 + (3 * i) / 40;
        let fpp = 2;
        if (which === 1) fpp = -2;
        if (which === 2) fpp = 6 * x;
        if (which === 3) fpp = 12 * x * x;
        series.push({x, y: fpp, label: `f″(${fmt(x)})`});
      }
      const verdicts = [
        'always concave up',
        'always concave down',
        'inflection at 0 (f″ changes sign)',
        'f″=0 at 0 but still concave up',
      ];
      return {
        chartType: 'line',
        yLabel: "f''(x)",
        series,
        refLineY: 0,
        stats: [{label: 'verdict', value: verdicts[which]}],
        note: 'Watch whether f″ crosses zero with a sign change (inflection) or only touches zero.',
      };
    },
  },

  rationalAsymptotes: {
    id: 'rationalAsymptotes',
    title: 'Rational asymptotes',
    subtitle: 'Vertical poles vs horizontal end behavior',
    formula: '$f=g/h:\\; h(x_0)=0,\\,g(x_0)\\ne 0\\Rightarrow x=x_0\\text{ vertical};\\;\\deg\\text{ compare for }y=L$',
    params: [
      {
        key: 'which',
        label: 'example',
        meaning: '0: 1/x. 1: 1/(x−2). 2: (x−2)/((x−1)(x+3)). 3: (x+4)/(x−3).',
        min: 0,
        max: 3,
        step: 1,
        default: 3,
      },
    ],
    example(v) {
      const names = ['1/x', '1/(x−2)', '(x−2)/((x−1)(x+3))', '(x+4)/(x−3)'];
      return names[Math.floor(clamp(v.which, 0, 3))];
    },
    compute(v) {
      const which = Math.floor(clamp(v.which, 0, 3));
      const data = [
        {v: 'x=0', h: 'y=0'},
        {v: 'x=2', h: 'y=0'},
        {v: 'x=1, x=−3', h: 'y=0'},
        {v: 'x=3', h: 'y=1'},
      ][which];
      return {
        chartType: 'bar',
        yLabel: 'present',
        series: [
          {x: 0, y: 1, label: 'vertical', highlight: true},
          {x: 1, y: 1, label: 'horizontal', highlight: true},
        ],
        stats: [
          {label: 'vertical', value: data.v},
          {label: 'horizontal', value: data.h},
        ],
        note: 'Equal degree ⇒ horizontal asymptote = ratio of leading coefficients.',
      };
    },
  },
};

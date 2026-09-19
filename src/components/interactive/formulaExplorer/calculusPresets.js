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

  degreeRadianConvert: {
    id: 'degreeRadianConvert',
    title: 'Degrees ↔ radians',
    subtitle: 'Scale by π/180 or 180/π',
    formula: '$\\theta_{\\mathrm{rad}}=\\theta^\\circ\\cdot\\dfrac{\\pi}{180},\\quad \\theta^\\circ=\\theta_{\\mathrm{rad}}\\cdot\\dfrac{180}{\\pi}$',
    params: [
      {
        key: 'deg',
        label: 'degrees',
        meaning: 'Common special angles; readout shows exact π-form when possible.',
        min: 0,
        max: 360,
        step: 15,
        default: 60,
      },
    ],
    example(v) {
      return `${fmt(v.deg)}° on the standard conversion scale.`;
    },
    compute(v) {
      const deg = clamp(v.deg, 0, 360);
      const rad = (deg * Math.PI) / 180;
      const specials = {
        0: '0',
        30: '\\pi/6',
        45: '\\pi/4',
        60: '\\pi/3',
        90: '\\pi/2',
        180: '\\pi',
        270: '3\\pi/2',
        360: '2\\pi',
      };
      const exact = specials[Math.round(deg)];
      return {
        chartType: 'bar',
        yLabel: 'measure',
        series: [
          {x: 0, y: deg, label: 'degrees', highlight: true},
          {x: 1, y: (rad * 180) / Math.PI, label: 'check°', highlight: false},
        ],
        stats: [
          {label: 'radians', value: exact ? exact.replace(/\\/g, '') : fmt(rad)},
          {label: 'numeric', value: fmt(rad)},
          {label: '1 rad ≈', value: `${fmt(180 / Math.PI)}°`},
        ],
        note: exact
          ? `Exact: ${deg}° = ${exact.replace(/\\\\/g, '\\')} rad.`
          : 'Use θ_rad = θ° · π/180. Full turn: 360° = 2π.',
      };
    },
  },

  unitCircleValues: {
    id: 'unitCircleValues',
    title: 'Special sin / cos values',
    subtitle: 'Standard acute and quadrant angles on the unit circle',
    formula: '$(\\cos\\theta,\\sin\\theta)$ on the unit circle',
    params: [
      {
        key: 'which',
        label: 'angle',
        meaning: '0:0  1:π/6  2:π/4  3:π/3  4:π/2  5:π  6:3π/2',
        min: 0,
        max: 6,
        step: 1,
        default: 3,
      },
    ],
    example(v) {
      const names = ['0', 'π/6', 'π/4', 'π/3', 'π/2', 'π', '3π/2'];
      return `θ = ${names[Math.floor(clamp(v.which, 0, 6))]}`;
    },
    compute(v) {
      const which = Math.floor(clamp(v.which, 0, 6));
      const table = [
        {c: 1, s: 0, label: '0'},
        {c: Math.sqrt(3) / 2, s: 0.5, label: 'π/6'},
        {c: Math.SQRT1_2, s: Math.SQRT1_2, label: 'π/4'},
        {c: 0.5, s: Math.sqrt(3) / 2, label: 'π/3'},
        {c: 0, s: 1, label: 'π/2'},
        {c: -1, s: 0, label: 'π'},
        {c: 0, s: -1, label: '3π/2'},
      ][which];
      return {
        chartType: 'bar',
        yLabel: 'value',
        series: [
          {x: 0, y: table.c, label: 'cos', highlight: true},
          {x: 1, y: table.s, label: 'sin', highlight: true},
        ],
        stats: [
          {label: 'θ', value: table.label},
          {label: 'cos', value: fmt(table.c)},
          {label: 'sin', value: fmt(table.s)},
          {label: 'sin²+cos²', value: fmt(table.s * table.s + table.c * table.c)},
        ],
        note: 'Check sin²θ + cos²θ = 1 at every special angle.',
      };
    },
  },

  trigAdditionExplorer: {
    id: 'trigAdditionExplorer',
    title: 'cos(u±v) and sin(u±v)',
    subtitle: 'Numeric check of the addition formulas',
    formula: '$\\cos(u\\pm v)=\\cos u\\cos v\\mp\\sin u\\sin v,\\;\\sin(u\\pm v)=\\sin u\\cos v\\pm\\cos u\\sin v$',
    params: [
      {
        key: 'uDeg',
        label: 'u°',
        meaning: 'First angle in degrees.',
        min: 0,
        max: 180,
        step: 5,
        default: 60,
      },
      {
        key: 'vDeg',
        label: 'v°',
        meaning: 'Second angle in degrees.',
        min: 0,
        max: 180,
        step: 5,
        default: 30,
      },
    ],
    example(v) {
      return `u=${fmt(v.uDeg)}°, v=${fmt(v.vDeg)}°`;
    },
    compute(v) {
      const u = (clamp(v.uDeg, 0, 180) * Math.PI) / 180;
      const w = (clamp(v.vDeg, 0, 180) * Math.PI) / 180;
      const cosUmV = Math.cos(u) * Math.cos(w) + Math.sin(u) * Math.sin(w);
      const cosUpV = Math.cos(u) * Math.cos(w) - Math.sin(u) * Math.sin(w);
      const sinUpV = Math.sin(u) * Math.cos(w) + Math.cos(u) * Math.sin(w);
      return {
        chartType: 'bar',
        yLabel: 'value',
        series: [
          {x: 0, y: cosUmV, label: 'cos(u−v)', highlight: true},
          {x: 1, y: cosUpV, label: 'cos(u+v)', highlight: true},
          {x: 2, y: sinUpV, label: 'sin(u+v)', highlight: false},
        ],
        stats: [
          {label: 'cos(u−v)', value: fmt(cosUmV)},
          {label: 'direct', value: fmt(Math.cos(u - w))},
          {label: 'sin(u+v)', value: fmt(sinUpV)},
        ],
        note: 'Bars use the addition formulas; “direct” is Math.cos(u−v) for a sanity check.',
      };
    },
  },

  trigDoubleHalfExplorer: {
    id: 'trigDoubleHalfExplorer',
    title: 'Double / half angle',
    subtitle: 'cos 2u, sin 2u, and half-angle squares',
    formula: '$\\cos 2u=\\cos^{2}u-\\sin^{2}u,\\;\\sin 2u=2\\sin u\\cos u,\\;\\cos^{2}(u/2)=(1+\\cos u)/2$',
    params: [
      {
        key: 'uDeg',
        label: 'u°',
        meaning: 'Angle u in degrees.',
        min: 0,
        max: 180,
        step: 5,
        default: 60,
      },
    ],
    example(v) {
      return `u = ${fmt(v.uDeg)}°`;
    },
    compute(v) {
      const u = (clamp(v.uDeg, 0, 180) * Math.PI) / 180;
      const c2 = Math.cos(u) ** 2 - Math.sin(u) ** 2;
      const s2 = 2 * Math.sin(u) * Math.cos(u);
      const halfC = (1 + Math.cos(u)) / 2;
      const halfS = (1 - Math.cos(u)) / 2;
      return {
        chartType: 'bar',
        yLabel: 'value',
        series: [
          {x: 0, y: c2, label: 'cos 2u', highlight: true},
          {x: 1, y: s2, label: 'sin 2u', highlight: true},
          {x: 2, y: halfC, label: 'cos²(u/2)', highlight: false},
        ],
        stats: [
          {label: 'cos 2u', value: fmt(c2)},
          {label: 'sin 2u', value: fmt(s2)},
          {label: 'cos²(u/2)', value: fmt(halfC)},
          {label: 'sin²(u/2)', value: fmt(halfS)},
        ],
        note: 'Half-angle identities give squares; take ± square roots with quadrant care.',
      };
    },
  },

  limSinThetaExplorer: {
    id: 'limSinThetaExplorer',
    title: 'lim (sin θ)/θ and (1−cos θ)/θ',
    subtitle: 'Probe the two limits that unlock trig derivatives (θ in radians)',
    formula: '$\\lim_{\\theta\\to 0}\\dfrac{\\sin\\theta}{\\theta}=1,\\quad\\lim_{\\theta\\to 0}\\dfrac{1-\\cos\\theta}{\\theta}=0$',
    params: [
      {
        key: 'thetaDeg',
        label: 'θ°',
        meaning: 'Probe angle in degrees (converted to radians internally).',
        min: -60,
        max: 60,
        step: 1,
        default: 20,
      },
    ],
    example(v) {
      const th = (clamp(v.thetaDeg, -60, 60) * Math.PI) / 180;
      return `θ=${fmt(v.thetaDeg)}° ≈ ${fmt(th)} rad`;
    },
    compute(v) {
      const th = (clamp(v.thetaDeg, -60, 60) * Math.PI) / 180;
      const ratio = Math.abs(th) < 1e-10 ? 1 : Math.sin(th) / th;
      const oneMinus = Math.abs(th) < 1e-10 ? 0 : (1 - Math.cos(th)) / th;
      return {
        chartType: 'bar',
        yLabel: 'value',
        series: [
          {x: 0, y: ratio, label: 'sin/θ', highlight: true},
          {x: 1, y: oneMinus, label: '(1−cos)/θ', highlight: true},
          {x: 2, y: 1, label: 'target 1', highlight: false},
        ],
        stats: [
          {label: 'sinθ/θ', value: fmt(ratio)},
          {label: '(1−cosθ)/θ', value: fmt(oneMinus)},
          {label: 'θ rad', value: fmt(th)},
        ],
        note: 'As θ→0 the blue bar approaches 1 and the red bar approaches 0.',
      };
    },
  },

  ampPeriodFreqExplorer: {
    id: 'ampPeriodFreqExplorer',
    title: 'Amplitude, period, frequency',
    subtitle: 'y = A sin(bx) or A cos(bx)',
    formula: '$p=2\\pi/b,\\; f=b,\\; \\text{amplitude}=|A|$',
    params: [
      {
        key: 'A',
        label: 'A',
        meaning: 'Vertical scale (amplitude |A|).',
        min: 0.25,
        max: 3,
        step: 0.05,
        default: 1.5,
      },
      {
        key: 'b',
        label: 'b',
        meaning: 'Frequency factor; period = 2π/b.',
        min: 0.5,
        max: 6,
        step: 0.1,
        default: 2,
      },
    ],
    example(v) {
      const A = clamp(v.A, 0.25, 3);
      const b = clamp(v.b, 0.5, 6);
      return `A=${fmt(A)}, b=${fmt(b)} ⇒ p=${fmt((2 * Math.PI) / b)}, f=${fmt(b)}, amp=${fmt(Math.abs(A))}`;
    },
    compute(v) {
      const A = clamp(v.A, 0.25, 3);
      const b = clamp(v.b, 0.5, 6);
      const p = (2 * Math.PI) / b;
      const series = [];
      const n = 80;
      for (let i = 0; i <= n; i += 1) {
        const x = (2 * Math.PI * i) / n;
        series.push({x, y: A * Math.sin(b * x), highlight: false});
      }
      return {
        chartType: 'line',
        yLabel: 'A sin(bx)',
        series,
        stats: [
          {label: 'period', value: fmt(p)},
          {label: 'frequency', value: fmt(b)},
          {label: 'amplitude', value: fmt(Math.abs(A))},
        ],
        note: 'pf = 2π always for these pure waves.',
      };
    },
  },

  trigDerivValuesExplorer: {
    id: 'trigDerivValuesExplorer',
    title: 'Trig derivative values',
    subtitle: 'Compare sin′, cos′, tan′, sec′ at a sample x',
    formula: '$(\\sin)\'=\\cos,\\;(\\cos)\'=-\\sin,\\;(\\tan)\'=\\sec^{2},\\;(\\sec)\'=\\tan\\sec$',
    params: [
      {
        key: 'xDeg',
        label: 'x°',
        meaning: 'Evaluation point (avoid odd multiples of 90° for tan/sec).',
        min: -80,
        max: 80,
        step: 5,
        default: 30,
      },
    ],
    example(v) {
      return `x = ${fmt(v.xDeg)}°`;
    },
    compute(v) {
      const x = (clamp(v.xDeg, -80, 80) * Math.PI) / 180;
      const c = Math.cos(x);
      const s = Math.sin(x);
      const sec = 1 / c;
      const tan = s / c;
      return {
        chartType: 'bar',
        yLabel: "f'(x)",
        series: [
          {x: 0, y: c, label: "sin'", highlight: true},
          {x: 1, y: -s, label: "cos'", highlight: true},
          {x: 2, y: sec * sec, label: "tan'", highlight: false},
          {x: 3, y: tan * sec, label: "sec'", highlight: false},
        ],
        stats: [
          {label: "sin'", value: fmt(c)},
          {label: "cos'", value: fmt(-s)},
          {label: "tan'", value: fmt(sec * sec)},
          {label: "sec'", value: fmt(tan * sec)},
        ],
        note: 'Evaluated from the differentiation formulas (radians).',
      };
    },
  },

  invTrigDerivExplorer: {
    id: 'invTrigDerivExplorer',
    title: 'Inverse trig derivatives',
    subtitle: 'arcsin′, arccos′, arctan′ at a sample x ∈ (−1,1)',
    formula:
      "$(\\arcsin)'=1/\\sqrt{1-x^{2}},\\;(\\arccos)'=-1/\\sqrt{1-x^{2}},\\;(\\arctan)'=1/(1+x^{2})$",
    params: [
      {
        key: 'x',
        label: 'x',
        meaning: 'Point in (−0.95, 0.95) so square roots stay real and nonzero.',
        min: -0.95,
        max: 0.95,
        step: 0.05,
        default: 0.5,
      },
    ],
    example(v) {
      return `x = ${fmt(v.x)}`;
    },
    compute(v) {
      const x = clamp(v.x, -0.95, 0.95);
      const s = Math.sqrt(1 - x * x);
      const a = 1 / s;
      const c = -1 / s;
      const t = 1 / (1 + x * x);
      return {
        chartType: 'bar',
        yLabel: "f'(x)",
        series: [
          {x: 0, y: a, label: 'arcsin′', highlight: true},
          {x: 1, y: c, label: 'arccos′', highlight: true},
          {x: 2, y: t, label: 'arctan′', highlight: false},
        ],
        stats: [
          {label: 'arcsin′', value: fmt(a)},
          {label: 'arccos′', value: fmt(c)},
          {label: 'arctan′', value: fmt(t)},
          {label: 'arcsin+arccos', value: fmt(Math.asin(x) + Math.acos(x))},
        ],
        note: 'Check arcsin x + arccos x = π/2 (derivative sum ≈ 0).',
      };
    },
  },

  invTrigValuesExplorer: {
    id: 'invTrigValuesExplorer',
    title: 'Special inverse-trig values',
    subtitle: 'Common exact values of arcsin / arccos / arctan',
    formula: '$\\arcsin(\\tfrac12)=\\pi/6,\\;\\arctan 1=\\pi/4,\\;\\arccos 0=\\pi/2$',
    params: [
      {
        key: 'which',
        label: 'row',
        meaning: '0 arcsin table · 1 arctan table · 2 arccos table',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
      },
    ],
    example(v) {
      return ['arcsin', 'arctan', 'arccos'][Math.round(clamp(v.which, 0, 2))];
    },
    compute(v) {
      const w = Math.round(clamp(v.which, 0, 2));
      const tables = [
        [
          {x: 0, y: 0, label: '0'},
          {x: 1, y: Math.PI / 6, label: '1/2'},
          {x: 2, y: Math.PI / 4, label: '√2/2'},
          {x: 3, y: Math.PI / 3, label: '√3/2'},
          {x: 4, y: Math.PI / 2, label: '1'},
        ],
        [
          {x: 0, y: 0, label: '0'},
          {x: 1, y: Math.PI / 6, label: '1/√3'},
          {x: 2, y: Math.PI / 4, label: '1'},
          {x: 3, y: Math.PI / 3, label: '√3'},
        ],
        [
          {x: 0, y: Math.PI / 2, label: '0'},
          {x: 1, y: Math.PI / 3, label: '1/2'},
          {x: 2, y: Math.PI / 4, label: '√2/2'},
          {x: 3, y: Math.PI / 6, label: '√3/2'},
          {x: 4, y: 0, label: '1'},
        ],
      ];
      const series = tables[w].map((r, i) => ({
        x: i,
        y: r.y,
        label: r.label,
        highlight: i === 1,
      }));
      return {
        chartType: 'bar',
        yLabel: 'radians',
        series,
        stats: series.map((s) => ({label: s.label, value: fmt(s.y)})),
        note: 'Bars are exact special values in radians.',
      };
    },
  },

  freeFallExplorer: {
    id: 'freeFallExplorer',
    title: 'Free fall — s and v',
    subtitle: 's = s₀ + v₀ t − 16 t² (ft, s); upward positive',
    formula: '$v=v_0-32t,\\quad s=s_0+v_0 t-16t^{2}$',
    params: [
      {
        key: 's0',
        label: 's₀',
        meaning: 'Initial height (ft).',
        min: 0,
        max: 100,
        step: 5,
        default: 0,
      },
      {
        key: 'v0',
        label: 'v₀',
        meaning: 'Initial velocity (ft/s); positive = upward.',
        min: -20,
        max: 80,
        step: 2,
        default: 48,
      },
      {
        key: 't',
        label: 't',
        meaning: 'Time (s).',
        min: 0,
        max: 5,
        step: 0.1,
        default: 1,
      },
    ],
    example(v) {
      return `s₀=${fmt(v.s0)}, v₀=${fmt(v.v0)}, t=${fmt(v.t)}`;
    },
    compute(v) {
      const s0 = clamp(v.s0, 0, 200);
      const v0 = clamp(v.v0, -50, 100);
      const t = clamp(v.t, 0, 8);
      const series = [];
      const n = 50;
      const tMax = Math.max(t + 0.5, 3);
      for (let i = 0; i <= n; i += 1) {
        const u = (tMax * i) / n;
        series.push({
          x: u,
          y: s0 + v0 * u - 16 * u * u,
          highlight: Math.abs(u - t) < tMax / n,
        });
      }
      const s = s0 + v0 * t - 16 * t * t;
      const vel = v0 - 32 * t;
      return {
        chartType: 'line',
        yLabel: 's(t) ft',
        series,
        stats: [
          {label: 's', value: fmt(s)},
          {label: 'v', value: fmt(vel)},
          {label: 'a', value: '-32'},
          {label: 'speed', value: fmt(Math.abs(vel))},
        ],
        note: 'Peak when v=0: t=v₀/32 (if v₀>0).',
      };
    },
  },

  circularMotionExplorer: {
    id: 'circularMotionExplorer',
    title: 'Circular motion — θ, ω',
    subtitle: 'θ = ω₀ t + ½ α t² (constant α)',
    formula: '$\\omega=\\dfrac{d\\theta}{dt},\\quad\\alpha=\\dfrac{d\\omega}{dt}$',
    params: [
      {
        key: 'omega0',
        label: 'ω₀',
        meaning: 'Initial angular velocity (rad/s).',
        min: 0,
        max: 3,
        step: 0.1,
        default: 1,
      },
      {
        key: 'alpha',
        label: 'α',
        meaning: 'Constant angular acceleration (rad/s²).',
        min: -1,
        max: 1,
        step: 0.1,
        default: 0,
      },
      {
        key: 't',
        label: 't',
        meaning: 'Time (s).',
        min: 0,
        max: 6,
        step: 0.1,
        default: 2,
      },
    ],
    example(v) {
      return `ω₀=${fmt(v.omega0)}, α=${fmt(v.alpha)}, t=${fmt(v.t)}`;
    },
    compute(v) {
      const w0 = clamp(v.omega0, 0, 5);
      const al = clamp(v.alpha, -2, 2);
      const t = clamp(v.t, 0, 10);
      const series = [];
      const n = 40;
      for (let i = 0; i <= n; i += 1) {
        const u = (6 * i) / n;
        const th = w0 * u + 0.5 * al * u * u;
        series.push({x: u, y: th, highlight: Math.abs(u - t) < 6 / n});
      }
      const th = w0 * t + 0.5 * al * t * t;
      const w = w0 + al * t;
      return {
        chartType: 'line',
        yLabel: 'θ(t) rad',
        series,
        stats: [
          {label: 'θ', value: fmt(th)},
          {label: 'ω', value: fmt(w)},
          {label: 'α', value: fmt(al)},
        ],
        note: 'With constant α: ω = ω₀+αt and θ = ω₀t + ½αt².',
      };
    },
  },

  ladderRelatedRates: {
    id: 'ladderRelatedRates',
    title: 'Sliding ladder related rates',
    subtitle: 'x² + y² = L² ⇒ dy/dt = −(x/y) dx/dt',
    formula: '$x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}=0$',
    params: [
      {
        key: 'L',
        label: 'L',
        meaning: 'Ladder length.',
        min: 10,
        max: 40,
        step: 1,
        default: 25,
      },
      {
        key: 'x',
        label: 'x',
        meaning: 'Base distance from wall.',
        min: 1,
        max: 24,
        step: 0.5,
        default: 7,
      },
      {
        key: 'dxdt',
        label: 'dx/dt',
        meaning: 'Rate base slides away.',
        min: 0.5,
        max: 6,
        step: 0.5,
        default: 3,
      },
    ],
    example(v) {
      return `L=${fmt(v.L)}, x=${fmt(v.x)}, dx/dt=${fmt(v.dxdt)}`;
    },
    compute(v) {
      const L = clamp(v.L, 5, 50);
      const x = clamp(v.x, 0.5, L - 0.5);
      const dx = clamp(v.dxdt, 0.1, 10);
      const y = Math.sqrt(L * L - x * x);
      const dy = (-x / y) * dx;
      const series = [];
      for (let i = 1; i <= 20; i += 1) {
        const xi = (L * 0.9 * i) / 20;
        const yi = Math.sqrt(L * L - xi * xi);
        series.push({
          x: xi,
          y: (-xi / yi) * dx,
          highlight: Math.abs(xi - x) < L / 40,
        });
      }
      return {
        chartType: 'line',
        yLabel: 'dy/dt',
        series,
        stats: [
          {label: 'y', value: fmt(y)},
          {label: 'dy/dt', value: fmt(dy)},
          {label: '|dy/dt|', value: fmt(Math.abs(dy))},
        ],
        note: 'Curve shows dy/dt vs x for fixed dx/dt and L.',
      };
    },
  },

  linearApproximation: {
    id: 'linearApproximation',
    title: 'Linear approximation',
    subtitle: 'f(x+Δx) ≈ f(x) + f′(x) Δx for f(x)=√x',
    formula: '$f(x+\\Delta x)\\approx f(x)+f\'(x)\\Delta x$',
    params: [
      {
        key: 'x',
        label: 'x',
        meaning: 'Base point.',
        min: 1,
        max: 25,
        step: 0.5,
        default: 16,
      },
      {
        key: 'dx',
        label: 'Δx',
        meaning: 'Increment.',
        min: -1,
        max: 2,
        step: 0.05,
        default: 0.2,
      },
    ],
    example(v) {
      return `√(${fmt(v.x)}+${fmt(v.dx)})`;
    },
    compute(v) {
      const x = clamp(v.x, 0.5, 40);
      const dx = clamp(v.dx, -2, 5);
      const f = Math.sqrt(x);
      const fp = 1 / (2 * Math.sqrt(x));
      const approx = f + fp * dx;
      const exact = Math.sqrt(Math.max(x + dx, 0));
      const series = [];
      for (let i = 0; i <= 30; i += 1) {
        const t = x - 1.5 + (3 * i) / 30;
        if (t <= 0) continue;
        series.push({
          x: t,
          y: Math.sqrt(t),
          highlight: Math.abs(t - (x + dx)) < 0.08,
        });
      }
      return {
        chartType: 'line',
        yLabel: '√t',
        series,
        stats: [
          {label: 'approx', value: fmt(approx)},
          {label: 'exact', value: fmt(exact)},
          {label: 'error', value: fmt(approx - exact)},
        ],
        note: 'Red-highlight marks the target abscissa x+Δx on the true curve.',
      };
    },
  },

  newtonSqrt3: {
    id: 'newtonSqrt3',
    title: "Newton's method for √3",
    subtitle: 'f(x)=x²−3 ⇒ xₙ₊₁ = (xₙ²+3)/(2xₙ)',
    formula: '$x_{n+1}=x_n-\\dfrac{f(x_n)}{f\'(x_n)}$',
    params: [
      {
        key: 'x0',
        label: 'x₀',
        meaning: 'Initial guess.',
        min: 0.5,
        max: 3,
        step: 0.1,
        default: 1,
      },
      {
        key: 'n',
        label: 'steps',
        meaning: 'Number of iterations.',
        min: 1,
        max: 8,
        step: 1,
        default: 4,
      },
    ],
    example(v) {
      return `x₀=${fmt(v.x0)}, ${Math.round(v.n)} steps`;
    },
    compute(v) {
      const n = Math.max(1, Math.round(clamp(v.n, 1, 12)));
      let x = clamp(v.x0, 0.2, 5);
      const series = [{x: 0, y: x, highlight: false}];
      for (let i = 1; i <= n; i += 1) {
        x = (x * x + 3) / (2 * x);
        series.push({x: i, y: x, highlight: i === n});
      }
      const target = Math.sqrt(3);
      return {
        chartType: 'line',
        yLabel: 'xₙ',
        series,
        stats: [
          {label: 'xₙ', value: fmt(x)},
          {label: '√3', value: fmt(target)},
          {label: '|err|', value: fmt(Math.abs(x - target))},
        ],
        note: 'Iteration index on the horizontal axis; values approach √3.',
      };
    },
  },
};

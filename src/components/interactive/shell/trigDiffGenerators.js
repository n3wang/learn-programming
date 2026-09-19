import {pickOne} from './mathRandom';

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function fmtFrac(num, den) {
  const g = gcd(num, den);
  num /= g;
  den /= g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  if (den === 1) return `${num}`;
  const sign = num < 0 ? '-' : '';
  return `${sign}\\dfrac{${Math.abs(num)}}{${den}}`;
}

/** Differentiate basic trig / chain-rule compositions. */
export function genDiffTrigBasic({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Differentiate: (a) $y=\\sin 3x$ (b) $y=\\cos(x^{2})$ (c) $y=\\tan 2x$.',
      steps: [
        '$D_x(\\sin 3x)=\\cos 3x\\cdot 3=3\\cos 3x$.',
        '$D_x(\\cos(x^{2}))=-\\sin(x^{2})\\cdot 2x=-2x\\sin(x^{2})$.',
        '$D_x(\\tan 2x)=\\sec^{2}(2x)\\cdot 2=2\\sec^{2}(2x)$.',
      ],
      answer: '(a) $3\\cos 3x$; (b) $-2x\\sin(x^{2})$; (c) $2\\sec^{2}(2x)$.',
    };
  }
  const k = pickOne([2, 3, 4, 5]);
  const which = pickOne(['sin', 'cos', 'tan', 'sec']);
  const map = {
    sin: {ans: `${k}\\cos ${k}x`},
    cos: {ans: `-${k}\\sin ${k}x`},
    tan: {ans: `${k}\\sec^{2}(${k}x)`},
    sec: {ans: `${k}\\sec(${k}x)\\tan(${k}x)`},
  };
  return {
    prompt: `Differentiate $y=${which}(${k}x)$.`,
    steps: [`Chain rule: outer trig derivative times $${k}$.`],
    answer: `$y'=${map[which].ans}$.`,
  };
}

/** Evaluate trig derivatives at special angles. */
export function genEvalTrigDeriv({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'Evaluate $D_x(\\sin x)$ at $x=\\pi/6$ and $D_x(\\tan x)$ at $x=\\pi/4$.',
      steps: [
        '$\\cos(\\pi/6)=\\sqrt{3}/2$.',
        '$\\sec^{2}(\\pi/4)=(\\sqrt{2})^{2}=2$.',
      ],
      answer: '$\\sqrt{3}/2$; $2$.',
    };
  }
  const bank = [
    {
      x: '\\pi/6',
      f: '\\sin x',
      ans: '\\dfrac{\\sqrt{3}}{2}',
      step: '\\cos(\\pi/6)=\\sqrt{3}/2',
    },
    {
      x: '\\pi/3',
      f: '\\cos x',
      ans: '-\\dfrac{\\sqrt{3}}{2}',
      step: '-\\sin(\\pi/3)=-\\sqrt{3}/2',
    },
    {
      x: '\\pi/4',
      f: '\\tan x',
      ans: '2',
      step: '\\sec^{2}(\\pi/4)=2',
    },
    {
      x: '0',
      f: '\\sec x',
      ans: '0',
      step: '\\tan 0\\cdot\\sec 0=0',
    },
    {
      x: '\\pi/2',
      f: '\\sin x',
      ans: '0',
      step: '\\cos(\\pi/2)=0',
    },
  ];
  const p = pickOne(bank);
  return {
    prompt: `Evaluate $D_x(${p.f})$ at $x=${p.x}$.`,
    steps: [p.step],
    answer: `$${p.ans}$.`,
  };
}

/** Amplitude / period / frequency readout. */
export function genAmpPeriod({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'For $y=1.5\\sin 4x$: amplitude, period, frequency.',
      steps: [
        'Amplitude $|A|=1.5$.',
        'Period $2\\pi/b=2\\pi/4=\\pi/2$.',
        'Frequency $b=4$.',
      ],
      answer: 'amp $1.5$; $p=\\pi/2$; $f=4$.',
    };
  }
  const A = pickOne([1, 2, 3, 1.5, 2.5]);
  const b = pickOne([2, 3, 4, 5, 6]);
  const which = pickOne(['sin', 'cos']);
  return {
    prompt: `For $y=${A}${which}(${b}x)$: give amplitude, period, and frequency.`,
    steps: [
      `Amplitude $|A|=${Math.abs(A)}$.`,
      `Period $2\\pi/${b}=${fmtFrac(2, b)}\\pi$.`,
      `Frequency $b=${b}$.`,
    ],
    answer: `amp $${Math.abs(A)}$; $p=${fmtFrac(2, b)}\\pi$; $f=${b}$.`,
  };
}

/** Product / quotient / chain mixed. */
export function genDiffTrigMixed({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) {
    return {
      prompt: 'Differentiate $y=x\\sin x$ and $y=\\dfrac{\\sin x}{x}$ (for $x\\neq 0$).',
      steps: [
        'Product: $\\sin x+x\\cos x$.',
        'Quotient: $(x\\cos x-\\sin x)/x^{2}$.',
      ],
      answer: '$\\sin x+x\\cos x$; $(x\\cos x-\\sin x)/x^{2}$.',
    };
  }
  const a = pickOne([2, 3, 4]);
  const c = pickOne([1, 2, 5]);
  const bank = [
    {
      prompt: 'Differentiate $y=\\sin x\\cos x$.',
      steps: [
        'Product: $\\cos x\\cos x+\\sin x(-\\sin x)=\\cos^{2}x-\\sin^{2}x=\\cos 2x$.',
      ],
      answer: '$y\'=\\cos 2x$ (or $\\cos^{2}x-\\sin^{2}x$).',
    },
    {
      prompt: 'Differentiate $y=\\sec^{2} x$.',
      steps: ['Chain: $2\\sec x\\cdot(\\sec x\\tan x)=2\\sec^{2}x\\tan x$.'],
      answer: '$y\'=2\\sec^{2}x\\tan x$.',
    },
    {
      prompt: 'Differentiate $y=\\sqrt{\\sin x}$ (where $\\sin x>0$).',
      steps: [
        'Chain: $\\dfrac{1}{2}(\\sin x)^{-1/2}\\cos x=\\dfrac{\\cos x}{2\\sqrt{\\sin x}}$.',
      ],
      answer: '$y\'=\\dfrac{\\cos x}{2\\sqrt{\\sin x}}$.',
    },
    {
      prompt: `Differentiate $y=${a}\\sin x+${c}\\cos x$.`,
      steps: [`$y'=${a}\\cos x-${c}\\sin x$.`],
      answer: `$y'=${a}\\cos x-${c}\\sin x$.`,
    },
  ];
  return pickOne(bank);
}

/** Inclination / angle between lines from slopes. */
export function genAngleCurves({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Lines with slopes $m_1=1$ and $m_2=-1$: angle between them?',
      steps: [
        '$1+m_1 m_2=1+(1)(-1)=0$ ⇒ perpendicular.',
        'Angle $\\phi=\\pi/2$.',
      ],
      answer: '$\\pi/2$ (perpendicular).',
    };
  }
  return pickOne([
    {
      prompt:
        'Slopes $m_1=1$, $m_2=0$: find $\\tan\\phi$ for the acute angle between the lines.',
      steps: [
        '$\\tan\\phi=\\left|\\dfrac{0-1}{1+1\\cdot 0}\\right|=1$.',
        'So $\\phi=\\pi/4$.',
      ],
      answer: '$\\tan\\phi=1$ ⇒ $\\phi=\\pi/4$.',
    },
    {
      prompt: 'A line has slope $\\sqrt{3}$. What is its inclination $\\alpha$?',
      steps: ['$\\tan\\alpha=\\sqrt{3}$ ⇒ $\\alpha=\\pi/3$ (acute).'],
      answer: '$\\alpha=\\pi/3$.',
    },
    {
      prompt: 'Slopes $m_1=2$, $m_2=-1/2$: are the lines perpendicular?',
      steps: ['$m_1 m_2=2\\cdot(-1/2)=-1$ ⇒ yes, $1+m_1 m_2=0$.'],
      answer: 'Yes — perpendicular.',
    },
  ]);
}

/** Second derivative / extrema of sin or cos. */
export function genTrigExtrema({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'On $[0,2\\pi]$, critical numbers of $\\sin x$ and classification.',
      steps: [
        '$\\cos x=0$ ⇒ $x=\\pi/2,\\,3\\pi/2$.',
        '$(\\sin)\'\'=-\\sin$: at $\\pi/2$ get $-1$ (max); at $3\\pi/2$ get $+1$ (min).',
      ],
      answer: 'Max $(\\pi/2,1)$; min $(3\\pi/2,-1)$.',
    };
  }
  return pickOne([
    {
      prompt: 'Where is $\\cos x$ increasing on $(0,2\\pi)$?',
      steps: [
        '$(\\cos)\'=-\\sin x>0$ when $\\sin x<0$, i.e. $(\\pi,2\\pi)$.',
      ],
      answer: 'On $(\\pi,2\\pi)$.',
    },
    {
      prompt: 'Find inflection points of $y=\\sin x$ in $[0,2\\pi]$.',
      steps: [
        '$y\'\'=-\\sin x=0$ ⇒ $x=0,\\pi,2\\pi$; sign of $y\'\'$ changes at each.',
      ],
      answer: '$(0,0)$, $(\\pi,0)$, $(2\\pi,0)$.',
    },
    {
      prompt: 'Critical numbers of $\\sec x$ in $(-\\pi,\\pi)$ where defined.',
      steps: [
        '$\\tan x\\sec x=0$ ⇒ $\\tan x=0$ ⇒ $x=0$ (also $\\pm\\pi$ on a closed picture).',
        'First-derivative test: relative min at $0$.',
      ],
      answer: 'Crit at $x=0$ (relative min).',
    },
  ]);
}

/** Rewrite sin(kx)/x style limits using lim sin u/u = 1. */
export function genTrigLimits({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Evaluate: (a) $\\lim_{x\\to 0}\\dfrac{\\sin 5x}{2x}$ (b) $\\lim_{x\\to 0}\\dfrac{\\sin 3x}{\\sin 7x}$ (c) $\\lim_{x\\to 0}\\dfrac{\\tan x}{x}$.',
      steps: [
        '(a) $\\tfrac{5}{2}\\lim(\\sin 5x)/(5x)=5/2$.',
        '(b) $(\\sin 3x)/(3x)\\cdot(7x)/(\\sin 7x)\\cdot 3/7\\to 3/7$.',
        '(c) $(\\sin x)/x\\cdot 1/\\cos x\\to 1$.',
      ],
      answer: '(a) $5/2$; (b) $3/7$; (c) $1$.',
    };
  }
  const a = pickOne([2, 3, 4, 5, 6]);
  const b = pickOne([2, 3, 5, 7]);
  const which = pickOne(['ratio', 'tan', 'sinax']);
  if (which === 'tan') {
    return {
      prompt: `Evaluate $\\lim_{x\\to 0}\\dfrac{\\tan(${a}x)}{x}$.`,
      steps: [
        `$\\dfrac{\\sin(${a}x)}{x}\\cdot\\dfrac{1}{\\cos(${a}x)}=a\\cdot\\dfrac{\\sin(${a}x)}{${a}x}\\cdot\\dfrac{1}{\\cos(${a}x)}\\to a$.`,
      ],
      answer: `$${a}$.`,
    };
  }
  if (which === 'sinax') {
    const c = pickOne([2, 3, 4]);
    return {
      prompt: `Evaluate $\\lim_{x\\to 0}\\dfrac{\\sin(${a}x)}{${c}x}$.`,
      steps: [`$\\dfrac{a}{${c}}\\lim\\dfrac{\\sin(${a}x)}{${a}x}=\\dfrac{a}{${c}}$.`],
      answer: `$\\dfrac{${a}}{${c}}$.`,
    };
  }
  return {
    prompt: `Evaluate $\\lim_{x\\to 0}\\dfrac{\\sin(${a}x)}{\\sin(${b}x)}$.`,
    steps: [
      `$\\dfrac{\\sin(${a}x)}{${a}x}\\cdot\\dfrac{${b}x}{\\sin(${b}x)}\\cdot\\dfrac{a}{b}\\to\\dfrac{a}{b}$.`,
    ],
    answer: `$\\dfrac{${a}}{${b}}$.`,
  };
}

/** Solve basic trig equations on the circle / general solution. */
export function genTrigEquations({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Find all solutions of $\\cos x=1/2$.',
      steps: [
        'On $[0,2\\pi]$: $x=\\pi/3$ and $x=5\\pi/3$.',
        'General: $\\pi/3+2\\pi n$ and $5\\pi/3+2\\pi n$.',
      ],
      answer: '$x=\\pm\\pi/3+2\\pi n$ (equiv. form OK).',
    };
  }
  return pickOne([
    {
      prompt: 'Find all solutions of $\\cos x=0$.',
      steps: ['Odd multiples of $\\pi/2$.'],
      answer: '$x=(2n+1)\\pi/2$.',
    },
    {
      prompt: 'Find all solutions of $\\tan x=1$.',
      steps: [
        'On $(-\\pi/2,\\pi/2)$: $x=\\pi/4$; period $\\pi$.',
        'General: $x=\\pi/4+\\pi n=(4n+1)\\pi/4$.',
      ],
      answer: '$x=(4n+1)\\pi/4$.',
    },
    {
      prompt: 'Find all solutions of $\\sin x=1/2$ in $[0,2\\pi]$.',
      steps: ['$x=\\pi/6$ and $x=5\\pi/6$.'],
      answer: '$\\pi/6,\\,5\\pi/6$ (plus $2\\pi n$ for the general solution).',
    },
  ]);
}

/** Higher derivatives and implicit differentiation. */
export function genHigherImplicit({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'If $y=x\\sin x$, find $y\'\'\'$.',
      steps: [
        "$y'=x\\cos x+\\sin x$.",
        "$y''=-x\\sin x+2\\cos x$.",
        "$y'''=-x\\cos x-3\\sin x$.",
      ],
      answer: "$y'''=-x\\cos x-3\\sin x$.",
    };
  }
  return pickOne([
    {
      prompt: 'If $y=\\sin(x+y)$, solve for $y\'$.',
      steps: [
        "$y'=\\cos(x+y)(1+y')$.",
        "$y'(1-\\cos(x+y))=\\cos(x+y)$.",
      ],
      answer: "$y'=\\dfrac{\\cos(x+y)}{1-\\cos(x+y)}$.",
    },
    {
      prompt: 'If $\\sin y+\\cos x=1$, find $y\'$ (first derivative).',
      steps: ['$\\cos y\\,y\'-\\sin x=0$ ⇒ $y\'=\\sin x/\\cos y$.'],
      answer: "$y'=\\dfrac{\\sin x}{\\cos y}$.",
    },
    {
      prompt: 'If $\\tan y=x^{2}$, find $y\'$.',
      steps: ['$\\sec^{2} y\\,y\'=2x$ ⇒ $y\'=2x\\cos^{2} y$.'],
      answer: "$y'=2x\\cos^{2} y$.",
    },
    {
      prompt: 'If $y=\\tan^{2}(3x-2)$, find $y\'$ (first derivative only).',
      steps: [
        "$y'=2\\tan(3x-2)\\sec^{2}(3x-2)\\cdot 3=6\\tan(3x-2)\\sec^{2}(3x-2)$.",
      ],
      answer: "$y'=6\\tan(3x-2)\\sec^{2}(3x-2)$.",
    },
  ]);
}

/** Absolute extrema / sketch critical-point tables. */
export function genAbsExtremaTrig({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Absolute extrema of $f(x)=\\sin x+x$ on $[0,2\\pi]$.',
      steps: [
        "$f'=\\cos x+1=0$ ⇒ $\\cos x=-1$ ⇒ $x=\\pi$.",
        'Values: $f(0)=0$, $f(\\pi)=\\pi$, $f(2\\pi)=2\\pi$.',
      ],
      answer: 'Abs max $2\\pi$ at $2\\pi$; abs min $0$ at $0$.',
    };
  }
  return pickOne([
    {
      prompt:
        'Critical numbers of $f(x)=\\sin x+\\cos x$ on $[0,2\\pi]$ and classification.',
      steps: [
        '$\\tan x=1$ ⇒ $\\pi/4$ (max $\\sqrt{2}$), $5\\pi/4$ (min $-\\sqrt{2}$).',
      ],
      answer: 'Max $(\\pi/4,\\sqrt{2})$; min $(5\\pi/4,-\\sqrt{2})$.',
    },
    {
      prompt:
        'Critical numbers of $f(x)=\\cos x-\\cos^{2}x$ in $[0,\\pi]$.',
      steps: [
        "$f'=\\sin x(2\\cos x-1)=0$ ⇒ $x=0,\\pi/3,\\pi$.",
        'Classify with $f\'\'$: min at $0$ and $\\pi$; max at $\\pi/3$.',
      ],
      answer: 'Crit $0,\\pi/3,\\pi$ (max at $\\pi/3$).',
    },
  ]);
}

/** Angle between curves — numeric tan φ. */
export function genAngleNumeric({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Angle between $y=x+1$ ($m_1=1$) and $y=-3x+5$ ($m_2=-3$): find $\\tan(\\alpha_2-\\alpha_1)$.',
      steps: [
        '$\\tan(\\alpha_2-\\alpha_1)=\\dfrac{m_2-m_1}{1+m_1 m_2}=\\dfrac{-4}{-2}=2$.',
      ],
      answer: '$\\tan=2$ ($\\approx 63.4^{\\circ}$).',
    };
  }
  return pickOne([
    {
      prompt:
        'At $(1,1)$, curves $y=x^{2}$ and $x=y^{2}$ (so $y=\\sqrt{x}$ near $1$): find $\\tan\\alpha$.',
      steps: [
        'Slopes $2$ and $1/2$; $\\tan\\alpha=|(2-1/2)/(1+2\\cdot 1/2)|=3/4$.',
      ],
      answer: '$\\tan\\alpha=3/4$ ($\\approx 36.9^{\\circ}$).',
    },
    {
      prompt: 'Slopes $m_1=1$, $m_2=0$: acute intersection angle?',
      steps: ['$\\tan\\phi=1$ ⇒ $\\phi=\\pi/4$.'],
      answer: '$\\pi/4$.',
    },
  ]);
}

/** Related rates with trig. */
export function genRelatedRatesTrig({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Pilot at height 2 mi, $dx/dt=-240$ mi/h, $x=2\\cot\\theta$. Find $d\\theta/dt$ at $\\theta=30^{\\circ}$.',
      steps: [
        '$dx/dt=-2\\csc^{2}\\theta\\,d\\theta/dt$.',
        '$-240=-2\\cdot 4\\,d\\theta/dt$ ⇒ $d\\theta/dt=30$ rad/h.',
      ],
      answer: '$30$ rad/h.',
    };
  }
  return {
    prompt:
      'A $50$ ft pole; sun elevation $\\theta=45^{\\circ}$ with $d\\theta/dt=-1/4$ rad/h. Shadow length $s=50\\cot\\theta$. How fast is the shadow lengthening?',
    steps: [
      '$ds/dt=-50\\csc^{2}\\theta\\,d\\theta/dt$.',
      'At $45^{\\circ}$, $\\csc=\\sqrt{2}$, so $-50\\cdot 2\\cdot(-1/4)=25$ ft/h.',
    ],
    answer: '$25$ ft/h.',
  };
}

/** Diff book problem 6 / 25 style nested chain. */
export function genDiffTrigNested({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Differentiate: (a) $2\\cos 7x$ (b) $\\sin^{3}(2x)$ (c) $\\tan(5x)$ (d) $\\sec(1/x)$.',
      steps: [
        '(a) $-14\\sin 7x$.',
        '(b) $6\\sin^{2}(2x)\\cos(2x)$.',
        '(c) $5\\sec^{2}(5x)$.',
        '(d) $-(1/x^{2})\\tan(1/x)\\sec(1/x)$.',
      ],
      answer: 'See steps.',
    };
  }
  return pickOne([
    {
      prompt: 'Differentiate $y=\\sin 3x+\\cos 2x$.',
      steps: ["$y'=3\\cos 3x-2\\sin 2x$."],
      answer: "$y'=3\\cos 3x-2\\sin 2x$.",
    },
    {
      prompt: 'Differentiate $y=\\tan(x^{2})$.',
      steps: ["$y'=2x\\sec^{2}(x^{2})$."],
      answer: "$y'=2x\\sec^{2}(x^{2})$.",
    },
    {
      prompt: 'Differentiate $y=\\cot(1-2x^{2})$.',
      steps: [
        "$y'=-\\csc^{2}(1-2x^{2})\\cdot(-4x)=4x\\csc^{2}(1-2x^{2})$.",
      ],
      answer: "$y'=4x\\csc^{2}(1-2x^{2})$.",
    },
    {
      prompt: 'Differentiate $y=x^{2}\\sin x$.',
      steps: ["$y'=x^{2}\\cos x+2x\\sin x$."],
      answer: "$y'=x^{2}\\cos x+2x\\sin x$.",
    },
  ]);
}

/** Mixed supplementary set (expanded). */
export function genSuppTrigDiffMixed({requireNiceAnswer} = {}) {
  const gens = [
    genDiffTrigBasic,
    genEvalTrigDeriv,
    genAmpPeriod,
    genDiffTrigMixed,
    genAngleCurves,
    genTrigExtrema,
    genTrigLimits,
    genTrigEquations,
    genHigherImplicit,
    genAbsExtremaTrig,
    genAngleNumeric,
    genRelatedRatesTrig,
    genDiffTrigNested,
  ];
  return pickOne(gens)({requireNiceAnswer});
}

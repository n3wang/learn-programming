import {randInt, pickOne} from './mathRandom';

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

/** Prob 1: degrees → radians. */
export function genDegToRad({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'Convert to radians: (a) $54^{\\circ}$ (b) $120^{\\circ}$.',
      steps: [
        '$54^{\\circ}=54\\cdot\\pi/180=3\\pi/10$.',
        '$120^{\\circ}=120\\cdot\\pi/180=2\\pi/3$.',
      ],
      answer: '(a) $3\\pi/10$; (b) $2\\pi/3$.',
    };
  }
  const deg = pickOne([15, 18, 36, 45, 75, 90, 135, 150]);
  return {
    prompt: `Convert $${deg}^{\\circ}$ to radians (exact multiple of $\\pi$ when possible).`,
    steps: [`Multiply by $\\pi/180$: $${deg}\\cdot\\pi/180=${fmtFrac(deg, 180)}\\pi$.`],
    answer: `$${fmtFrac(deg, 180)}\\pi$ radians.`,
  };
}

/** Prob 2: radians → degrees. */
export function genRadToDeg({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'Convert to degrees: (a) $2\\pi/5$ (b) $5\\pi/6$ (c) $2$ radians.',
      steps: [
        '$2\\pi/5\\cdot 180/\\pi=72^{\\circ}$.',
        '$5\\pi/6\\cdot 180/\\pi=150^{\\circ}$.',
        '$2\\cdot 180/\\pi=(360/\\pi)^{\\circ}$.',
      ],
      answer: '(a) $72^{\\circ}$; (b) $150^{\\circ}$; (c) $(360/\\pi)^{\\circ}$.',
    };
  }
  const k = pickOne([1, 2, 3, 5]);
  const n = pickOne([2, 3, 4, 6, 12]);
  return {
    prompt: `Convert $\\dfrac{${k}\\pi}{${n}}$ radians to degrees.`,
    steps: [`Multiply by $180/\\pi$: $${k}\\cdot 180/${n}=${(k * 180) / n}^{\\circ}$.`],
    answer: `$${(k * 180) / n}^{\\circ}$.`,
  };
}

/** Prob 3: arc length s = rθ. */
export function genArcLength({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: '(a) $r=3$, $\\theta=\\pi/6$: find $s$. (b) $r=4$, $s=8$: find $\\theta$.',
      steps: ['$s=r\\theta=3\\cdot\\pi/6=\\pi/2$.', '$\\theta=s/r=8/4=2$ radians.'],
      answer: '(a) $\\pi/2$; (b) $2$ rad.',
    };
  }
  const r = pickOne([2, 3, 5, 6]);
  const thNum = pickOne([1, 2, 3]);
  const thDen = pickOne([3, 4, 6]);
  return {
    prompt: `Arc length on radius $${r}$ with central angle $${fmtFrac(thNum, thDen)}\\pi$ radians.`,
    steps: [`$s=r\\theta=${r}\\cdot ${fmtFrac(thNum, thDen)}\\pi=${fmtFrac(r * thNum, thDen)}\\pi$.`],
    answer: `$s=${fmtFrac(r * thNum, thDen)}\\pi$.`,
  };
}

/** Prob 4: equivalent angle in [0, 2π). */
export function genEquivalentAngle({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Reduce $\\dfrac{11\\pi}{4}$ to an equivalent angle in $[0,2\\pi)$.',
      steps: ['$11\\pi/4=2\\pi+3\\pi/4$.'],
      answer: '$3\\pi/4$.',
    },
    {
      prompt: 'Reduce $405^{\\circ}$ to an equivalent angle in $[0^{\\circ},360^{\\circ})$.',
      steps: ['$405=360+45$.'],
      answer: '$45^{\\circ}$.',
    },
    {
      prompt: 'Reduce $-\\pi/3$ to an equivalent angle in $[0,2\\pi)$.',
      steps: ['$-\\pi/3+2\\pi=5\\pi/3$.'],
      answer: '$5\\pi/3$.',
    },
    {
      prompt: 'Reduce $-5\\pi$ to an equivalent angle in $[0,2\\pi)$.',
      steps: ['$-5\\pi+6\\pi=\\pi$.'],
      answer: '$\\pi$.',
    },
  ];
  return pickOne(items);
}

/** Prob 5 / 18–19: Pythagorean / double / half from known side. */
export function genPythagFromCos({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) {
    return {
      prompt: 'Acute $\\theta$ with $\\cos\\theta=4/5$. Find $\\sin\\theta$.',
      steps: ['$\\sin^{2}=1-16/25=9/25$; acute ⇒ $\\sin\\theta=3/5$.'],
      answer: '$\\sin\\theta=3/5$.',
    };
  }
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Acute $\\theta$ with $\\sin\\theta=1/4$. Find $\\cos\\theta$, $\\sin 2\\theta$, $\\cos 2\\theta$.',
      steps: [
        '$\\cos\\theta=\\sqrt{15}/4$.',
        '$\\sin 2\\theta=2\\sin\\cos=\\sqrt{15}/8$; $\\cos 2\\theta=1-2\\sin^{2}=7/8$.',
      ],
      answer: '$\\cos=\\sqrt{15}/4$; $\\sin 2\\theta=\\sqrt{15}/8$; $\\cos 2\\theta=7/8$.',
    };
  }
  return {
    prompt: 'Third-quadrant $\\theta$ with $\\cos\\theta=-4/5$. Find $\\sin\\theta$ and $\\cos 2\\theta$.',
    steps: [
      '$\\sin\\theta=-3/5$ (III).',
      '$\\cos 2\\theta=2\\cos^{2}-1=2\\cdot 16/25-1=7/25$.',
    ],
    answer: '$\\sin\\theta=-3/5$; $\\cos 2\\theta=7/25$.',
  };
}

/** Prob 6: sin(π−θ), cos(π−θ). */
export function genPiMinusIdentities({requireNiceAnswer} = {}) {
  return {
    prompt: 'Show $\\sin(\\pi-\\theta)=\\sin\\theta$ and $\\cos(\\pi-\\theta)=-\\cos\\theta$.',
    steps: [
      '$\\sin(\\pi-\\theta)=\\sin\\pi\\cos\\theta-\\cos\\pi\\sin\\theta=\\sin\\theta$.',
      '$\\cos(\\pi-\\theta)=\\cos\\pi\\cos\\theta+\\sin\\pi\\sin\\theta=-\\cos\\theta$.',
    ],
    answer: 'Follows from addition formulas with $\\sin\\pi=0$, $\\cos\\pi=-1$.',
  };
}

/** Prob 7 / 17: evaluate special angles. */
export function genEvalSpecial({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Evaluate $\\sin(2\\pi/3)$ and $\\cos(3\\pi/4)$.',
      steps: [
        '$\\sin(2\\pi/3)=\\sin(\\pi-\\pi/3)=\\sin(\\pi/3)=\\sqrt{3}/2$.',
        '$\\cos(3\\pi/4)=-\\cos(\\pi/4)=-\\sqrt{2}/2$.',
      ],
      answer: '$\\sqrt{3}/2$ and $-\\sqrt{2}/2$.',
    },
    {
      prompt: 'Evaluate $\\cos(\\pi/12)$ using $\\cos(u-v)$.',
      steps: [
        '$\\pi/12=\\pi/3-\\pi/4$.',
        '$\\cos=\\tfrac12\\cdot\\tfrac{\\sqrt{2}}{2}+\\tfrac{\\sqrt{3}}{2}\\cdot\\tfrac{\\sqrt{2}}{2}=(\\sqrt{6}+\\sqrt{2})/4$.',
      ],
      answer: '$(\\sqrt{6}+\\sqrt{2})/4$.',
    },
    {
      prompt: 'Evaluate $\\sin(\\pi/8)$ (positive root).',
      steps: [
        '$\\sin^{2}(\\pi/8)=(1-\\cos(\\pi/4))/2=(2-\\sqrt{2})/4$.',
        '$\\sin(\\pi/8)=\\sqrt{2-\\sqrt{2}}/2$.',
      ],
      answer: '$\\sqrt{2-\\sqrt{2}}/2$.',
    },
    {
      prompt: 'Evaluate $\\sin(7\\pi/3)$ and $\\cos 9\\pi$.',
      steps: [
        '$\\sin(7\\pi/3)=\\sin(\\pi/3)=\\sqrt{3}/2$.',
        '$\\cos 9\\pi=\\cos\\pi=-1$.',
      ],
      answer: '$\\sqrt{3}/2$ and $-1$.',
    },
  ];
  return pickOne(items);
}

/** Prob 9–10: polar ↔ rectangular. */
export function genPolarRect({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Rectangular coords of polar $(r,\\theta)=(3,\\pi/6)$.',
      steps: [
        '$x=3\\cos(\\pi/6)=3\\sqrt{3}/2$.',
        '$y=3\\sin(\\pi/6)=3/2$.',
      ],
      answer: '$\\bigl(3\\sqrt{3}/2,\\,3/2\\bigr)$.',
    };
  }
  return {
    prompt: 'Polar coords of $(1,\\sqrt{3})$ (with $r>0$, $\\theta\\in[0,2\\pi)$).',
    steps: [
      '$r=\\sqrt{1+3}=2$.',
      '$\\cos\\theta=1/2$, $\\sin\\theta=\\sqrt{3}/2$ ⇒ $\\theta=\\pi/3$.',
    ],
    answer: '$(r,\\theta)=(2,\\pi/3)$.',
  };
}

/** Prob 20: law of cosines numeric. */
export function genLawCosinesApp({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'In $\\triangle ABC$, $AB=5$, $AC=7$, $\\cos(\\angle ABC)=3/5$. Find $BC$.',
      steps: [
        'Law of cosines at $B$: $AC^{2}=AB^{2}+BC^{2}-2\\cdot AB\\cdot BC\\cdot\\cos B$ — or label carefully.',
        'Book setup: side opposite $A$ etc. With given numbers: $BC=4\\sqrt{2}$.',
        'Using $c^{2}=a^{2}+b^{2}-2ab\\cos C$ with the matching included angle yields $4\\sqrt{2}$.',
      ],
      answer: '$BC=4\\sqrt{2}$.',
    };
  }
  const a = pickOne([3, 4, 5]);
  const b = pickOne([5, 6, 7]);
  return {
    prompt: `Sides $a=${a}$, $b=${b}$ include angle $\\theta$ with $\\cos\\theta=1/2$. Find the opposite side $c$.`,
    steps: [
      `$c^{2}=a^{2}+b^{2}-2ab\\cos\\theta=${a * a}+${b * b}-2\\cdot${a}\\cdot${b}\\cdot\\tfrac12$.`,
      `Simplify and take the positive square root.`,
    ],
    answer: `$c=\\sqrt{${a * a + b * b - a * b}}$.`,
  };
}

/** Prob 21: prove tan identity. */
export function genProveTanIdentity({requireNiceAnswer} = {}) {
  return {
    prompt: 'Prove $\\dfrac{\\sin\\theta}{\\cos\\theta}=\\dfrac{1-\\cos 2\\theta}{\\sin 2\\theta}$.',
    steps: [
      'RHS: $(1-(1-2\\sin^{2}\\theta))/(2\\sin\\theta\\cos\\theta)=2\\sin^{2}\\theta/(2\\sin\\theta\\cos\\theta)=\\sin\\theta/\\cos\\theta$.',
      'Or use $1-\\cos 2\\theta=2\\sin^{2}\\theta$ and $\\sin 2\\theta=2\\sin\\theta\\cos\\theta$.',
    ],
    answer: 'Both sides equal $\\tan\\theta$ (where defined).',
  };
}

export function genTrigPracticeMixed(opts) {
  return pickOne([
    genDegToRad,
    genRadToDeg,
    genArcLength,
    genEquivalentAngle,
    genPythagFromCos,
    genPiMinusIdentities,
    genEvalSpecial,
    genPolarRect,
    genLawCosinesApp,
  ])(opts);
}

/** Supp 13–16 style converters / reductions. */
export function genSuppConvertReduce({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'To degrees: (a) $4$ rad (b) $\\pi/10$ (c) $11\\pi/12$.',
      steps: ['$(720/\\pi)^{\\circ}$; $18^{\\circ}$; $165^{\\circ}$.'],
      answer: '(a) $(720/\\pi)^{\\circ}$; (b) $18^{\\circ}$; (c) $165^{\\circ}$.',
    },
    {
      prompt: 'To radians: (a) $9^{\\circ}$ (b) $75^{\\circ}$ (c) $(90/\\pi)^{\\circ}$.',
      steps: ['$\\pi/20$; $5\\pi/12$; $1/2$.'],
      answer: '(a) $\\pi/20$; (b) $5\\pi/12$; (c) $1/2$.',
    },
    {
      prompt: '(a) $r=7$, $\\theta=\\pi/14$: find $s$. (b) $\\theta=30^{\\circ}$, $s=2$: find $r$.',
      steps: ['$s=\\pi/2$.', 'Convert $30^{\\circ}=\\pi/6$; $r=s/\\theta=2/(\\pi/6)=12/\\pi$.'],
      answer: '(a) $\\pi/2$; (b) $12/\\pi$.',
    },
    {
      prompt: 'Reduce to $[0,2\\pi)$ or $[0^{\\circ},360^{\\circ})$: $17\\pi/4$; $375^{\\circ}$; $-\\pi/3$; $-7\\pi/2$.',
      steps: ['$\\pi/4$; $15^{\\circ}$; $5\\pi/3$; $\\pi/2$.'],
      answer: '$\\pi/4$, $15^{\\circ}$, $5\\pi/3$, $\\pi/2$.',
    },
  ];
  return pickOne(items);
}

export function genSuppTrigMixed(opts) {
  return pickOne([
    genSuppConvertReduce,
    genEvalSpecial,
    genPythagFromCos,
    genLawCosinesApp,
    genProveTanIdentity,
    genPolarRect,
    genDegToRad,
    genRadToDeg,
  ])(opts);
}

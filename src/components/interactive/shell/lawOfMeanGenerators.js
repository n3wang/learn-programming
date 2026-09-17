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

function fmtLin(p, q) {
  if (q === 0) return `${p}x`;
  if (q > 0) return `${p}x+${q}`;
  return `${p}x${q}`;
}

function polyQuad(c, d, e) {
  const parts = [];
  if (c !== 0) parts.push(c === 1 ? 'x^{2}' : c === -1 ? '-x^{2}' : `${c}x^{2}`);
  if (d !== 0) {
    const term = Math.abs(d) === 1 ? 'x' : `${Math.abs(d)}x`;
    if (d > 0) parts.push(parts.length ? `+${term}` : term);
    else parts.push(`-${term}`);
  }
  if (e !== 0) {
    if (e > 0) parts.push(parts.length ? `+${e}` : `${e}`);
    else parts.push(`${e}`);
  }
  return parts.join('') || '0';
}

/** Book: f(x)=x³−12x on [0, 2√3], x₀=2. Family: x³−3a²x on [0, a√3]. */
export function genRolleCubicBook() {
  return {
    prompt:
      'Find the value of $x_0$ prescribed by Rolle’s Theorem for $f(x)=x^{3}-12x$ on $[0,\\,2\\sqrt{3}]$. Note $f(0)=f(2\\sqrt{3})=0$.',
    steps: [
      'Compute $f\'(x)=3x^{2}-12$.',
      'Set $f\'(x)=0$: $3x^{2}=12\\Rightarrow x=\\pm 2$.',
      'Only $x=2$ lies in $(0,\\,2\\sqrt{3})$.',
    ],
    answer: 'Therefore $x_0=2$.',
  };
}

export function genRolleCubic({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) return genRolleCubicBook();
  const a = pickOne([1, 2, 3, 4]);
  const coeff = 3 * a * a;
  return {
    prompt: `Find $x_0$ from Rolle’s Theorem for $f(x)=x^{3}-${coeff}x$ on $[0,\\,${a}\\sqrt{3}]$. (Check the endpoints are zeros first.)`,
    steps: [
      `$f(0)=0$ and $f(${a}\\sqrt{3})=(${a}\\sqrt{3})^{3}-${coeff}(${a}\\sqrt{3})=0$.`,
      `$f\'(x)=3x^{2}-${coeff}=3(x^{2}-${a * a})$.`,
      `$f\'(x)=0\\Rightarrow x=\\pm ${a}$. In $(0,\\,${a}\\sqrt{3})$ we take $x_0=${a}$.`,
    ],
    answer: `$x_0=${a}$.`,
  };
}

export function genRolleAppliesBook() {
  return {
    prompt:
      'Does Rolle’s Theorem apply on $[0,4]$ to (a) $f(x)=\\dfrac{x^{2}-4x}{x-2}$ and (b) $f(x)=\\dfrac{x^{2}-4x}{x+2}$?',
    steps: [
      '(a) $f(0)=f(4)=0$, but $f$ is discontinuous at $x=2\\in[0,4]$, so Rolle does **not** apply.',
      '(b) Endpoints are zeros; the only discontinuity is at $x=-2\\notin[0,4]$.',
      'Also $f\'(x)=\\dfrac{x^{2}+4x-8}{(x+2)^{2}}$ exists on $(0,4)$. Rolle applies.',
      'Solve $x^{2}+4x-8=0$: $x=-2\\pm 2\\sqrt{3}$; the root in $(0,4)$ is $x_0=2(\\sqrt{3}-1)$.',
    ],
    answer: '(a) Does not apply. (b) Applies, with $x_0=2(\\sqrt{3}-1)$.',
  };
}

export function genRolleApplies({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) return genRolleAppliesBook();
  const kind = pickOne(['inside', 'outside']);
  const a = 0;
  const b = pickOne([4, 6, 8]);
  if (kind === 'inside') {
    const pole = b / 2;
    return {
      prompt: `Does Rolle’s Theorem apply to $f(x)=\\dfrac{x(x-${b})}{x-${pole}}$ on $[${a},${b}]$? If not, say why.`,
      steps: [
        `$f(${a})=f(${b})=0$, but $f$ has a discontinuity at $x=${pole}$ inside $[${a},${b}]$.`,
        'Continuity on the closed interval fails, so Rolle’s Theorem does **not** apply.',
      ],
      answer: 'Does not apply (discontinuity inside the interval).',
    };
  }
  const pole = -pickOne([1, 2, 3]);
  return {
    prompt: `Does Rolle’s Theorem apply to $f(x)=\\dfrac{x(x-${b})}{x-(${pole})}$ on $[${a},${b}]$?`,
    steps: [
      `$f(${a})=f(${b})=0$. The pole $x=${pole}$ is **outside** $[${a},${b}]$.`,
      `On $[${a},${b}]$ the function is continuous, and differentiable on $(${a},${b})$.`,
      'So Rolle’s Theorem applies.',
    ],
    answer: 'Yes — Rolle’s Theorem applies.',
  };
}

export function genMvtQuadraticBook() {
  return {
    prompt:
      'Find $x_0$ from the Law of the Mean for $f(x)=3x^{2}+4x-3$ with $a=1$, $b=3$.',
    steps: [
      '$f(1)=4$, $f(3)=36$, so $\\dfrac{f(3)-f(1)}{3-1}=16$.',
      '$f\'(x)=6x+4$. Set $6x_0+4=16\\Rightarrow 6x_0=12\\Rightarrow x_0=2$.',
    ],
    answer: '$x_0=2$.',
  };
}

export function genMvtQuadratic({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) return genMvtQuadraticBook();
  const c = pickOne([1, 2, 3, 4]);
  const d = pickOne([-4, -2, 0, 2, 4, 5]);
  const e = pickOne([-5, -3, -1, 0, 1, 2]);
  const a = randInt(-2, 2);
  const b = a + pickOne([2, 3, 4]);
  const x0 = (a + b) / 2;
  const fa = c * a * a + d * a + e;
  const fb = c * b * b + d * b + e;
  const sec = (fb - fa) / (b - a);
  return {
    prompt: `Find $x_0$ from the Law of the Mean for $f(x)=${polyQuad(c, d, e)}$ on $[${a},${b}]$.`,
    steps: [
      `$f(${a})=${fa}$, $f(${b})=${fb}$, secant slope $=\\dfrac{${fb}-(${fa})}{${b}-${a}}=${sec}$.`,
      `$f\'(x)=${2 * c}x${d === 0 ? '' : d > 0 ? `+${d}` : `${d}`}$.`,
      `Solve ${2 * c}x_0${d === 0 ? '' : d > 0 ? `+${d}` : `${d}`}=${sec}$. For a quadratic, $x_0=\\dfrac{a+b}{2}$.`,
    ],
    answer: `$x_0=${x0}$.`,
  };
}

export function genExtendedMvtBook() {
  return {
    prompt:
      'Find $x_0$ from the extended Law of the Mean for $f(x)=3x+2$ and $g(x)=x^{2}+1$ on $[1,4]$.',
    steps: [
      '$\\dfrac{f(4)-f(1)}{g(4)-g(1)}=\\dfrac{14-5}{17-2}=\\dfrac{3}{5}$.',
      '$\\dfrac{f\'(x_0)}{g\'(x_0)}=\\dfrac{3}{2x_0}$.',
      'So $\\dfrac{3}{2x_0}=\\dfrac{3}{5}\\Rightarrow x_0=\\dfrac{5}{2}$.',
    ],
    answer: `$x_0=\\dfrac{5}{2}$.`,
  };
}

export function genExtendedMvt({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) return genExtendedMvtBook();
  const p = pickOne([2, 3, 4, 5]);
  const q = pickOne([-2, -1, 0, 1, 2]);
  const r = pickOne([0, 1, 2]);
  const a = pickOne([1, 2]);
  const b = a + pickOne([2, 3]);
  const fa = p * a + q;
  const fb = p * b + q;
  const ga = a * a + r;
  const gb = b * b + r;
  const leftNum = fb - fa;
  const leftDen = gb - ga;
  const g = gcd(leftNum, leftDen);
  const gExpr = r === 0 ? 'x^{2}' : `x^{2}+${r}`;
  return {
    prompt: `Find $x_0$ from the extended Law of the Mean for $f(x)=${fmtLin(p, q)}$ and $g(x)=${gExpr}$ on $[${a},${b}]$.`,
    steps: [
      `$\\dfrac{f(${b})-f(${a})}{g(${b})-g(${a})}=\\dfrac{${fb}-(${fa})}{${gb}-${ga}}=\\dfrac{${leftNum / g}}{${leftDen / g}}$.`,
      `$\\dfrac{f\'}{g\'}=\\dfrac{${p}}{2x_0}$.`,
      `Equate and solve: $x_0=${fmtFrac(a + b, 2)}$.`,
    ],
    answer: `$x_0=${fmtFrac(a + b, 2)}$.`,
  };
}

export function genShowIncreasing({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) {
    return {
      prompt: 'Show that $f(x)=x^{5}+20x-6$ is increasing for all real $x$.',
      steps: [
        '$f\'(x)=5x^{4}+20\\ge 20>0$ for all $x$.',
        'Theorem 13.7(a) $\\Rightarrow$ $f$ is increasing on $\\mathbb{R}$.',
      ],
      answer: '$f$ is increasing everywhere.',
    };
  }
  const odd = pickOne([3, 5, 7]);
  const c = pickOne([6, 10, 12, 16, 20]);
  return {
    prompt: `Show that $f(x)=x^{${odd}}+${c}x$ is increasing for all real $x$.`,
    steps: [
      `$f\'(x)=${odd}x^{${odd - 1}}+${c}$.`,
      `Since ${odd - 1} is even, $x^{${odd - 1}}\\ge 0$, so $f\'(x)\\ge ${c}>0$.`,
      'Theorem 13.7(a) $\\Rightarrow$ $f$ increasing on $\\mathbb{R}$.',
    ],
    answer: '$f$ is increasing everywhere.',
  };
}

export function genShowDecreasing({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) {
    return {
      prompt: 'Show that $f(x)=1-x^{3}-x^{7}$ is decreasing for all real $x$.',
      steps: [
        '$f\'(x)=-3x^{2}-7x^{6}\\le 0$, and $<0$ for $x\\ne 0$.',
        'On intervals not containing $0$, Theorem 13.7(b) gives decreasing.',
        'Across $0$: if $x<0$ then $f(x)>1=f(0)$; if $x>0$ then $f(0)>f(x)$.',
      ],
      answer: '$f$ is decreasing on $\\mathbb{R}$.',
    };
  }
  const odd = pickOne([3, 5]);
  const c = odd + 2;
  return {
    prompt: `Show that $f(x)=-x^{${odd}}-${c}x$ is decreasing for all real $x$.`,
    steps: [
      `$f\'(x)=-${odd}x^{${odd - 1}}-${c}$.`,
      `Even power $x^{${odd - 1}}\\ge 0\\Rightarrow f\'(x)\\le -${c}<0$.`,
      'Theorem 13.7(b) $\\Rightarrow$ decreasing on $\\mathbb{R}$.',
    ],
    answer: '$f$ is decreasing everywhere.',
  };
}

export function genUniqueRoot({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'Show that $f(x)=4x^{3}+x-3=0$ has exactly one real solution.',
      steps: [
        '$f(0)=-3<0$ and $f(1)=2>0$, so IVT gives a root in $(0,1)$.',
        '$f\'(x)=12x^{2}+1>0$ for all $x$, so $f$ is strictly increasing.',
        'A strictly increasing continuous function crosses zero at most once.',
      ],
      answer: 'Exactly one real root (in $(0,1)$).',
    };
  }
  const p = pickOne([2, 3, 4]);
  const r = -pickOne([2, 3, 4, 5]);
  const f1 = p + 1 + r;
  if (f1 <= 0) return genUniqueRoot({requireNiceAnswer: true});
  return {
    prompt: `Show that $f(x)=${p}x^{3}+x${r}=0$ has exactly one real root.`,
    steps: [
      `$f(0)=${r}<0$, $f(1)=${f1}>0$ $\\Rightarrow$ a root in $(0,1)$ by IVT.`,
      `$f\'(x)=${3 * p}x^{2}+1>0$ $\\Rightarrow$ $f$ strictly increasing $\\Rightarrow$ at most one root.`,
    ],
    answer: 'Exactly one real root.',
  };
}

export function genLawOfMeanMixed(opts) {
  return pickOne([
    genRolleCubic,
    genRolleApplies,
    genMvtQuadratic,
    genExtendedMvt,
    genShowIncreasing,
    genShowDecreasing,
    genUniqueRoot,
  ])(opts);
}

/** Supplementary: Rolle on a quadratic (book: x²−4x+3 on [1,3] → x₀=2). */
export function genSuppRolleQuadratic({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'If $f(x)=x^{2}-4x+3$ on $[1,3]$, find a value prescribed by Rolle’s Theorem.',
      steps: [
        '$f(1)=0=f(3)$.',
        '$f\'(x)=2x-4=0\\Rightarrow x=2\\in(1,3)$.',
      ],
      answer: '$x_0=2$.',
    };
  }
  const r = pickOne([1, 2, 3]);
  const s = r + pickOne([2, 3, 4]);
  // f=(x-r)(x-s)=x²-(r+s)x+rs on [r,s]
  const sum = r + s;
  const prod = r * s;
  const x0 = (r + s) / 2;
  return {
    prompt: `If $f(x)=x^{2}-${sum}x+${prod}$ on $[${r},${s}]$, find $x_0$ from Rolle’s Theorem.`,
    steps: [
      `$f(${r})=f(${s})=0$.`,
      `$f\'(x)=2x-${sum}=0\\Rightarrow x_0=${x0}$.`,
    ],
    answer: `$x_0=${x0}$.`,
  };
}

/** Supplementary MVT: y=x³ on [0,b] → x₀=b/√3; or general quadratic midpoint. */
export function genSuppMvt({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Find a value prescribed by the Law of the Mean for $y=x^{3}$ on $[0,6]$.',
      steps: [
        'Secant: $\\dfrac{6^{3}-0}{6-0}=36$.',
        '$y\'=3x^{2}$. Set $3x_0^{2}=36\\Rightarrow x_0^{2}=12\\Rightarrow x_0=2\\sqrt{3}$ (positive).',
      ],
      answer: '$x_0=2\\sqrt{3}$.',
    };
  }
  if (Math.random() < 0.5) {
    const b = pickOne([3, 6, 9, 12]);
    // secant = b², 3x²=b² ⇒ x=b/√3
    return {
      prompt: `Find $x_0$ from the Law of the Mean for $y=x^{3}$ on $[0,${b}]$.`,
      steps: [
        `Secant $=\\dfrac{${b}^{3}}{${b}}=${b * b}$.`,
        `$3x_0^{2}=${b * b}\\Rightarrow x_0=\\dfrac{${b}}{\\sqrt{3}}$ (in $(0,${b})$).`,
      ],
      answer: `$x_0=\\dfrac{${b}}{\\sqrt{3}}$.`,
    };
  }
  const x1 = randInt(-2, 3);
  const x2 = x1 + pickOne([2, 3, 4]);
  return {
    prompt: `For $y=ax^{2}+bx+c$ on $[x_1,x_2]=[${x1},${x2}]$, what $x_0$ does the Law of the Mean prescribe? (Answer in terms of the endpoints.)`,
    steps: [
      'Secant slope $=a(x_1+x_2)+b$.',
      '$y\'=2ax+b$. Solving $2ax_0+b=a(x_1+x_2)+b$ gives $x_0=\\dfrac{x_1+x_2}{2}$.',
    ],
    answer: `$x_0=\\dfrac{1}{2}(${x1}+${x2})=${(x1 + x2) / 2}$.`,
  };
}

/** Extended MVT book: f=x²+2x−3, g=x²−4x+6 on [0,1] → 1/2. */
export function genSuppExtendedMvt({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Find $x_0$ from the extended Law of the Mean for $f(x)=x^{2}+2x-3$, $g(x)=x^{2}-4x+6$ on $[0,1]$.',
      steps: [
        '$\\dfrac{f(1)-f(0)}{g(1)-g(0)}=\\dfrac{(0)-(-3)}{(3)-(6)}=\\dfrac{3}{-3}=-1$.',
        '$\\dfrac{f\'}{g\'}=\\dfrac{2x+2}{2x-4}=\\dfrac{x+1}{x-2}$.',
        'Set $\\dfrac{x_0+1}{x_0-2}=-1\\Rightarrow x_0+1=-(x_0-2)\\Rightarrow 2x_0=1\\Rightarrow x_0=\\dfrac{1}{2}$.',
      ],
      answer: `$x_0=\\dfrac{1}{2}$.`,
    };
  }
  return genExtendedMvt({requireNiceAnswer});
}

/** Unique cubic root variants (supp 22). */
export function genSuppUniqueCubic({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Show that $f(x)=5x^{3}+11x-20=0$ has exactly one real solution.',
      steps: [
        '$f(1)=5+11-20=-4<0$, $f(2)=40+22-20=42>0$ $\\Rightarrow$ a root in $(1,2)$.',
        '$f\'(x)=15x^{2}+11>0$ $\\Rightarrow$ strictly increasing $\\Rightarrow$ unique real root.',
      ],
      answer: 'Exactly one real root.',
    };
  }
  return genUniqueRoot({requireNiceAnswer});
}

/** Rolle applicability checklist (supp 25). */
export function genSuppRolleChecklist({requireNiceAnswer} = {}) {
  const book = [
    {
      prompt:
        'Does Rolle apply to $f(x)=x^{3/4}-2$ on $[-3,3]$? If yes, find $x_0$; if no, say why.',
      steps: [
        '$f$ fails to be differentiable at $x=0$ (fractional power with $3/4<1$).',
        'Rolle’s hypotheses are not met.',
      ],
      answer: 'No — not differentiable at $x=0$.',
    },
    {
      prompt: 'Does Rolle apply to $f(x)=|x^{2}-4|$ on $[0,8]$?',
      steps: [
        'Corner / nondifferentiable at $x=2$ where $x^{2}-4=0$.',
        'Hypotheses fail.',
      ],
      answer: 'No — not differentiable at $x=2$.',
    },
    {
      prompt: 'Does Rolle apply to $f(x)=|x^{2}-4|$ on $[0,1]$?',
      steps: ['$f(0)=4$, $f(1)=3$, so $f(0)\\ne f(1)$.', 'Equal endpoint values fail.'],
      answer: 'No — $f(0)\\ne f(1)$.',
    },
    {
      prompt:
        'Does Rolle apply to $f(x)=\\dfrac{x^{2}-3x-4}{x-5}$ on $[-1,4]$? If yes, find $x_0$.',
      steps: [
        'Pole at $x=5$ is outside $[-1,4]$; $f(-1)=f(4)=0$.',
        'Simplify / differentiate: Rolle applies.',
        'Solving $f\'(x_0)=0$ yields $x_0=5-\\sqrt{6}$ (the root in $(-1,4)$).',
      ],
      answer: 'Yes — $x_0=5-\\sqrt{6}$.',
    },
  ];
  if (requireNiceAnswer && Math.random() < 0.55) return pickOne(book);
  if (Math.random() < 0.35) return genRolleApplies({requireNiceAnswer});
  return pickOne(book);
}

/** Mono intervals for common elementary functions (supp 23). */
export function genSuppMonoIntervals({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Where is $f(x)=3x+5$ increasing / decreasing?',
      steps: ['$f\'(x)=3>0$.'],
      answer: 'Increasing on $\\mathbb{R}$; never decreasing.',
    },
    {
      prompt: 'Where is $f(x)=-7x+20$ increasing / decreasing?',
      steps: ['$f\'(x)=-7<0$.'],
      answer: 'Decreasing on $\\mathbb{R}$; never increasing.',
    },
    {
      prompt: 'Where is $f(x)=x^{2}+6x-11$ increasing / decreasing?',
      steps: ['$f\'(x)=2x+6=2(x+3)$.', 'Sign chart: $f\'<0$ on $(-\\infty,-3)$, $f\'>0$ on $(-3,\\infty)$.'],
      answer: 'Decreasing on $(-\\infty,-3)$; increasing on $(-3,+\\infty)$.',
    },
    {
      prompt: 'Where is $f(x)=5+8x-x^{2}$ increasing / decreasing?',
      steps: ['$f\'(x)=8-2x=2(4-x)$.', 'Critical point $x=4$.'],
      answer: 'Increasing on $(-\\infty,4)$; decreasing on $(4,+\\infty)$.',
    },
    {
      prompt: 'Where is $f(x)=\\sqrt{4-x^{2}}$ increasing / decreasing? (Domain $[-2,2]$.)',
      steps: [
        '$f\'(x)=\\dfrac{-x}{\\sqrt{4-x^{2}}}$ for $x\\in(-2,2)$.',
        '$f\'>0$ on $(-2,0)$, $f\'<0$ on $(0,2)$.',
      ],
      answer: 'Increasing on $(-2,0)$; decreasing on $(0,2)$.',
    },
    {
      prompt: 'Where is $f(x)=|x-2|+3$ increasing / decreasing?',
      steps: [
        'For $x<2$, $f=2-x+3\\Rightarrow f\'=-1$.',
        'For $x>2$, $f=x-2+3\\Rightarrow f\'=1$. Corner at $x=2$.',
      ],
      answer: 'Decreasing on $(-\\infty,2)$; increasing on $(2,+\\infty)$.',
    },
    {
      prompt: 'Where is $f(x)=\\dfrac{x}{x^{2}-4}$ increasing / decreasing?',
      steps: [
        'Domain: $x\\ne\\pm 2$.',
        '$f\'(x)=\\dfrac{-(x^{2}+4)}{(x^{2}-4)^{2}}<0$ wherever defined.',
      ],
      answer: 'Decreasing on $(-\\infty,-2)$, $(-2,2)$, and $(2,+\\infty)$; never increasing.',
    },
  ];
  if (requireNiceAnswer) return pickOne(items.slice(0, 4));
  return pickOne(items);
}

export function genSuppMixed(opts) {
  return pickOne([
    genSuppRolleQuadratic,
    genSuppMvt,
    genSuppExtendedMvt,
    genSuppUniqueCubic,
    genSuppRolleChecklist,
    genSuppMonoIntervals,
  ])(opts);
}

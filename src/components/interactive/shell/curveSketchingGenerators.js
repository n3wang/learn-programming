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

/** Prob 1: factor y″, concavity intervals, inflection points. */
export function genConcavityInflection({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Examine $y=3x^{4}-10x^{3}-12x^{2}+12x-7$ for concavity and inflection. Given $y\'\'=12(3x+1)(x-2)$.',
      steps: [
        'Critical for $y\'\'$: $x=-1/3$ and $x=2$.',
        'Sign chart: $y\'\'>0$ on $(-\\infty,-1/3)$, $y\'\'<0$ on $(-1/3,2)$, $y\'\'>0$ on $(2,\\infty)$.',
        'Inflection at both (sign changes): $(-1/3,-322/27)$ and $(2,-63)$.',
      ],
      answer: 'Up / down / up; inflection at $x=-1/3$ and $x=2$.',
    };
  }
  const r = -pickOne([1, 2, 3]);
  const s = pickOne([1, 2, 3]);
  return {
    prompt: `Suppose $y''=c(x-(${r}))(x-(${s}))$ with $c>0$ and ${r}<${s}$. State concavity intervals and inflection $x$-values.`,
    steps: [
      `Roots $${r}$, $${s}$. Leading positive ⇒ $y''>0$ left of $${r}$, then alternates.`,
      `Concave up on $(-\\infty,${r})$ and $(${s},\\infty)$; down on $(${r},${s})$.`,
      `Inflection at $x=${r}$ and $x=${s}$ (sign changes).`,
    ],
    answer: `Inflection at $${r},\\,${s}$; up–down–up pattern.`,
  };
}

/** Prob 2: f″=0 but no inflection; absolute min. */
export function genNoInflectionMin({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'For $y=x^{4}-6x+2$: does $x=0$ give an inflection? Find the absolute minimum.',
      steps: [
        '$y\'\'=12x^{2}\\ge 0$; no sign change at $0$ ⇒ not an inflection.',
        "$y'=4x^{3}-6=0\\Rightarrow x=\\sqrt[3]{3/2}$; $y''>0$ ⇒ relative (hence absolute) min.",
        'Approx $(\\sqrt[3]{3/2},\\,y)\\approx(1.45,-3.15)$.',
      ],
      answer: 'No inflection at $0$; abs min at $x=\\sqrt[3]{3/2}$.',
    };
  }
  return {
    prompt: 'For $y=x^{4}+kx$ with $k\\neq 0$: explain why $x=0$ is not an inflection, and where the absolute min occurs.',
    steps: [
      '$y\'\'=12x^{2}\\ge 0$ — never changes sign.',
      "$y'=4x^{3}+k=0\\Rightarrow x=\\sqrt[3]{-k/4}$; unique critical number with $y''>0$ ⇒ abs min.",
    ],
    answer: 'No inflection at $0$; unique critical number is an absolute minimum.',
  };
}

/** Prob 3: fractional power — inflection where y″ undefined. */
export function genInflectionUndefined({requireNiceAnswer} = {}) {
  return {
    prompt:
      'Examine $y=3x+(x+2)^{3/5}$ for concavity and inflection. (Book: $y\'\'=-6/(25(x+2)^{7/5})$.)',
    steps: [
      '$y\'\'$ undefined at $x=-2$; sign: $y\'\'>0$ for $x<-2$, $y\'\'<0$ for $x>-2$.',
      'Inflection at $(-2,-6)$. Also $y\'>0$ off $-2$ ⇒ strictly increasing, no relative extrema.',
    ],
    answer: 'Inflection at $x=-2$; always increasing; down for $x>-2$, up for $x<-2$.',
  };
}

/** Prob 4: f″(x₀)=0 and f‴(x₀)≠0 ⇒ inflection. */
export function genThirdDerivInflectionTest({requireNiceAnswer} = {}) {
  return {
    prompt:
      'Prove: if $f\'\'(x_0)=0$ and $f\'\'\'(x_0)\\neq 0$, then $x_0$ is an inflection point.',
    steps: [
      '$f\'\'\'(x_0)\\neq 0$ ⇒ $f\'\'$ is strictly mono at $x_0$ (Thm 13.7 on $f\'\'$).',
      'With $f\'\'(x_0)=0$, $f\'\'$ has opposite signs on the two sides.',
      'Opposite concavity ⇒ inflection at $x_0$.',
    ],
    answer: 'Sign change of $f\'\'$ forced by nonzero $f\'\'\'$ at a zero of $f\'\'$.',
  };
}

/** Prob 5: tangents at inflection points. */
export function genInflectionTangents({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'For $f(x)=x^{4}-6x^{3}+12x^{2}-8x$, find tangent lines at inflection points (use $f\'\'\'\\neq 0$ test).',
      steps: [
        "$f''=12(x-1)(x-2)$; $f'''=12(2x-3)\\neq 0$ at $1$ and $2$.",
        'Points $(1,-1)$, $(2,0)$.',
        "$f'(1)=2\\Rightarrow y=2x-3$; $f'(2)=0\\Rightarrow y=0$.",
      ],
      answer: 'Tangents $y=2x-3$ and $y=0$.',
    };
  }
  return {
    prompt:
      'Given inflection at $x=c$ with $f(c)=d$ and $f\'(c)=m$, write the tangent line. Example: $c=1$, $d=-1$, $m=2$.',
    steps: ['Point-slope: $y-d=m(x-c)$.', 'Here $y+1=2(x-1)\\Rightarrow y=2x-3$.'],
    answer: '$y-d=m(x-c)$ (example $y=2x-3$).',
  };
}

/** Prob 6–8: cubic sketch (extrema + inflection). */
export function genCubicSketch({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) {
    return {
      prompt:
        'Sketch data for $f(x)=2x^{3}-5x^{2}+4x-7$: inflection, critical numbers, max/min.',
      steps: [
        "$f''=12x-10$: inflection at $x=5/6$.",
        "Critical $x=2/3$ (rel max), $x=1$ (rel min).",
        'Concave down left of $5/6$, up to the right.',
      ],
      answer: 'Inflection $5/6$; rel max at $2/3$; rel min at $1$.',
    };
  }
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Sketch data for $g(x)=2x^{3}-9x^{2}+36$.',
      steps: [
        'Critical $0$ (rel max, $y=36$), $3$ (rel min, $y=9$).',
        'Inflection at $x=3/2$.',
        'One real zero in $(-2,-1)$ by IVT; $g\\to\\pm\\infty$ as $x\\to\\pm\\infty$.',
      ],
      answer: 'Max at $0$, min at $3$, inflection at $3/2$; one real root $\\approx -1.70$.',
    };
  }
  const a = pickOne([1, 2]);
  const b = pickOne([3, 4, 5]);
  // f=ax³−b x² + … inflection at b/(3a)
  return {
    prompt: `For $f(x)=${a}x^{3}-${b}x^{2}+c x+d$, locate the inflection $x$-value from $f''$.`,
    steps: [
      `$f''=${6 * a}x-${2 * b}=0\\Rightarrow x=${fmtFrac(b, 3 * a)}$.`,
      'Confirm a sign change of $f\'\'$ (linear $f\'\'$ always changes).',
    ],
    answer: `Inflection at $x=${fmtFrac(b, 3 * a)}$.`,
  };
}

/** Prob 7: rational with oblique asymptote. */
export function genObliqueAsymptote({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'For $y=x^{2}/(x-2)$: rewrite by division, find extrema, asymptotes (vertical + oblique).',
      steps: [
        '$y=x+2+4/(x-2)$.',
        'Critical $x=0$ (rel max, $y=0$), $x=4$ (rel min, $y=8$).',
        'Vertical $x=2$; oblique $y=x+2$; no inflection ($y\'\'$ never $0$).',
      ],
      answer: 'VA $x=2$; OA $y=x+2$; max at $0$, min at $4$.',
    };
  }
  const k = pickOne([2, 3, 4]);
  return {
    prompt: `Divide $x^{2}/(x-${k})$ and identify the oblique asymptote.`,
    steps: [
      `$x^{2}=(x-${k})(x+${k})+${k * k}$ ⇒ $y=x+${k}+${k * k}/(x-${k})$.`,
      `Oblique asymptote $y=x+${k}$; vertical $x=${k}$.`,
    ],
    answer: `OA $y=x+${k}$; VA $x=${k}$.`,
  };
}

/** Prob 9: two vertical asymptotes + horizontal. */
export function genTwoVerticalAsymptotes({requireNiceAnswer} = {}) {
  return {
    prompt:
      'For $y=x^{2}/((x-2)(x-6))$: list vertical/horizontal asymptotes and classify critical numbers $0$ and $3$.',
    steps: [
      'VA at $x=2$, $x=6$; HA $y=1$ (equal degree, leading ratio $1$).',
      'Rel min at $x=0$ ($y=0$); rel max at $x=3$ ($y=-3$).',
      'Inflection near $x\\approx -1.70$ from $y\'\'=0$ (linked to $2x^{3}-9x^{2}+36=0$).',
    ],
    answer: 'VA $2,6$; HA $y=1$; min at $0$, max at $3$.',
  };
}

/** Prob 10: implicit / algebraic curve symmetry + asymptotes. */
export function genImplicitCurveSketch({requireNiceAnswer} = {}) {
  return {
    prompt:
      'For $y^{2}(x^{2}-4)=x^{4}$: domain, symmetry, first-quadrant min, asymptotes.',
    steps: [
      'Domain $x^{2}>4$ (plus isolated $(0,0)$); symmetric in both axes and origin.',
      'In Q1: critical $x=2\\sqrt{2}$, $y=4$ (rel/abs min on that branch); $y\'\'>0$.',
      'VA $x=\\pm 2$; oblique $y=\\pm x$.',
    ],
    answer: 'Symmetry all; min $(2\\sqrt{2},4)$ in Q1; VA $\\pm 2$; OA $y=\\pm x$.',
  };
}

/** Supp 11: Ch.14 Prob 23(a–f) style — concavity answers. */
export function genSuppCh14Concavity({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Ch.14 #23(a)-style: a graph that is always a cup. Concavity / inflection?',
      steps: ['$y\'\'>0$ everywhere (e.g. upward parabola / $x^{4}$-type).'],
      answer: 'No inflection; concave upward everywhere.',
    },
    {
      prompt: 'Ch.14 #23(b)-style: a graph that is always a cap. Concavity / inflection?',
      steps: ['$y\'\'<0$ everywhere.'],
      answer: 'No inflection; concave downward everywhere.',
    },
    {
      prompt: 'Concavity for a cubic-like $y\'\'$ with a single root at $x=-2/3$.',
      steps: [
        'Inflection at $x=-2/3$.',
        'Concave down for $x<-2/3$, up for $x>-2/3$ (if leading $y\'\'$ coeff positive).',
      ],
      answer: 'Inflection at $-2/3$; down left, up right.',
    },
    {
      prompt: 'Inflection at $x=2$ with concave up for $x>2$ and down for $x<2$. State the sign pattern of $y\'\'$.',
      steps: ['$y\'\'$ changes $-$ to $+$ at $2$.'],
      answer: 'Inflection at $2$; down on $(-\\infty,2)$, up on $(2,\\infty)$.',
    },
    {
      prompt: 'Inflection at $x=2$ with concave down for $x>2$ and up for $x<2$.',
      steps: ['$y\'\'$ changes $+$ to $-$ at $2$.'],
      answer: 'Inflection at $2$; up on $(-\\infty,2)$, down on $(2,\\infty)$.',
    },
    {
      prompt:
        'Two inflection $x$-values $\\pm 2\\sqrt{3}/3$: up outside, down between. Summarize.',
      steps: [
        'Inflection at $\\pm 2\\sqrt{3}/3$.',
        'Up for $|x|>2\\sqrt{3}/3$; down for $|x|<2\\sqrt{3}/3$.',
      ],
      answer: 'Infl. $\\pm 2\\sqrt{3}/3$; up outside, down in the middle.',
    },
  ];
  return pickOne(items);
}

/** Supp 12: cubic critical numbers average = inflection. */
export function genSuppCubicCritMean({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'Prove: for $f(x)=ax^{3}+bx^{2}+cx+d$ ($a\\neq 0$), if there are two critical numbers, their average is the inflection abscissa; if one critical number, it is the inflection abscissa.',
      steps: [
        "$f'=3ax^{2}+2bx+c$, $f''=6ax+2b$. Inflection at $x=-b/(3a)$.",
        'If two critical numbers $r,s$: sum $r+s=-2b/(3a)$, so $(r+s)/2=-b/(3a)$ = inflection.',
        'If one critical number (discriminant $0$): double root at $-b/(3a)$ = same point.',
      ],
      answer: 'Inflection abscissa is always $-b/(3a)$; equals the mean of the critical numbers.',
    };
  }
  const a = pickOne([1, 2]);
  const b = pickOne([3, 6, 9]);
  return {
    prompt: `For $f(x)=${a}x^{3}+${b}x^{2}+cx+d$, compute the inflection $x$-value and check it equals the average of the roots of $f'=0$ when two real critical numbers exist.`,
    steps: [
      `Inflection: $f''=${6 * a}x+${2 * b}=0\\Rightarrow x=${fmtFrac(-b, 3 * a)}$.`,
      `Sum of critical numbers from $f'$: $-2b/(3a)$; half is the same abscissa.`,
    ],
    answer: `Inflection (and mean of crits) at $x=${fmtFrac(-b, 3 * a)}$.`,
  };
}

/** Supp 13: discuss & sketch gallery. */
export function genSuppSketchGallery({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Discuss $xy=(x^{2}-9)^{2}$: symmetry, asymptotes, extrema, concavity.',
      steps: [
        'Odd symmetry (origin); VA $x=0$.',
        'Rel min $(3,0)$, rel max $(-3,0)$; no inflection; concave up for $x>0$.',
      ],
      answer: 'Origin symmetry; VA $x=0$; min $(3,0)$, max $(-3,0)$; up for $x>0$.',
    },
    {
      prompt: 'Discuss $y=x^{4}/(1-x^{2})$: symmetry, asymptotes, extrema, concavity.',
      steps: [
        'Even ($y$-axis); VA $x=\\pm 1$.',
        'Rel min $(0,0)$; rel max $(\\pm\\sqrt{2},-4)$; no inflection; up for $|x|<1$.',
      ],
      answer: 'Even; VA $\\pm 1$; min at $0$; max $\\pm\\sqrt{2}$; up inside $(-1,1)$.',
    },
    {
      prompt: 'Discuss $y=x^{2}+2/x$: asymptotes, extrema, inflection, concavity.',
      steps: [
        'VA $x=0$; rel min $(1,3)$; inflection $(-\\sqrt[3]{2},0)$.',
        'Concave up for $x<-\\sqrt[3]{2}$ and $x>0$.',
      ],
      answer: 'VA $0$; min $(1,3)$; infl. $-\\sqrt[3]{2}$; up on $(-\\infty,-\\sqrt[3]{2})\\cup(0,\\infty)$.',
    },
    {
      prompt: 'Discuss $y^{3}=6x^{2}-x^{3}$: extrema, cusp, inflection, oblique asymptote.',
      steps: [
        'Rel max $(4,2\\sqrt[3]{4})$; rel min / cusp at $(0,0)$; infl. $(6,0)$.',
        'Up for $x>6$; OA $y=-x+2$.',
      ],
      answer: 'Max at $4$; cusp min at $0$; infl. $6$; OA $y=-x+2$.',
    },
    {
      prompt: 'Discuss $y=1+x^{2}/(x-1)$: asymptotes, extrema, mono, concavity.',
      steps: [
        'VA $x=1$; OA $y=x+2$; max $(0,1)$, min $(2,5)$.',
        'Up for $x>1$, down for $x<1$; no inflection; mono as in the book key.',
      ],
      answer: 'VA $1$; OA $y=x+2$; max $0$, min $2$; no inflection.',
    },
    {
      prompt: 'Discuss $y=x/(x^{2}+1)$: symmetry, extrema, inflection, HA.',
      steps: [
        'Odd; max $(1,1/2)$, min $(-1,-1/2)$; incr. on $(-1,1)$.',
        'Infl. $0,\\pm\\sqrt{3}$; HA $y=0$; concavity as in the key.',
      ],
      answer: 'Odd; max/min at $\\pm 1$; infl. $0,\\pm\\sqrt{3}$; HA $y=0$.',
    },
    {
      prompt: 'Discuss $y=x\\sqrt{x-1}$ ($x\\ge 1$): mono, concavity, inflection.',
      steps: [
        'Increasing on domain; infl. $(4/3,\\tfrac49\\sqrt{3})$.',
        'Down for $1\\le x<4/3$, up for $x>4/3$.',
      ],
      answer: 'Increasing; infl. at $4/3$; down then up.',
    },
    {
      prompt: 'Discuss $y=x\\sqrt[3]{2-x}$: max, mono, inflection.',
      steps: [
        'Rel max at $x=3/2$; incr. for $x<3/2$.',
        'Down for $x<2$, up for $x>2$; infl. $(2,0)$.',
      ],
      answer: 'Max at $3/2$; infl. at $2$; down left of $2$.',
    },
    {
      prompt: 'Discuss $y=(x+1)/x^{2}$: asymptotes, extrema, inflection.',
      steps: [
        'VA $x=0$, HA $y=0$; rel min $(-2,-1/4)$; infl. $(-3,-2/9)$.',
        'Up on $(-3,0)$ and $x>0$; $y\\to+\\infty$ as $x\\to 0$.',
      ],
      answer: 'VA $0$, HA $0$; min $-2$; infl. $-3$.',
    },
  ];
  return pickOne(items);
}

/** Supp 14: unique even+odd decomposition. */
export function genSuppEvenOddDecomp({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt:
        'Show any $F$ defined for all $x$ is uniquely $E+O$ with $E$ even and $O$ odd. [Hint: $E(x)=\\tfrac12(F(x)+F(-x))$.]',
      steps: [
        'Set $E(x)=\\tfrac12(F(x)+F(-x))$, $O(x)=\\tfrac12(F(x)-F(-x))$.',
        'Check $E(-x)=E(x)$, $O(-x)=-O(x)$, and $E+O=F$.',
        'Uniqueness: if $F=E_1+O_1=E_2+O_2$, then $E_1-E_2=O_2-O_1$ is both even and odd ⇒ $0$.',
      ],
      answer: '$E=\\tfrac12(F(x)+F(-x))$, $O=\\tfrac12(F(x)-F(-x))$ — unique.',
    },
    {
      prompt: 'Decompose $F(x)=e^{x}$ into even + odd parts.',
      steps: [
        '$E=\\cosh x=\\tfrac12(e^{x}+e^{-x})$, $O=\\sinh x=\\tfrac12(e^{x}-e^{-x})$.',
      ],
      answer: '$e^{x}=\\cosh x+\\sinh x$.',
    },
  ];
  return pickOne(items);
}

/** Supp 15: reflect an algebraic curve. */
export function genSuppReflectCurve({requireNiceAnswer} = {}) {
  return {
    prompt:
      'Curve $C$: $x^{2}-3xy+2y^{2}=1$. Find the equation after reflection in (a) $x$-axis (b) $y$-axis (c) origin.',
    steps: [
      '(a) Replace $y$ by $-y$: $x^{2}+3xy+2y^{2}=1$.',
      '(b) Replace $x$ by $-x$: same as (a).',
      '(c) Replace $(x,y)$ by $(-x,-y)$: recovers $C$ (even total degree).',
    ],
    answer: '(a)(b) $x^{2}+3xy+2y^{2}=1$; (c) $C$ itself.',
  };
}

/** Supp 18–19: GC sketch prompts. */
export function genSuppGcSketch({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt:
        'Analytically: show $f(x)=x^{3}-3x^{2}+4x-2$ is increasing and locate its inflection; then on a GC compare $f$, $f^{-1}$, and $y=x$.',
      steps: [
        "$f'=3x^{2}-6x+4$ has discriminant $36-48<0$, so $f'>0$ everywhere (strictly increasing / invertible).",
        "$f''=6x-6=0$ at $x=1$ with a sign change ⇒ inflection at $(1,0)$.",
        'GC: graphs of $f$ and $f^{-1}$ are mirrors across $y=x$.',
      ],
      answer: 'Always increasing; inflection at $x=1$; inverse reflects across $y=x$.',
    },
    {
      prompt:
        'Sketch $y=x^{2}/(x^{3}-3x^{2}+5)$ by hand (asymptotes / end behavior), then use a GC to refine vertical asymptotes.',
      steps: [
        'Denominator zeros ⇒ candidate VAs; degree gap ⇒ HA $y=0$.',
        'GC confirms which poles are real and the local shape between them.',
      ],
      answer: 'HA $y=0$; check real roots of $x^{3}-3x^{2}+5=0$ for VAs; GC for detail.',
    },
  ];
  return pickOne(items);
}

export function genSuppCurveSketchMixed(opts) {
  return pickOne([
    genSuppCh14Concavity,
    genSuppCubicCritMean,
    genSuppSketchGallery,
    genSuppEvenOddDecomp,
    genSuppReflectCurve,
    genSuppGcSketch,
    genConcavityInflection,
    genObliqueAsymptote,
  ])(opts);
}

export function genCurveSketchMixed(opts) {
  return pickOne([
    genConcavityInflection,
    genNoInflectionMin,
    genInflectionUndefined,
    genThirdDerivInflectionTest,
    genInflectionTangents,
    genCubicSketch,
    genObliqueAsymptote,
    genTwoVerticalAsymptotes,
    genImplicitCurveSketch,
  ])(opts);
}

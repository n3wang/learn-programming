import {pickOne} from './mathRandom';

/** Chain rule with arcsin / arccos / arctan. */
export function genInvTrigChain({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Differentiate: (a) $y=\\arcsin(2x-3)$ (b) $y=\\arccos(x^{2})$ (c) $y=\\arctan(3x^{2})$.',
      steps: [
        '(a) $2/\\sqrt{1-(2x-3)^{2}}$.',
        '(b) $-2x/\\sqrt{1-x^{4}}$.',
        '(c) $6x/(1+9x^{4})$.',
      ],
      answer: 'See steps.',
    };
  }
  return pickOne([
    {
      prompt: 'Differentiate $y=\\arcsin(2x-3)$.',
      steps: ["Chain: $y'=2/\\sqrt{1-(2x-3)^{2}}$."],
      answer: "$y'=2/\\sqrt{1-(2x-3)^{2}}$.",
    },
    {
      prompt: 'Differentiate $y=\\arccos(x^{2})$.',
      steps: ["$y'=-2x/\\sqrt{1-x^{4}}$."],
      answer: "$y'=-2x/\\sqrt{1-x^{4}}$.",
    },
    {
      prompt: 'Differentiate $y=\\arctan(3x^{2})$.',
      steps: ["$y'=6x/(1+9x^{4})$."],
      answer: "$y'=6x/(1+9x^{4})$.",
    },
    {
      prompt: 'Differentiate $y=\\arcsin(x^{3})$.',
      steps: ["$y'=3x^{2}/\\sqrt{1-x^{6}}$."],
      answer: "$y'=3x^{2}/\\sqrt{1-x^{6}}$.",
    },
  ]);
}

/** cot⁻¹ / sec⁻¹ / csc⁻¹ compositions. */
export function genInvTrigOtherDeriv({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'Differentiate $y=\\cot^{-1}\\big((1+x)/(1-x)\\big)$.',
      steps: [
        'Chain with (18.4); simplifies to $y\'=-1/(1+x^{2})$.',
      ],
      answer: "$y'=-1/(1+x^{2})$.",
    };
  }
  return pickOne([
    {
      prompt: 'Differentiate $y=\\cot^{-1}\\big((1+x)/(1-x)\\big)$.',
      steps: ["After algebra: $y'=-1/(1+x^{2})$."],
      answer: "$y'=-1/(1+x^{2})$.",
    },
    {
      prompt: 'Differentiate $y=\\sec^{-1}(2x)$ for $|2x|>1$.',
      steps: ["$y'=1/(x\\sqrt{4x^{2}-1})$."],
      answer: "$y'=1/(x\\sqrt{4x^{2}-1})$.",
    },
    {
      prompt:
        'For $0<x<1$, simplify $y\'$ if $y=x\\csc^{-1}(1/x)+\\sqrt{1-x^{2}}$.',
      steps: ["$y'=\\csc^{-1}(1/x)$."],
      answer: "$y'=\\csc^{-1}(1/x)$.",
    },
  ]);
}

/** Evaluate inverse trig at special values. */
export function genInvTrigEval({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Evaluate: (a) $\\arcsin(-\\sqrt{2}/2)$ (b) $\\arccos(1/2)$ (c) $\\arctan(-\\sqrt{3})$ (d) $\\sec^{-1}(2)$.',
      steps: [
        '(a) $-\\pi/4$; (b) $\\pi/3$; (c) $-\\pi/3$; (d) $\\pi/3$.',
      ],
      answer: '$-\\pi/4$; $\\pi/3$; $-\\pi/3$; $\\pi/3$.',
    };
  }
  return pickOne([
    {
      prompt: 'Evaluate $\\arccos(0)$ and $\\arccos(1)$.',
      steps: ['$\\arccos 0=\\pi/2$; $\\arccos 1=0$.'],
      answer: '$\\pi/2$; $0$.',
    },
    {
      prompt: 'Evaluate $\\sec^{-1}(-2)$ (this chapter’s range).',
      steps: ['$\\sec(4\\pi/3)=-2$ and $4\\pi/3\\in[\\pi,3\\pi/2)$.'],
      answer: '$4\\pi/3$.',
    },
    {
      prompt: 'Evaluate $\\arcsin(\\sin\\pi)$.',
      steps: ['$\\sin\\pi=0$ ⇒ $\\arcsin 0=0$ (not $\\pi$).'],
      answer: '$0$.',
    },
  ]);
}

/** Composition identities. */
export function genInvTrigCompose({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Evaluate: (a) $\\cos\\big(2\\arcsin(2/5)\\big)$ (b) $\\sin\\big(\\arccos(-3/4)\\big)$.',
      steps: [
        '(a) $1-2(2/5)^{2}=17/25$.',
        '(b) $+\\sqrt{7}/4$ (QII).',
      ],
      answer: '$17/25$; $\\sqrt{7}/4$.',
    };
  }
  return pickOne([
    {
      prompt: 'Simplify $\\cos\\big(2\\arcsin(2/5)\\big)$.',
      steps: ['$\\cos 2\\theta=1-2\\sin^{2}\\theta$ with $\\sin\\theta=2/5$.'],
      answer: '$17/25$.',
    },
    {
      prompt: 'Simplify $\\sin\\big(\\arccos(-3/4)\\big)$.',
      steps: [
        '$\\sin^{2}=1-9/16=7/16$; QII ⇒ positive root.',
      ],
      answer: '$\\sqrt{7}/4$.',
    },
    {
      prompt: 'Does $\\arcsin(\\sin x)=x$ for $x=\\pi$?',
      steps: ['No: left side is $0$. Only on $[-\\pi/2,\\pi/2]$.'],
      answer: 'No — equals $0$.',
    },
  ]);
}

/** Implicit with inverse trig. */
export function genInvTrigImplicit({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'If $y^{2}\\sin x+y=\\arctan x$, find $y\'$.',
      steps: [
        "$y'=\\dfrac{1-(1+x^{2})y^{2}\\cos x}{(1+x^{2})(2y\\sin x+1)}$.",
      ],
      answer: 'See steps.',
    };
  }
  return pickOne([
    {
      prompt: 'If $y^{2}\\sin x+y=\\arctan x$, express $y\'$.',
      steps: [
        'Collect $y\'$: $y\'(2y\\sin x+1)=1/(1+x^{2})-y^{2}\\cos x$.',
      ],
      answer:
        "$y'=\\dfrac{1-(1+x^{2})y^{2}\\cos x}{(1+x^{2})(2y\\sin x+1)}$.",
    },
    {
      prompt: 'If $\\arctan y=x^{2}$, find $y\'$.',
      steps: ["$y'=2x(1+y^{2})$."],
      answer: "$y'=2x(1+y^{2})$.",
    },
  ]);
}

/** Combined formulas. */
export function genInvTrigCombined({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt:
        'Show that if $y=x\\sqrt{a^{2}-x^{2}}+a^{2}\\arcsin(x/a)$, then $y\'=2\\sqrt{a^{2}-x^{2}}$.',
      steps: ['Differentiate; radicals cancel.'],
      answer: "$y'=2\\sqrt{a^{2}-x^{2}}$.",
    };
  }
  return pickOne([
    {
      prompt:
        'If $y=\\dfrac{1}{ab}\\arctan\\big(\\dfrac{b}{a}\\tan x\\big)$, simplify $y\'$.',
      steps: ["$y'=1/(a^{2}\\cos^{2}x+b^{2}\\sin^{2}x)$."],
      answer: "$y'=1/(a^{2}\\cos^{2}x+b^{2}\\sin^{2}x)$.",
    },
    {
      prompt:
        'For $0<x<1$, if $y=x\\csc^{-1}(1/x)+\\sqrt{1-x^{2}}$, find $y\'$.',
      steps: ["$y'=\\csc^{-1}(1/x)$."],
      answer: "$y'=\\csc^{-1}(1/x)$.",
    },
  ]);
}

/** Supp 15 / 29 evaluations. */
export function genSuppInvEval({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Evaluate: (a) $\\arcsin(-\\sqrt{3}/2)$ (b) $\\arccos(\\sqrt{3}/2)$ (c) $\\arccos(-\\sqrt{3}/2)$ (d) $\\arctan(-\\sqrt{3}/3)$ (e) $\\sec^{-1}\\sqrt{2}$ (f) $\\sec^{-1}(-\\sqrt{2})$.',
      steps: [
        '(a) $-\\pi/3$; (b) $\\pi/6$; (c) $5\\pi/6$; (d) $-\\pi/6$; (e) $\\pi/4$; (f) $5\\pi/4$.',
      ],
      answer: '$-\\pi/3$; $\\pi/6$; $5\\pi/6$; $-\\pi/6$; $\\pi/4$; $5\\pi/4$.',
    };
  }
  return pickOne([
    {
      prompt: 'Evaluate $\\arccos(-\\sqrt{3}/2)$ and $\\sec^{-1}(-\\sqrt{2})$.',
      steps: ['$5\\pi/6$; $5\\pi/4$ (this chapter’s sec⁻¹ range).'],
      answer: '$5\\pi/6$; $5\\pi/4$.',
    },
    {
      prompt: 'Evaluate $\\cos(\\arcsin(3/11))$ and $\\tan(\\sec^{-1}(7/5))$.',
      steps: [
        '$\\cos=4\\sqrt{7}/11$.',
        '$\\tan=\\sqrt{\\sec^{2}-1}=2\\sqrt{6}/5$.',
      ],
      answer: '$4\\sqrt{7}/11$; $2\\sqrt{6}/5$.',
    },
    {
      prompt: 'Evaluate $\\arccos(\\cos(3\\pi/2))$.',
      steps: ['$\\cos(3\\pi/2)=0$ ⇒ $\\arccos 0=\\pi/2$.'],
      answer: '$\\pi/2$.',
    },
  ]);
}

/** Supp 17–20 chain. */
export function genSuppInvChain({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Differentiate: (a) $\\arcsin(3x)$ (b) $\\arccos(x/2)$ (c) $\\arctan(3/x)$ (d) $\\arcsin(x-1)$.',
      steps: [
        '(a) $3/\\sqrt{1-9x^{2}}$.',
        '(b) $-1/\\sqrt{4-x^{2}}$.',
        '(c) $-3/(x^{2}+9)$.',
        '(d) $1/\\sqrt{2x-x^{2}}$.',
      ],
      answer: 'See steps.',
    };
  }
  return pickOne([
    {
      prompt: 'Differentiate $y=\\arcsin(3x)$.',
      steps: ["$y'=3/\\sqrt{1-9x^{2}}$."],
      answer: "$y'=3/\\sqrt{1-9x^{2}}$.",
    },
    {
      prompt: 'Differentiate $y=\\arccos(x/2)$.',
      steps: ["$y'=-1/\\sqrt{4-x^{2}}$."],
      answer: "$y'=-1/\\sqrt{4-x^{2}}$.",
    },
    {
      prompt: 'Differentiate $y=\\arctan(3/x)$.',
      steps: ["$y'=-3/(x^{2}+9)$."],
      answer: "$y'=-3/(x^{2}+9)$.",
    },
    {
      prompt: 'Differentiate $y=\\arcsin(x-1)$.',
      steps: ["$y'=1/\\sqrt{2x-x^{2}}$."],
      answer: "$y'=1/\\sqrt{2x-x^{2}}$.",
    },
  ]);
}

/** Supp 26–27 / 30–31 / 35. */
export function genSuppInvComposeMore({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt:
        'Let $\\theta=\\arccos(2/7)$. Find $\\sin\\theta$, $\\tan\\theta$, and $\\cos 2\\theta$.',
      steps: [
        '$\\sin=3\\sqrt{5}/7$; $\\tan=3\\sqrt{5}/2$; $\\cos 2\\theta=-41/49$.',
      ],
      answer: '$3\\sqrt{5}/7$; $3\\sqrt{5}/2$; $-41/49$.',
    };
  }
  return pickOne([
    {
      prompt: 'Let $\\theta=\\arcsin(-1/5)$. Find $\\cos\\theta$ and $\\sin 2\\theta$.',
      steps: [
        '$\\cos=+2\\sqrt{6}/5$; $\\sin 2\\theta=-4\\sqrt{6}/25$.',
      ],
      answer: '$2\\sqrt{6}/5$; $-4\\sqrt{6}/25$.',
    },
    {
      prompt: 'Find $\\sec(\\arctan(5/7))$ and $\\sec(\\arctan(2x))$.',
      steps: [
        '$\\sec=\\sqrt{74}/7$; formula $\\sqrt{1+4x^{2}}$.',
      ],
      answer: '$\\sqrt{74}/7$; $\\sqrt{1+4x^{2}}$.',
    },
    {
      prompt: 'Domain and range of $f(x)=\\sin(\\sec^{-1}x)$?',
      steps: ['Domain $|x|\\ge 1$; range $(-1,1)$.'],
      answer: 'Domain $|x|\\ge 1$; range $(-1,1)$.',
    },
    {
      prompt: 'For which $x$ is $\\arctan(\\tan x)=x$?',
      steps: ['On $(-\\pi/2,\\pi/2)$.'],
      answer: '$-\\pi/2<x<\\pi/2$.',
    },
  ]);
}

/** Supp 21–24. */
export function genSuppInvProduct({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) {
    return {
      prompt: 'Differentiate $y=x^{2}\\arccos(2/x)$ ($|x|>2$).',
      steps: [
        "$y'=2x\\big(\\arccos(2/x)+1/\\sqrt{x^{2}-4}\\big)$.",
      ],
      answer: "$y'=2x\\big(\\arccos(2/x)+1/\\sqrt{x^{2}-4}\\big)$.",
    };
  }
  return pickOne([
    {
      prompt:
        'If $y=x/\\sqrt{a^{2}-x^{2}}-\\arcsin(x/a)$, show $y\'=x^{2}/(a^{2}-x^{2})^{3/2}$.',
      steps: [
        'Differentiate and combine over $(a^{2}-x^{2})^{3/2}$.',
      ],
      answer: "$y'=x^{2}/(a^{2}-x^{2})^{3/2}$.",
    },
    {
      prompt:
        'If $y=(x-a)\\sqrt{2ax-x^{2}}+a^{2}\\arcsin((x-a)/a)$, show $y\'=2\\sqrt{2ax-x^{2}}$.',
      steps: ['Differentiate; terms combine.'],
      answer: "$y'=2\\sqrt{2ax-x^{2}}$.",
    },
    {
      prompt:
        'If $y=\\sqrt{x^{2}-4}/x^{2}+\\tfrac12\\sec^{-1}(x/2)$, find $y\'$.',
      steps: ["$y'=8/(x^{3}\\sqrt{x^{2}-4})$."],
      answer: "$y'=8/(x^{3}\\sqrt{x^{2}-4})$.",
    },
  ]);
}

/** Supp 32 light. */
export function genSuppLightMax() {
  return {
    prompt:
      'Circular plot radius $30$ ft; $I=kx/(x^{2}+900)^{3/2}$. Maximize height $x$.',
    steps: [
      "$I'=0$ ⇒ $900-2x^{2}=0$ ⇒ $x=15\\sqrt{2}$ ft.",
    ],
    answer: '$15\\sqrt{2}$ ft.',
  };
}

/** Mixed supplementary. */
export function genSuppInvTrigMixed({requireNiceAnswer} = {}) {
  const gens = [
    genInvTrigChain,
    genInvTrigOtherDeriv,
    genInvTrigEval,
    genInvTrigCompose,
    genInvTrigImplicit,
    genInvTrigCombined,
    genSuppInvEval,
    genSuppInvChain,
    genSuppInvComposeMore,
    genSuppInvProduct,
    genSuppLightMax,
  ];
  return pickOne(gens)({requireNiceAnswer});
}

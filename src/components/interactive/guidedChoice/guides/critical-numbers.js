/** Guided: critical numbers vs extrema. */

export default {
  title: 'Critical numbers',
  lead: 'f′=0 or f′ undefined — necessary for differentiable relative extrema, not sufficient.',
  steps: [
    {
      ask: 'A critical number of f is a domain point x₀ where…',
      choices: [
        {label: '$f\'(x_0)=0$ **or** $f\'(x_0)$ is undefined', ok: true},
        {label: '$f(x_0)=0$ only', ok: false},
        {label: '$f\'\'(x_0)>0$ only', ok: false},
      ],
      caption: 'Both zeros of $f\'$ and corners/cusps count.',
    },
    {
      ask: 'If f has a relative extremum at a differentiable x₀, then…',
      choices: [
        {label: '$f\'(x_0)=0$, so $x_0$ is critical', ok: true},
        {label: '$f\'(x_0)$ must fail to exist', ok: false},
        {label: '$f$ is constant on $\\mathbb{R}$', ok: false},
      ],
      caption: 'Theorem 13.1 — necessary condition.',
    },
    {
      ask: 'Why is x=0 critical for f(x)=x³ but not a relative extremum?',
      choices: [
        {label: "$f'=3x^{2}=0$ at 0, but $f'$ does not change sign ($\\{+,+\\}$)", ok: true},
        {label: 'Because $f\'\'(0)\\ne 0$', ok: false},
        {label: 'Because 0 is not in the domain', ok: false},
      ],
      caption: 'Critical $\\neq$ extremum — need a first- or second-derivative test.',
    },
  ],
};

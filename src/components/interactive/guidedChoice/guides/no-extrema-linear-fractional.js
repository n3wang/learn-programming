/** Guided: linear fractional has no relative extrema. */

export default {
  title: 'No relative extrema for (ax+b)/(cx+d)',
  lead: 'Use the necessary condition from Theorem 13.1.',
  steps: [
    {
      ask: 'For $f(x)=\\dfrac{ax+b}{cx+d}$ (nonconstant), $f\'(x)$ equals…',
      choices: [
        {
          label: "$\\dfrac{ad-bc}{(cx+d)^{2}}$ (quotient rule)",
          ok: true,
        },
        {label: '$acx+bd$', ok: false},
        {label: '$0$ for every $x$', ok: false},
      ],
      caption: 'Numerator is the constant determinant $ad-bc$.',
    },
    {
      ask: 'If $ad-bc\\ne 0$, then on the domain…',
      choices: [
        {label: '$f\'(x)\\ne 0$ everywhere it exists', ok: true},
        {label: '$f\'$ changes sign at every integer', ok: false},
        {label: '$f$ is undefined everywhere', ok: false},
      ],
      caption: 'Denominator squared is always positive where defined.',
    },
    {
      ask: 'Why does that rule out relative extrema?',
      choices: [
        {
          label: 'Theorem 13.1: a relative extremum at a differentiable point requires $f\'=0$',
          ok: true,
        },
        {label: 'Because Rolle forbids all rationals', ok: false},
        {label: 'Because $f$ is periodic', ok: false},
      ],
      caption: 'No critical points ⇒ no differentiable relative extrema.',
    },
  ],
};

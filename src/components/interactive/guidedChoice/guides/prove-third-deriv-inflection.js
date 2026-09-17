/** Guided proof: f″(x₀)=0 and f‴(x₀)≠0 ⇒ inflection. */

export default {
  title: 'Proof — f‴≠0 forces an inflection',
  lead: 'If the second derivative vanishes but the third does not, concavity must change.',
  steps: [
    {
      ask: 'Assume $f\'\'(x_0)=0$ and $f\'\'\'(x_0)\\neq 0$. What does $f\'\'\'(x_0)\\neq 0$ say about $f\'\'$?',
      choices: [
        {
          label: '$f\'\'$ is strictly increasing or decreasing at $x_0$ (apply Thm 13.7 to $f\'\'$)',
          ok: true,
        },
        {label: '$f\'\'$ is constant near $x_0$', ok: false},
        {label: '$f$ has a relative max at $x_0$', ok: false},
      ],
      caption: 'Nonzero derivative of $f\'\'$ means $f\'\'$ itself is mono at that point.',
    },
    {
      ask: 'Combined with $f\'\'(x_0)=0$, the signs of $f\'\'$ left and right of $x_0$ are…',
      choices: [
        {label: 'Opposite — so concavity changes', ok: true},
        {label: 'The same', ok: false},
        {label: 'Both zero everywhere', ok: false},
      ],
      caption: 'A strictly mono function crossing zero changes sign.',
    },
    {
      ask: 'Therefore at $x_0$ the graph has…',
      choices: [
        {label: 'An inflection point', ok: true},
        {label: 'Necessarily a relative extremum', ok: false},
        {label: 'A vertical asymptote', ok: false},
      ],
      caption: 'Opposite concavity on the two sides is the definition of inflection.',
    },
  ],
};

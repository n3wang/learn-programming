/** Guided proof: second derivative test via first-derivative test. */

export default {
  title: 'Proof — second derivative test',
  lead: 'If $f\'(x_0)=0$ and $f\'\'(x_0)$ exists and is nonzero, classify the critical point from the sign of $f\'\'(x_0)$.',
  steps: [
    {
      ask: 'Assume $f\'\'(x_0)>0$. By Theorem 13.7 applied to $f\'$, near $x_0$ the derivative $f\'$ is…',
      choices: [
        {label: 'Increasing at $x_0$', ok: true},
        {label: 'Decreasing at $x_0$', ok: false},
        {label: 'Constant near $x_0$', ok: false},
      ],
      caption: 'Positive derivative of $f\'$ means $f\'$ itself is increasing.',
    },
    {
      ask: 'Since $f\'(x_0)=0$ and $f\'$ is increasing there, the sign pattern of $f\'$ is…',
      choices: [
        {label: '$\\{-,\\,+\\}$ — first-derivative test ⇒ relative minimum', ok: true},
        {label: '$\\{+,\\,-\\}$ — relative maximum', ok: false},
        {label: 'Same-sign — neither', ok: false},
      ],
      caption: '$f\'$ changes from negative to positive through $x_0$.',
    },
    {
      ask: 'If instead $f\'\'(x_0)<0$, apply the previous case to $g=-f$. Conclusion for $f$?',
      choices: [
        {label: '$f$ has a relative maximum at $x_0$', ok: true},
        {label: '$f$ has a relative minimum at $x_0$', ok: false},
        {label: 'The test is always inconclusive', ok: false},
      ],
      caption: '$g\'\'(x_0)>0$ ⇒ $g$ has a rel min ⇒ $f$ has a rel max.',
    },
  ],
};

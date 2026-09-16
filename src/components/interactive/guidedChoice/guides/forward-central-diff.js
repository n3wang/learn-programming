/** Forward vs central finite differences. */

export default {
  title: 'Numerical derivatives',
  lead: 'You have tabulated $y(t)$, not a formula. Which finite-difference formula should you trust first?',
  steps: [
    {
      caption: 'The limit definition $(y(t+h)-y(t))/h$ is hostile on a computer: tiny $h$ makes the numerator vanish into $\\varepsilon_m$ while the denominator blows up.',
    },
    {
      ask: 'The forward difference $(y(t+h)-y(t))/h$ has truncation error…',
      choices: [
        {label: 'typically $O(h)$ from the next Taylor term', ok: true},
        {label: 'exactly zero for every smooth $y$', ok: false},
        {label: 'only $O(h^{4})$', ok: false},
      ],
      caption: 'It fits a straight chord from $t$ to $t+h$. Good only when $h$ is small — but not so small that cancellation wins.',
    },
    {
      ask: 'The central difference $(y(t+h/2)-y(t-h/2))/h$ is usually better because…',
      choices: [
        {label: 'even powers of $h$ cancel, leaving $O(h^{2})$ truncation error', ok: true},
        {label: 'it never needs two function values', ok: false},
        {label: 'it uses a larger $h$ automatically', ok: false},
      ],
      caption: 'For a parabola $y=a+bt^{2}$, central difference is exact for every $h$; forward still carries a $bh$ bias.',
    },
  ],
};

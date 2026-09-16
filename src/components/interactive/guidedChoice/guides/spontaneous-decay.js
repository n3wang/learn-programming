/** Stochastic decay vs exponential mean-field law. */

export default {
  title: 'Spontaneous decay',
  lead: 'Each nucleus decays independently with fixed probability per time step. When does that look exponential?',
  steps: [
    {
      caption: 'The microscopic law is $\\mathcal{P}=(\\Delta N/N)/\\Delta t=-\\lambda$ (constant per surviving particle). The exponential $N(0)e^{-\\lambda t}$ appears only after $N\\to\\infty$ and $\\Delta t\\to 0$.',
    },
    {
      ask: 'For a small sample, the semilog plot of $N(t)$…',
      choices: [
        {label: 'shows stochastic bumps; exponential is only the smooth large-$N$ limit', ok: true},
        {label: 'must be perfectly straight for any $N(0)$', ok: false},
        {label: 'always follows a power law $t^{-\\alpha}$', ok: false},
      ],
      caption: 'Same $\\lambda$ for every particle — randomness averages out only when many particles remain.',
    },
    {
      ask: 'On a semilog plot, changing $N(0)$ at fixed $\\lambda$ mainly…',
      choices: [
        {label: 'shifts the curve vertically; the early slope stays $\\approx-\\lambda$', ok: true},
        {label: 'changes the slope proportional to $N(0)$', ok: false},
        {label: 'removes all fluctuations', ok: false},
      ],
      caption: 'Activity $\\Delta N/\\Delta t$ tracks $N$, so $\\ln N$ and $\\ln\\Delta N$ share the same decay constant.',
    },
  ],
};

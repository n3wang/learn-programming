/** Extrapolated difference and second-derivative stencils. */

export default {
  title: 'Extrapolated derivatives',
  lead: 'Central difference still leaves an $O(h^{2})$ error. How do you cancel that term without inventing a brand-new Taylor story from scratch?',
  steps: [
    {
      caption: 'Richardson idea: combine $D_{\\mathrm{cd}}(h)$ and $D_{\\mathrm{cd}}(h/2)$ so the shared $h^{2}$ pieces cancel. The extended difference is $(4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h))/3$.',
    },
    {
      ask: 'The leading truncation error of the extrapolated difference is typically…',
      choices: [
        {label: '$O(h^{4})$ (until round-off dominates)', ok: true},
        {label: 'still $O(h)$', ok: false},
        {label: 'exactly zero for every $C^{\\infty}$ function', ok: false},
      ],
      caption: 'Higher-order stencils are fragile on noisy data — smooth or fit first (Chapter 6) before differentiating measurements.',
    },
    {
      ask: 'A compact central second derivative is…',
      choices: [
        {label: '$[y(t+h)-2y(t)+y(t-h)]/h^{2}$', ok: true},
        {label: '$[y(t+h)-y(t)]/h$', ok: false},
        {label: '$y(t)/h^{2}$ only', ok: false},
      ],
      caption: 'More subtractions ⇒ worse cancellation. Optimal $h$ for $y\'\'$ is usually larger than for $y\'$.',
    },
  ],
};

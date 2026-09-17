/** Guided beats: relative extremum ⇒ f′=0 when differentiable. */

export default {
  title: 'Critical point at a relative extremum',
  lead: 'If f has a relative max/min at x₀ and f′(x₀) exists, why must f′(x₀)=0?',
  steps: [
    {
      ask: 'A relative maximum at x₀ means…',
      choices: [
        {
          label: '$f(x_0)\\ge f(x)$ for all $x$ near $x_0$ (in the domain)',
          ok: true,
        },
        {
          label: '$f(x_0)$ is the global maximum on $\\mathbb{R}$',
          ok: false,
        },
        {
          label: '$f\'(x_0)>0$ and increasing forever',
          ok: false,
        },
      ],
      caption: 'Local comparison only — a small open interval around $x_0$.',
    },
    {
      ask: 'If $f\'(x_0)$ existed and were strictly positive, nearby points would…',
      choices: [
        {
          label: 'Lie above $f(x_0)$ on the right and below on the left — contradicting a local max',
          ok: true,
        },
        {
          label: 'All equal $f(x_0)$ automatically',
          ok: false,
        },
        {
          label: 'Force $f$ to be undefined',
          ok: false,
        },
      ],
      caption: 'Positive derivative ⇒ the graph rises through $x_0$.',
    },
    {
      ask: 'Therefore, when a relative extremum occurs at a differentiable point…',
      choices: [
        {
          label: '$f\'(x_0)=0$ (horizontal tangent)',
          ok: true,
        },
        {
          label: '$f\'(x_0)$ must fail to exist',
          ok: false,
        },
        {
          label: '$f\'\'(x_0)=0$ is required',
          ok: false,
        },
      ],
      caption: 'Corners (e.g. $|x|$ at 0) can still be extrema without a derivative.',
    },
  ],
};

/** Extrapolated difference and second-derivative stencil — pick the equation. */

export default {
  title: 'Extrapolated derivatives',
  lead:
    '$D_{\\mathrm{ed}}$ and the central $y\'\'$ stencil. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'Richardson combo of two central differences is…',
      choices: [
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}(t,h)=\\frac{4\\,D_{\\mathrm{cd}}(t,h/2)-D_{\\mathrm{cd}}(t,h)}{3}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}(t,h)=\\frac{D_{\\mathrm{cd}}(t,h/2)-4\\,D_{\\mathrm{cd}}(t,h)}{3}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}(t,h)=\\frac{4\\,D_{\\mathrm{cd}}(t,h)-D_{\\mathrm{cd}}(t,h/2)}{3}$',
          ok: false,
        },
      ],
      caption: 'Cancels the shared $O(h^{2})$ piece → leading error typically $O(h^{4})$.',
    },
    {
      ask: 'Central difference of a central first derivative starts as…',
      choices: [
        {
          label:
            '$\\displaystyle y\'\'(t)\\simeq\\frac{y\'(t+h/2)-y\'(t-h/2)}{h}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y\'\'(t)\\simeq\\frac{y\'(t+h/2)+y\'(t-h/2)}{h}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle y\'\'(t)\\simeq\\frac{y\'(t+h)-y\'(t)}{h}$',
          ok: false,
        },
      ],
      caption: 'Substitute forward/backward first differences for each $y\'$.',
    },
    {
      ask: 'After substituting the first differences, the compact central second derivative is…',
      choices: [
        {
          label:
            '$\\displaystyle y\'\'(t)\\simeq\\frac{y(t+h)-2y(t)+y(t-h)}{h^{2}}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y\'\'(t)\\simeq\\frac{y(t+h)+2y(t)+y(t-h)}{h^{2}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle y\'\'(t)\\simeq\\frac{y(t+h)-y(t-h)}{h^{2}}$',
          ok: false,
        },
      ],
      caption:
        'More subtractions ⇒ worse cancellation. Optimal $h$ for $y\'\'$ is usually larger than for $y\'$ ($\\varepsilon_{\\mathrm{ro}}\\sim\\varepsilon_m/h^{2}$).',
    },
  ],
};

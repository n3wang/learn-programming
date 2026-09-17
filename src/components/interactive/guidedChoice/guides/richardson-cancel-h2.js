/** Richardson extrapolation: cancel the shared O(h²) error — pick the equation. */

export default {
  title: 'Richardson: cancel the $h^{2}$ term',
  lead:
    'Combine two central differences so the shared $O(h^{2})$ leftover vanishes. Pick the matching equation.',
  steps: [
    {
      ask: 'Central difference at step $h$ carries an $O(h^{2})$ leftover. Schematically…',
      choices: [
        {
          label: '$D(h)=y\'+\\alpha h^{2}+O(h^{4})$',
          ok: true,
        },
        {
          label: '$D(h)=y\'+\\alpha h+O(h^{2})$',
          ok: false,
        },
        {
          label: '$D(h)=y\'-\\alpha h^{2}$ exactly (no higher terms)',
          ok: false,
        },
      ],
      caption: 'Halve the step: the $h^{2}$ piece shrinks by $4$.',
    },
    {
      ask: 'At step $h/2$, the same expansion becomes…',
      choices: [
        {
          label:
            '$D(h/2)=y\'+\\alpha(h/2)^{2}+O(h^{4})=y\'+(\\alpha h^{2})/4+O(h^{4})$',
          ok: true,
        },
        {
          label:
            '$D(h/2)=y\'+\\alpha(h/2)+O(h^{2})=y\'+(\\alpha h)/2$',
          ok: false,
        },
        {
          label:
            '$D(h/2)=y\'+4\\alpha h^{2}+O(h^{4})$',
          ok: false,
        },
      ],
      caption: 'Cancel the shared $\\alpha h^{2}$ coefficient with a linear combo.',
    },
    {
      ask: 'The extrapolated (extended) difference that kills $\\alpha h^{2}$ is…',
      choices: [
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}=\\frac{4\\,D(h/2)-D(h)}{3}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}=\\frac{D(h)-4\\,D(h/2)}{3}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}=\\frac{4\\,D(h)-D(h/2)}{3}$',
          ok: false,
        },
      ],
      caption:
        'Because $4\\cdot(\\alpha h^{2}/4)-\\alpha h^{2}=0$. Leading truncation jumps to $O(h^{4})$.',
    },
    {
      ask: 'Compact one-liner in samples of $y$ (same $D_{\\mathrm{ed}}$) is…',
      choices: [
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}=\\frac{8\\bigl(y(t+h/4)-y(t-h/4)\\bigr)-\\bigl(y(t+h/2)-y(t-h/2)\\bigr)}{3h}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}=\\frac{8\\bigl(y(t+h/4)+y(t-h/4)\\bigr)-\\bigl(y(t+h/2)-y(t-h/2)\\bigr)}{3h}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle D_{\\mathrm{ed}}=\\frac{4\\bigl(y(t+h/4)-y(t-h/4)\\bigr)-\\bigl(y(t+h/2)-y(t-h/2)\\bigr)}{3h}$',
          ok: false,
        },
      ],
      caption:
        'Higher-order stencils amplify noise on measured data — smooth or fit first.',
    },
  ],
};

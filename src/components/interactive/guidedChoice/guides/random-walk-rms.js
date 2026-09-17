/** Random-walk RMS and optional LCG interval map — pick the equation. */

export default {
  title: 'Random-walk distance',
  lead:
    'Expand $R^{2}$, drop cross terms, recover $\\sqrt{N}$. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'After $N$ planar steps, the squared distance from the origin is…',
      choices: [
        {
          label:
            '$\\displaystyle R^{2}=\\Bigl(\\sum_{k=1}^{N}\\Delta x_k\\Bigr)^{2}+\\Bigl(\\sum_{k=1}^{N}\\Delta y_k\\Bigr)^{2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle R^{2}=\\sum_{k=1}^{N}\\bigl(\\Delta x_k^{2}+\\Delta y_k^{2}\\bigr)$ only (no expansion)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle R^{2}=\\Bigl(\\sum_{k=1}^{N}\\Delta x_k\\Bigr)\\Bigl(\\sum_{k=1}^{N}\\Delta y_k\\Bigr)$',
          ok: false,
        },
      ],
      caption: 'Expanding produces diagonal squares and cross terms.',
    },
    {
      ask: 'For isotropic independent steps, the averaged cross terms satisfy…',
      choices: [
        {
          label:
            '$\\displaystyle\\frac{\\langle\\Delta x_i\\Delta x_{j\\neq i}\\rangle}{R^{2}}\\simeq\\frac{\\langle\\Delta x_i\\Delta y_j\\rangle}{R^{2}}\\simeq 0$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\langle\\Delta x_i\\Delta x_{j\\neq i}\\rangle\\simeq R^{2}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\langle\\Delta x_i\\Delta y_j\\rangle\\simeq r_{\\mathrm{rms}}^{2}$',
          ok: false,
        },
      ],
      caption: 'Only the $N$ diagonal contributions survive in $\\langle R^{2}\\rangle$.',
    },
    {
      ask: 'After averaging many walks, the RMS law is…',
      choices: [
        {
          label:
            '$\\displaystyle R_{\\mathrm{rms}}^{2}=\\langle R^{2}\\rangle\\simeq N\\,r_{\\mathrm{rms}}^{2}\\quad\\Rightarrow\\quad R_{\\mathrm{rms}}\\simeq\\sqrt{N}\\,r_{\\mathrm{rms}}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle R_{\\mathrm{rms}}\\simeq N\\,r_{\\mathrm{rms}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle R_{\\mathrm{rms}}^{2}\\simeq r_{\\mathrm{rms}}^{2}/N$',
          ok: false,
        },
      ],
      caption:
        'Mean vector $\\langle\\vec{R}\\rangle\\simeq\\vec{0}$, but the mean length grows like $\\sqrt{N}$.',
    },
    {
      ask: 'Optional: map an LCG draw $r_i\\in[0,1]$ onto a general interval $[A,B]$. Which formula?',
      choices: [
        {
          label: '$\\displaystyle x_i=A+(B-A)\\,r_i$',
          ok: true,
        },
        {
          label: '$\\displaystyle x_i=A+(A-B)\\,r_i$',
          ok: false,
        },
        {
          label: '$\\displaystyle x_i=(B-A)/r_i$',
          ok: false,
        },
      ],
      caption:
        'Same affine map used when seeding walk steps from a unit-interval generator.',
    },
  ],
};

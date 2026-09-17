/** Monte Carlo stone-throwing: pond ratio and π ≈ 4 hits/N — pick the equation. */

export default {
  title: 'Monte Carlo integration',
  lead:
    'Hit fractions to areas to $\\pi$. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'Uniform stones into a known box. The pond-to-box area ratio is…',
      choices: [
        {
          label:
            '$\\displaystyle\\frac{A_{\\mathrm{pond}}}{A_{\\mathrm{box}}}\\simeq\\frac{N_{\\mathrm{pond}}}{N}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\frac{A_{\\mathrm{pond}}}{A_{\\mathrm{box}}}\\simeq\\frac{N}{N_{\\mathrm{pond}}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\frac{A_{\\mathrm{pond}}}{A_{\\mathrm{box}}}\\simeq N_{\\mathrm{pond}}-N$',
          ok: false,
        },
      ],
      caption: 'Rearrange for the unknown pond area.',
    },
    {
      ask: 'Therefore the pond-area estimator is…',
      choices: [
        {
          label:
            '$\\displaystyle A_{\\mathrm{pond}}\\simeq\\frac{N_{\\mathrm{pond}}}{N}\\,A_{\\mathrm{box}}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle A_{\\mathrm{pond}}\\simeq\\frac{N}{N_{\\mathrm{pond}}}\\,A_{\\mathrm{box}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle A_{\\mathrm{pond}}\\simeq N_{\\mathrm{pond}}\\,A_{\\mathrm{box}}$',
          ok: false,
        },
      ],
      caption: 'Unit disk in $[-1,1]^{2}$: box area $4$, disk area $\\pi$.',
    },
    {
      ask: 'Hit fraction estimates disk/square $=\\pi/4$. Which identity?',
      choices: [
        {
          label:
            '$\\displaystyle\\frac{\\pi}{4}\\simeq\\frac{N_{\\mathrm{hit}}}{N}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\frac{\\pi}{2}\\simeq\\frac{N_{\\mathrm{hit}}}{N}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\pi\\simeq\\frac{N_{\\mathrm{hit}}}{N}$',
          ok: false,
        },
      ],
      caption: 'Multiply through by $4$.',
    },
    {
      ask: 'The usual $\\pi$ estimator is therefore…',
      choices: [
        {
          label: '$\\displaystyle\\pi\\simeq 4\\,\\frac{N_{\\mathrm{hit}}}{N}$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\pi\\simeq 2\\,\\frac{N_{\\mathrm{hit}}}{N}$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\pi\\simeq\\frac{N_{\\mathrm{hit}}}{4N}$',
          ok: false,
        },
      ],
      caption:
        'Statistical error $\\sim 1/\\sqrt{N}$ (log–log slope $\\approx-1/2$). In 1D, trap/Simpson/Gauss usually win until round-off; high $D$ flips the comparison.',
    },
  ],
};

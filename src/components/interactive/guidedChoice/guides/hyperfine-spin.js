/** Hyperfine: V matrix → eigenvalues → ΔE = 4W (equation picks). */

export default {
  title: 'Hyperfine spin states',
  lead:
    'Contact interaction $V=W\\,\\boldsymbol\\sigma_e\\!\\cdot\\!\\boldsymbol\\sigma_p$ in the product basis. Pick each matrix / spectrum equation.',
  steps: [
    {
      ask: 'In the ordered product basis $|\\alpha\\alpha\\rangle,|\\alpha\\beta\\rangle,|\\beta\\alpha\\rangle,|\\beta\\beta\\rangle$, the interaction matrix is…',
      choices: [
        {
          label:
            '$\\displaystyle V=\\begin{pmatrix}W&0&0&0\\\\0&-W&2W&0\\\\0&2W&-W&0\\\\0&0&0&W\\end{pmatrix}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle V=W\\,I_{4}$ (all diagonal $W$)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle V=\\begin{pmatrix}-3W&0\\\\0&W\\end{pmatrix}$ only (already $2\\times 2$)',
          ok: false,
        },
      ],
      caption:
        'Outer diagonals: parallel-spin states. Middle $2\\times 2$: antiparallel product states coupled by $2W$.',
    },
    {
      ask: 'Diagonalizing the middle block $\\begin{pmatrix}-W&2W\\\\2W&-W\\end{pmatrix}$ (plus the two outer $+W$) gives eigenvalues…',
      choices: [
        {
          label: '$W$ (threefold, triplet) and $-3W$ (singlet)',
          ok: true,
        },
        {
          label: '$-3W$ (threefold) and $W$ (once)',
          ok: false,
        },
        {
          label: 'four equal eigenvalues $W$',
          ok: false,
        },
      ],
      caption:
        'Middle-block roots are $+W$ and $-3W$; together with the two outer $+W$ levels you get degeneracy $W\\times 3$ and $-3W\\times 1$.',
    },
    {
      ask: 'The hyperfine splitting between triplet and singlet is…',
      choices: [
        {
          label: '$\\displaystyle\\Delta E=W-(-3W)=4W$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\Delta E=W$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\Delta E=2W$',
          ok: false,
        },
      ],
      caption:
        'In hydrogen that gap is the 21 cm / 1420 MHz line once $W$ is restored to lab units. Labs often keep $W=1$ so $\\Delta E/W=4$.',
    },
  ],
};

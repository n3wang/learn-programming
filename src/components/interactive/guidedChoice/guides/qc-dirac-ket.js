/** Dirac inner product and projector — pick the equation. */

export default {
  title: 'Dirac notation for QC',
  lead:
    'QC speaks kets, bras, brackets, and outer-product operators. Pick the matching identities.',
  steps: [
    {
      ask: 'The inner product (bracket) of two states is…',
      choices: [
        {
          label:
            '$\\displaystyle \\langle\\phi\\mid\\psi\\rangle=(\\phi,\\psi)=\\langle\\psi\\mid\\phi\\rangle^{*}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\langle\\phi\\mid\\psi\\rangle=|\\phi\\rangle+|\\psi\\rangle$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\langle\\phi\\mid\\psi\\rangle=|\\phi\\rangle\\langle\\psi|$ (outer product, not scalar)',
          ok: false,
        },
      ],
      caption:
        'Bra $\\langle\\psi|=|\\psi\\rangle^{\\dagger}$. Wave function: $\\psi(x)=\\langle x\\mid\\psi\\rangle$.',
    },
    {
      ask: 'The computational-basis projector $|0\\rangle\\langle 0|$ equals…',
      choices: [
        {
          label:
            '$\\displaystyle |0\\rangle\\langle 0|=\\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle |0\\rangle\\langle 0|=\\begin{bmatrix}0&0\\\\0&1\\end{bmatrix}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle |0\\rangle\\langle 0|=\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$ (identity)',
          ok: false,
        },
      ],
      caption:
        'Outer product $|\\phi\\rangle\\langle\\psi|$ is an operator (maps states to states), not a scalar. Next: Bloch sphere.',
    },
  ],
};

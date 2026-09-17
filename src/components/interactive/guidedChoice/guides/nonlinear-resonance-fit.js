/** Nonlinear least-squares: Newton linearization + FD Jacobian — equation picks. */

export default {
  title: 'Nonlinear least-squares fit',
  lead:
    'Three nonlinear residuals $f_m(a)=0$. Pick the Newton linearization and Jacobian recipe among lookalikes.',
  steps: [
    {
      ask: 'About a guess $\\mathbf a$, the first-order model forced through zero is…',
      choices: [
        {
          label:
            '$\\displaystyle f_i(\\mathbf a+\\Delta\\mathbf a)\\simeq f_i(\\mathbf a)+\\sum_j\\dfrac{\\partial f_i}{\\partial a_j}\\Delta a_j=0$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle f_i(\\mathbf a+\\Delta\\mathbf a)\\simeq f_i(\\mathbf a)$ (ignore the Jacobian)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle f_i(\\mathbf a+\\Delta\\mathbf a)\\simeq\\sum_j a_j$ (no $f_i$)',
          ok: false,
        },
      ],
      caption:
        'In matrix form $F\'\\Delta\\mathbf a=-\\mathbf f$, so $\\Delta\\mathbf a=-(F\')^{-1}\\mathbf f$ (use a linear solve).',
    },
    {
      ask: 'Jacobian entries without hand derivatives use the forward difference…',
      choices: [
        {
          label:
            '$\\displaystyle\\dfrac{\\partial f_i}{\\partial a_j}\\simeq\\dfrac{f_i(a_j+\\Delta a_j)-f_i(a_j)}{\\Delta a_j}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\dfrac{\\partial f_i}{\\partial a_j}\\simeq f_i(a_j)\\,\\Delta a_j$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\dfrac{\\partial f_i}{\\partial a_j}\\equiv 0$ (Newton needs no derivatives)',
          ok: false,
        },
      ],
      caption:
        'Vary one $a_j$ at a time (often $\\le 1\\%$ of its value). Two nested loops fill the $3\\times 3$ Jacobian.',
    },
    {
      ask: 'After each successful linear solve, the parameter update is…',
      choices: [
        {
          label: '$\\displaystyle\\mathbf a\\leftarrow\\mathbf a+\\Delta\\mathbf a$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\mathbf a\\leftarrow\\Delta\\mathbf a$ (discard the old guess)',
          ok: false,
        },
        {
          label: '$\\displaystyle\\mathbf a\\leftarrow\\mathbf a\\cdot\\Delta\\mathbf a$',
          ok: false,
        },
      ],
      caption:
        'Start from a graph-based $(f_r,E_r,\\Gamma)$ guess. Repeat from a grid of starts if local minima worry you.',
    },
  ],
};

/** Jacobian CD for ND Newton + hyperfine spectrum check — equation picks. */

export default {
  title: 'Matrix code sketches',
  lead:
    'ND Newton on string residuals needs a finite-difference Jacobian; hyperfine starts with a spectrum check. Pick the matching equation.',
  steps: [
    {
      ask: 'Column $j$ of the Jacobian of $F:\\mathbb{R}^n\\to\\mathbb{R}^n$ by central differences is…',
      choices: [
        {
          label:
            '$\\displaystyle J_{\\ast j}\\approx\\dfrac{F(\\mathbf x+h\\mathbf e_j)-F(\\mathbf x-h\\mathbf e_j)}{2h}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle J_{\\ast j}\\approx\\dfrac{F(\\mathbf x+h\\mathbf e_j)+F(\\mathbf x-h\\mathbf e_j)}{2h}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle J_{\\ast j}\\approx\\dfrac{F(\\mathbf x+h\\mathbf e_j)-F(\\mathbf x)}{h^{2}}$',
          ok: false,
        },
      ],
      caption:
        'Typical $h\\sim 10^{-4}$ (or scaled). Then solve $J\\Delta\\mathbf x=-F$ and update until $\\|\\Delta\\mathbf x\\|$ and $\\|F\\|$ are tiny.',
    },
    {
      ask: 'Zero-field hyperfine $V$ (gap $4W$) has eigenvalues…',
      choices: [
        {
          label:
            '$\\displaystyle \\{\\lambda\\}=\\{W,W,W,-3W\\}$ so $\\Delta E=4W$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\{\\lambda\\}=\\{4W,0,0,0\\}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\{\\lambda\\}=\\{W,-W,2W,-2W\\}$',
          ok: false,
        },
      ],
      caption:
        'With $B\\neq 0$, add magnetic diagonal terms and re-diagonalize vs $B$. Prefer $\\cos\\theta_i=+\\sqrt{1-\\sin^{2}}$ when $\\cos>0$ in the string sketch.',
    },
  ],
};

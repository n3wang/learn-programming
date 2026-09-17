/** String statics toy: f₁,f₂ system and Newton update — equation picks. */

export default {
  title: 'String statics and Newton',
  lead:
    'Force balance yields $\\mathbf f(\\mathbf x)=\\mathbf 0$. Pick the toy residuals and the Newton step.',
  steps: [
    {
      ask: 'After writing $s=\\sin\\theta$, the identity that removes $\\cos\\theta$ (with a geometric $\\pm$) is…',
      choices: [
        {
          label: '$\\displaystyle c=\\pm\\sqrt{1-s^{2}}$',
          ok: true,
        },
        {
          label: '$\\displaystyle c=1-s$',
          ok: false,
        },
        {
          label: '$\\displaystyle c=s^{2}$',
          ok: false,
        },
      ],
      caption:
        'If the sketch needs $\\cos\\theta>0$ (acute lean), take the positive root. The wrong sign is a different branch.',
    },
    {
      ask: 'The self-contained two-unknown practice system (unit circle ∩ line) is…',
      choices: [
        {
          label:
            '$\\displaystyle f_1=x^{2}+y^{2}-1,\\quad f_2=3x-y-1$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle f_1=x+y,\\quad f_2=x-y$ (linear only)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle f_1=x^{2}-1,\\quad f_2=y$ (decoupled)',
          ok: false,
        },
      ],
      caption:
        'One intersection is $(0.6,0.8)$. From a start near $(0.5,0.5)$, Newton locks onto that root.',
    },
    {
      ask: 'Multidimensional Newton updates the guess by solving…',
      choices: [
        {
          label:
            '$\\displaystyle J\\,\\Delta\\mathbf x=-\\mathbf f$ for the Jacobian $J$ of $\\mathbf f$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\Delta x=-f/f\'$ with a single scalar only (no matrix)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\Delta\\mathbf x=\\mathbf f$ (add the residual raw)',
          ok: false,
        },
      ],
      caption:
        'After convergence still check $T>0$, $|s|,|c|\\le 1$, and that the free-body sketch matches — algebraic roots can be unphysical.',
    },
  ],
};

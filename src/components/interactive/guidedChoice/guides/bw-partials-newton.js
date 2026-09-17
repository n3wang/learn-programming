/** Breit–Wigner ∂g/∂a_m and the three nonlinear residuals f₁,f₂,f₃. */

export default {
  title: 'Breit–Wigner partials and residuals',
  lead:
    'Nonlinear $\\chi^{2}$ for $g=a_1/[(x-a_2)^{2}+a_3]$. Pick the correct partial or residual equation at each step.',
  steps: [
    {
      ask: 'With fit parameters $a_1=f_r$, $a_2=E_r$, $a_3=\\Gamma^{2}/4$, the model is…',
      choices: [
        {
          label:
            '$\\displaystyle g(x)=\\dfrac{a_1}{(x-a_2)^{2}+a_3}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle g(x)=\\dfrac{a_1}{(x-a_2)^{2}-a_3}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle g(x)=\\dfrac{a_1(x-a_2)^{2}}{a_3}$',
          ok: false,
        },
      ],
      caption:
        'Not linear in $a_2$ or $a_3$ — closed-form normal equations do not apply.',
    },
    {
      ask: 'The three partials $\\partial g/\\partial a_m$ needed in the weighted residual sum are…',
      choices: [
        {
          label:
            '$\\displaystyle\\dfrac{\\partial g}{\\partial a_1}=\\dfrac{1}{D},\\;\\dfrac{\\partial g}{\\partial a_2}=\\dfrac{2a_1(x-a_2)}{D^{2}},\\;\\dfrac{\\partial g}{\\partial a_3}=\\dfrac{-a_1}{D^{2}}$ with $D=(x-a_2)^{2}+a_3$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\dfrac{\\partial g}{\\partial a_1}=\\dfrac{1}{D},\\;\\dfrac{\\partial g}{\\partial a_2}=\\dfrac{-2a_1(x-a_2)}{D^{2}},\\;\\dfrac{\\partial g}{\\partial a_3}=\\dfrac{+a_1}{D^{2}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\dfrac{\\partial g}{\\partial a_1}=D,\\;\\dfrac{\\partial g}{\\partial a_2}=2(x-a_2),\\;\\dfrac{\\partial g}{\\partial a_3}=1$',
          ok: false,
        },
      ],
      caption:
        'Careful with signs: $\\partial D/\\partial a_2=-2(x-a_2)$ flips the middle partial. These still depend on the $a$\'s — that is the nonlinearity.',
    },
    {
      ask: 'With $\\sigma_i\\equiv 1$, the three stationarity conditions become the residuals…',
      choices: [
        {
          label:
            '$\\displaystyle f_1=\\sum_i\\dfrac{y_i-g_i}{D_i}=0,\\; f_2=\\sum_i\\dfrac{(y_i-g_i)(x_i-a_2)}{D_i^{2}}=0,\\; f_3=\\sum_i\\dfrac{y_i-g_i}{D_i^{2}}=0$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle f_1=\\sum_i(y_i-g_i)D_i=0,\\; f_2=\\sum_i(y_i-g_i)D_i^{2}=0,\\; f_3=\\sum_i(y_i-g_i)=0$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle f_1=\\sum_i\\dfrac{y_i-g_i}{D_i^{2}}=0,\\; f_2=\\sum_i\\dfrac{y_i-g_i}{D_i}=0,\\; f_3=\\sum_i(y_i-g_i)(x_i-a_2)=0$',
          ok: false,
        },
      ],
      caption:
        'Solve $f_1=f_2=f_3=0$ with multidimensional Newton: linearize, take $\\Delta\\mathbf a$, iterate from a graph-based guess. Jacobian entries via forward differences are fine.',
    },
  ],
};

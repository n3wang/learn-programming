/** χ² stationarity → Breit–Wigner residual equations (lookalike picks). */

export default {
  title: 'χ² stationarity equations',
  lead: 'Pick the correct stationarity / residual formula at each step.',
  steps: [
    {
      ask: 'A critical point of $\\chi^{2}$ requires, for each parameter $a_m$…',
      choices: [
        {
          label: '$\\displaystyle\\dfrac{\\partial\\chi^{2}}{\\partial a_m}=0$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\dfrac{\\partial\\chi^{2}}{\\partial a_m}=1$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\chi^{2}(a)=0$ for every $a$',
          ok: false,
        },
      ],
      caption: 'Regardless of whether $g$ is linear in the $a$\'s.',
    },
    {
      ask: 'That stationarity rearranges to the weighted residual sum…',
      choices: [
        {
          label:
            '$\\displaystyle\\sum_i\\dfrac{y_i-g_i}{\\sigma_i^{2}}\\,\\dfrac{\\partial g_i}{\\partial a_m}=0$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\sum_i (y_i-g_i)\\,\\sigma_i^{2}=0$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\sum_i\\dfrac{\\partial g_i}{\\partial a_m}=0$',
          ok: false,
        },
      ],
      caption: 'For Breit–Wigner $g$, the $\\partial g/\\partial a_m$ still depend on the $a$\'s.',
    },
    {
      ask: 'Those three conditions form the nonlinear system…',
      choices: [
        {
          label:
            '$\\displaystyle f_m(a_1,a_2,a_3)=0\\quad(m=1,2,3)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle A\\mathbf a=\\mathbf b$ (linear normal equations)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle f_1(a_1)=0$ only (one scalar unknown)',
          ok: false,
        },
      ],
      caption:
        'Solve with multidimensional Newton: linearize, take $\\Delta\\mathbf a$, iterate from a graph-based guess.',
    },
  ],
};

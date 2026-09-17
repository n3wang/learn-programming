/** Linear least squares: χ² → stationarity → normal formulas (equation picks). */

export default {
  title: 'Normal equations from $\\chi^{2}$',
  lead:
    'For $g=a_1+a_2 x$, minimize $\\chi^{2}$. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'The goodness-of-fit measure that weights each residual by the point error is…',
      choices: [
        {
          label:
            '$\\displaystyle\\chi^{2}=\\sum_{i}\\left(\\dfrac{y_i-g(x_i)}{\\sigma_i}\\right)^{2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\chi^{2}=\\sum_{i}\\sigma_i\\bigl(y_i-g(x_i)\\bigr)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\chi^{2}=\\prod_{i}(y_i-g(x_i))$',
          ok: false,
        },
      ],
      caption:
        'Noisier points (larger $\\sigma_i$) count less. $\\chi^{2}=0$ only if the curve hits every center.',
    },
    {
      ask: 'Stationarity for each parameter $a_m$ requires…',
      choices: [
        {
          label:
            '$\\displaystyle\\dfrac{\\partial\\chi^{2}}{\\partial a_m}=0\\;\\Rightarrow\\;\\sum_i\\dfrac{y_i-g_i}{\\sigma_i^{2}}\\dfrac{\\partial g_i}{\\partial a_m}=0$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\dfrac{\\partial\\chi^{2}}{\\partial a_m}=0\\;\\Rightarrow\\;\\sum_i\\dfrac{y_i-g_i}{\\sigma_i}\\dfrac{\\partial g_i}{\\partial a_m}=0$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\dfrac{\\partial\\chi^{2}}{\\partial a_m}=0\\;\\Rightarrow\\;\\sum_i(y_i-g_i)\\sigma_i^{2}=0$',
          ok: false,
        },
      ],
      caption:
        'For $g=a_1+a_2 x$: $\\partial g/\\partial a_1=1$, $\\partial g/\\partial a_2=x$ — independent of the $a$\'s, so the system is linear.',
    },
    {
      ask: 'With weighted sums $S,S_x,S_{xx},S_y,S_{xy}$ and $\\Delta=SS_{xx}-S_x^{2}$, the minimizing intercept and slope are…',
      choices: [
        {
          label:
            '$\\displaystyle a_1=\\dfrac{S_{xx}S_y-S_x S_{xy}}{\\Delta},\\quad a_2=\\dfrac{S S_{xy}-S_x S_y}{\\Delta}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle a_1=S_y,\\quad a_2=S_x$ (raw sums, no $\\Delta$)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle a_1=\\dfrac{S_x S_{xy}}{\\Delta},\\quad a_2=\\dfrac{S_{xx}S_y}{\\Delta}$',
          ok: false,
        },
      ],
      caption:
        'Closed form — no search. Uncertainties follow $\\sigma_{a_1}^{2}=S_{xx}/\\Delta$, $\\sigma_{a_2}^{2}=S/\\Delta$.',
    },
    {
      ask: 'A numerically stabler centered form for the slope uses…',
      choices: [
        {
          label:
            '$\\displaystyle a_2=\\dfrac{S_{xy}}{S_{xx}},\\quad a_1=\\bar y-a_2\\bar x$ with deviations from $(\\bar x,\\bar y)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle a_2=\\dfrac{S_{xx}}{S_{xy}},\\quad a_1=\\bar y-a_2\\bar x$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle a_2=\\dfrac{S_{xy}}{S_{xx}},\\quad a_1=\\bar y+a_2\\bar x$',
          ok: false,
        },
      ],
      caption:
        'Same math, less subtractive cancellation. Exponential decay linearizes next: $\\ln N$ vs $t$.',
    },
  ],
};

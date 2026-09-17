/** Exponential decay → linear fit via ln N (equation picks). */

export default {
  title: 'Exponential decay as a linear fit',
  lead:
    'Lifetime $\\tau$ sits inside an exponential. Pick the equation that linearizes the problem.',
  steps: [
    {
      ask: 'The continuous decay law from $\\Delta N=-N\\,\\Delta t/\\tau$ integrates to…',
      choices: [
        {
          label:
            '$\\displaystyle N(t)=N_0 e^{-t/\\tau}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle N(t)=N_0+t/\\tau$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle N(t)=N_0\\tau^{t}$',
          ok: false,
        },
      ],
      caption:
        'Nonlinear in $\\tau$ as written — closed-form linear regression does not apply to $N(t)$ directly.',
    },
    {
      ask: 'Taking the logarithm yields the straight-line model…',
      choices: [
        {
          label:
            '$\\displaystyle\\ln N(t)=\\ln N_0-\\dfrac{t}{\\tau}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\ln N(t)=N_0-\\tau t$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\ln N(t)=\\dfrac{t}{\\tau}-\\ln N_0$',
          ok: false,
        },
      ],
      caption:
        'Fit $g(t)=a_1+a_2 t$ to $(t_i,\\ln N_i)$: intercept $a_1=\\ln N_0$, slope $a_2=-1/\\tau$.',
    },
    {
      ask: 'After the linear fit, recover lifetime and amplitude via…',
      choices: [
        {
          label:
            '$\\displaystyle\\tau=-1/a_2,\\qquad N_0=e^{a_1}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\tau=a_2,\\qquad N_0=a_1$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\tau=e^{a_2},\\qquad N_0=-a_1$',
          ok: false,
        },
      ],
      caption:
        'Rule of thumb: a good fit has $\\chi^{2}\\simeq N_D-M_P$. If a parameter sits inside a nonlinear function of $x$ with no log trick, you need a search (nonlinear least squares).',
    },
  ],
};

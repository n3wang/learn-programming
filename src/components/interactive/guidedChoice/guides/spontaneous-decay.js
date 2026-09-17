/** Spontaneous decay: P=−λ → dN/dt → exponential — pick the equation. */

export default {
  title: 'Spontaneous decay',
  lead:
    'Discrete hazard to continuum exponential. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'Constant decay probability per unit time for each survivor is written…',
      choices: [
        {
          label:
            '$\\displaystyle\\mathcal{P}=\\frac{\\Delta N(t)/N(t)}{\\Delta t}=-\\lambda$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\mathcal{P}=\\frac{\\Delta N(t)/N(t)}{\\Delta t}=+\\lambda$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\mathcal{P}=\\frac{\\Delta N(t)}{\\Delta t}=-\\lambda$',
          ok: false,
        },
      ],
      caption: 'Minus sign: $\\Delta N$ counts particles lost.',
    },
    {
      ask: 'Rearrange to a finite-difference activity law:',
      choices: [
        {
          label: '$\\displaystyle\\frac{\\Delta N(t)}{\\Delta t}=-\\lambda N(t)$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\frac{\\Delta N(t)}{\\Delta t}=-\\lambda/N(t)$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\frac{\\Delta N(t)}{\\Delta t}=+\\lambda N(t)$',
          ok: false,
        },
      ],
      caption: 'Simulable: $\\Delta N$ in one step is random; the mean over samples tracks $-\\lambda N$.',
    },
    {
      ask: 'As $N\\to\\infty$ and $\\Delta t\\to 0$, the continuum ODE is…',
      choices: [
        {
          label: '$\\displaystyle\\frac{dN}{dt}=-\\lambda N$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\frac{dN}{dt}=+\\lambda N$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\frac{dN}{dt}=-\\lambda/N$',
          ok: false,
        },
      ],
      caption: 'Solve with $N(0)$ given.',
    },
    {
      ask: 'The exponential solution (with $\\tau=1/\\lambda$) is…',
      choices: [
        {
          label:
            '$\\displaystyle N(t)=N(0)e^{-\\lambda t}=N(0)e^{-t/\\tau}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle N(t)=N(0)e^{+\\lambda t}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle N(t)=N(0)\\bigl(1-\\lambda t\\bigr)$ only',
          ok: false,
        },
      ],
      caption:
        'Activity $dN/dt=-\\lambda N(0)e^{-\\lambda t}$. Exponential is the large-$N$ envelope, not every small sample path.',
    },
  ],
};

/** MSE, SGD, sigmoid derivative — pick the equation. */

export default {
  title: 'Loss, backprop, SGD',
  lead:
    'Train by lowering Loss, then step against the gradient. Pick the matching training equations.',
  steps: [
    {
      ask: 'Mean squared error Loss over $N$ samples with correct $y^{(c)}$ and prediction $y^{(p)}$ is…',
      choices: [
        {
          label:
            '$\\displaystyle \\mathcal{L}=\\dfrac{1}{N}\\sum_{i=1}^{N}\\bigl(y_i^{(c)}-y_i^{(p)}\\bigr)^{2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\mathcal{L}=\\dfrac{1}{N}\\sum_{i=1}^{N}\\bigl|y_i^{(c)}-y_i^{(p)}\\bigr|$ (L1, not MSE)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\mathcal{L}=\\sum_{i=1}^{N}\\bigl(y_i^{(c)}-y_i^{(p)}\\bigr)$ (no square, no $1/N$)',
          ok: false,
        },
      ],
      caption:
        'All-zero predictions on balanced $\\pi/\\mu$ labels give $\\mathcal{L}=0.5$. Next — how weights move.',
    },
    {
      ask: 'Stochastic gradient descent with learning rate $\\eta>0$ updates a weight by…',
      choices: [
        {
          label:
            '$\\displaystyle w^{(\\mathrm{new})}\\simeq w^{(\\mathrm{old})}-\\eta\\,\\dfrac{\\partial\\mathcal{L}}{\\partial w}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle w^{(\\mathrm{new})}\\simeq w^{(\\mathrm{old})}+\\eta\\,\\dfrac{\\partial\\mathcal{L}}{\\partial w}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle w^{(\\mathrm{new})}\\simeq \\eta\\,\\dfrac{\\partial\\mathcal{L}}{\\partial w}$ (drop the old weight)',
          ok: false,
        },
      ],
      caption:
        'If $\\partial\\mathcal{L}/\\partial w_1>0$, decrease $w_1$. Backprop applies the chain rule through nested activations.',
    },
    {
      ask: 'For logistic $f(x)=1/(1+e^{-x})$, the derivative identity used in backprop is…',
      choices: [
        {
          label: '$\\displaystyle f\'(x)=f(x)\\bigl(1-f(x)\\bigr)$',
          ok: true,
        },
        {
          label: '$\\displaystyle f\'(x)=f(x)\\bigl(1+f(x)\\bigr)$',
          ok: false,
        },
        {
          label: '$\\displaystyle f\'(x)=1-f(x)^{2}$ (tanh identity, not logistic)',
          ok: false,
        },
      ],
      caption:
        'After $\\mathcal{L}$ is small, test on unseen data — parameter values alone rarely explain the strategy.',
    },
  ],
};

/** Forward pass: Σ, activation, 2–2–1 — pick the equation. */

export default {
  title: 'Forward pass with sigmoid',
  lead:
    'A node computes an affine map then an activation. Pick the matching formulas for a shallow net.',
  steps: [
    {
      ask: 'One AI neuron with inputs $x_1,x_2$, weights $w_1,w_2$, and bias $b$ computes…',
      choices: [
        {
          label:
            '$\\displaystyle y=f(w_1 x_1+w_2 x_2+b),\\qquad \\Sigma=w_1 x_1+w_2 x_2$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y=f(w_1+w_2+b)\\,x_1 x_2$ (weights outside the product)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle y=w_1 x_1+w_2 x_2$ (no activation, no bias)',
          ok: false,
        },
      ],
      caption:
        'Soft activations train more easily than hard $0/1$ thresholds. Logistic: $f(z)=1/(1+e^{-z})$.',
    },
    {
      ask: 'Logistic sigmoid activation is…',
      choices: [
        {
          label: '$\\displaystyle f(z)=\\dfrac{1}{1+e^{-z}}$',
          ok: true,
        },
        {
          label: '$\\displaystyle f(z)=\\dfrac{1}{1+e^{z}}$',
          ok: false,
        },
        {
          label: '$\\displaystyle f(z)=\\max(0,z)$ (ReLU, not logistic)',
          ok: false,
        },
      ],
      caption:
        'Maps $\\mathbb{R}\\to(0,1)$. Hand check: $w=(-1,1)$, $x=(12,8)$, $b=0$ → $\\Sigma=-4$.',
    },
    {
      ask: 'In a 2–2–1 net, hidden units and output are…',
      choices: [
        {
          label:
            '$\\displaystyle h_1=f(w_1 x_1+w_2 x_2+b_1),\\; h_2=f(w_3 x_1+w_4 x_2+b_2),\\; y=f(w_5 h_1+w_6 h_2+b_3)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y=f(w_5 x_1+w_6 x_2+b_3)$ (skip the hidden layer)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle h_1=f(x_1),\\; h_2=f(x_2),\\; y=h_1+h_2$ (no learned weights)',
          ok: false,
        },
      ],
      caption:
        'Output neuron sees activations $h_1,h_2$, not the raw $x$\'s. Identical $(w_a,w_b)=(0,1)$ with $x=(2,3)$ gives $y\\approx 0.7216$.',
    },
  ],
};

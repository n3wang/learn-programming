/** Lagrange basis: pick λ_i product and the interpolant sum. */

export default {
  title: 'Lagrange basis product',
  lead:
    'Build a polynomial that hits every node. At each step pick the matching equation (lookalikes included).',
  steps: [
    {
      ask: 'Any interpolant through the nodes can be written as a weighted sum of basis functions. Which form?',
      choices: [
        {
          label:
            '$\\displaystyle g(x)\\simeq\\sum_{i=1}^{n} g_i\\lambda_i(x)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle g(x)\\simeq\\prod_{i=1}^{n} g_i\\lambda_i(x)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle g(x)\\simeq g_1+\\lambda_1(x)$ only',
          ok: false,
        },
      ],
      caption:
        'Need $\\lambda_i(x_k)=\\delta_{ik}$: each basis is $1$ at its own node and $0$ at every other tabulated $x_j$.',
    },
    {
      ask: 'The product that vanishes at every $x_j$ with $j\\neq i$, then normalized at $x_i$, is…',
      choices: [
        {
          label:
            '$\\displaystyle\\lambda_i(x)=\\prod_{j\\neq i}\\dfrac{x-x_j}{x_i-x_j}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\lambda_i(x)=\\prod_{j\\neq i}(x-x_j)$ (no denominator)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\lambda_i(x)=\\dfrac{x-x_i}{x_i-x_j}$ (single factor only)',
          ok: false,
        },
      ],
      caption:
        'At $x=x_i$ every factor is $1$; at another node one numerator vanishes. Nodes need not be evenly spaced.',
    },
    {
      ask: 'With $n$ distinct nodes, each $\\lambda_i$ (and the sum) has degree…',
      choices: [
        {label: '$n-1$', ok: true},
        {label: '$n$', ok: false},
        {label: '$2n-1$', ok: false},
      ],
      caption:
        'Three points ⇒ parabola; nine points ⇒ degree $8$. Local low-$n$ fits stay tame; one global high-degree sum through noisy data tends to oscillate (Runge).',
    },
  ],
};

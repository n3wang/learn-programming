/** Gauss–Legendre derivation: pick the right equation after each sentence. */

export default {
  title: 'Gauss–Legendre derivation',
  lead:
    'Each step states a goal; pick the matching equation among three lookalikes.',
  steps: [
    {
      ask: 'Want $N$ nodes so the rule below is exact for every polynomial $f$ of degree $\\le 2N-1$. Which equation is that goal?',
      choices: [
        {
          label:
            '$\\displaystyle\\int_{-1}^{1} f(x)\\,\\mathrm{d}x=\\sum_{i=1}^{N} w_i f(x_i)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\int_{-1}^{1} f(x)\\,\\mathrm{d}x=\\sum_{i=1}^{N} f(x_i)$ (no weights)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\int_{0}^{1} f(x)\\,\\mathrm{d}x=\\sum_{i=1}^{N} w_i f(x_i)$',
          ok: false,
        },
      ],
      caption:
        'Legendre $P_N$: orthogonal on $[-1,1]$ to every polynomial of degree $<N$, and has $N$ real roots in $(-1,1)$.',
    },
    {
      ask: 'Divide $f$ by $P_N$. Which polynomial division identity do we use?',
      choices: [
        {label: '$f(x)=q(x)P_N(x)+r(x)$', ok: true},
        {label: '$f(x)=q(x)+P_N(x)\\,r(x)$', ok: false},
        {label: '$f(x)=q(x)P_N(x)-r(x)$', ok: false},
      ],
      caption:
        'Here $\\deg r < N$ (often written $\\le N-1$; the sketch’s $\\deg r\\le N$ is the same spirit when counting exactness). For $\\deg f\\le 2N-1$, $\\deg q\\le N-1$.',
    },
    {
      ask: 'Orthogonality kills $\\int q P_N$, so the integral of $f$ collapses to…',
      choices: [
        {
          label: '$\\displaystyle\\int_{-1}^{1} f=\\int_{-1}^{1} r$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\int_{-1}^{1} f=\\int_{-1}^{1} q$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\int_{-1}^{1} f=\\int_{-1}^{1} q P_N$',
          ok: false,
        },
      ],
      caption:
        'The remainder $r$ has degree $<N$, so an $N$-point rule can integrate it exactly.',
    },
    {
      ask: 'Substitute $f=q P_N+r$ into the discrete sum. Which expansion is correct?',
      choices: [
        {
          label:
            '$\\displaystyle\\sum_i w_i f(x_i)=\\sum_i w_i q(x_i)P_N(x_i)+\\sum_i w_i r(x_i)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\sum_i w_i f(x_i)=\\sum_i w_i q(x_i)+\\sum_i w_i r(x_i)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\sum_i w_i f(x_i)=\\sum_i w_i q(x_i)P_N(x_i)-\\sum_i w_i r(x_i)$',
          ok: false,
        },
      ],
      caption:
        'Choose nodes as the zeros of $P_N$: then $P_N(x_i)=0$ and the $q$ term vanishes. What remains is exact for $r$, hence for every $f$ of degree $\\le 2N-1$. Weights follow from orthogonal-polynomial identities.',
    },
  ],
};

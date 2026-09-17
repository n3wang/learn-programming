/** Weiss mean-field reduction to m = tanh(m/t) — equation picks. */

export default {
  title: 'Weiss reduction to $m(t)$',
  lead:
    'Mean-field magnetism starts as $M=N\\mu\\tanh(\\lambda\\mu M/k_B T)$. Strip it to a one-variable residual — pick each equation.',
  steps: [
    {
      ask: 'Reduced magnetization, reduced temperature, and Curie temperature are defined as…',
      choices: [
        {
          label:
            '$\\displaystyle m=\\dfrac{M}{N\\mu},\\quad t=\\dfrac{T}{T_c},\\quad T_c=\\dfrac{N\\mu^{2}\\lambda}{k_B}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle m=M,\\quad t=T,\\quad T_c=k_B$ only',
          ok: false,
        },
        {
          label:
            '$\\displaystyle m=N\\mu M,\\quad t=T_c/T$',
          ok: false,
        },
      ],
      caption:
        'Then $|m|\\le 1$ and the argument of $\\tanh$ becomes $m\\,T_c/T=m/t$.',
    },
    {
      ask: 'With those reductions, the self-consistency equation collapses to…',
      choices: [
        {label: '$\\displaystyle m=\\tanh(m/t)$', ok: true},
        {label: '$\\displaystyle m=t$ with no $\\tanh$', ok: false},
        {label: '$\\displaystyle M=k_B T$ only', ok: false},
      ],
      caption:
        'Still transcendental: $m$ sits inside $\\tanh$.',
    },
    {
      ask: 'The residual used for root-finding at fixed $t$ is…',
      choices: [
        {
          label: '$\\displaystyle f(m,t)=m-\\tanh(m/t)$',
          ok: true,
        },
        {
          label: '$\\displaystyle f(m,t)=m+\\tanh(m/t)$',
          ok: false,
        },
        {
          label: '$\\displaystyle f(m,t)=\\tanh(t/m)-1$',
          ok: false,
        },
      ],
      caption:
        'Linearizing near $m=0$ shows spontaneous order $m>0$ only for $t<1$. At $t=0.5$ the nontrivial root is $m\\approx 0.9575$.',
    },
  ],
};

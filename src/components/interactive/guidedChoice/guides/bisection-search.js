/** Bisection: sign condition and keep-the-signed-half — equation picks. */

export default {
  title: 'Bisection search',
  lead:
    'Trap a root without derivatives. Pick the sign condition and update rule among lookalikes.',
  steps: [
    {
      ask: 'The intermediate-value guarantee that a continuous $f$ has a root in $(x_{-},x_{+})$ requires…',
      choices: [
        {
          label: '$\\displaystyle f(x_{-})\\,f(x_{+})<0$',
          ok: true,
        },
        {
          label: '$\\displaystyle f(x_{-})+f(x_{+})=0$',
          ok: false,
        },
        {
          label: '$\\displaystyle f\'(x_{-})\\,f\'(x_{+})<0$',
          ok: false,
        },
      ],
      caption:
        'Opposite signs at the bracket ends. Poles of $\\tan/\\cot$ can fake sign changes — prefer a smooth residual when possible.',
    },
    {
      ask: 'At the midpoint $x=(x_{-}+x_{+})/2$, if $f(x_{-})\\,f(x)<0$ you…',
      choices: [
        {
          label: 'set $x_{+}\\leftarrow x$ (root still in the left half)',
          ok: true,
        },
        {
          label: 'always set $x_{-}\\leftarrow x$ regardless of signs',
          ok: false,
        },
        {
          label: 'stop — the midpoint is exact for every $f$',
          ok: false,
        },
      ],
      caption:
        'Keep the half on which the endpoint product stays negative. The other half cannot contain that sign change.',
    },
    {
      ask: 'After $N$ successful halvings of an interval of width $W$, the uncertainty scales as…',
      choices: [
        {
          label: '$\\displaystyle W/2^{N}$',
          ok: true,
        },
        {
          label: '$\\displaystyle W/N!$',
          ok: false,
        },
        {
          label: '$\\displaystyle W\\cdot N$',
          ok: false,
        },
      ],
      caption:
        'Linear convergence — slower than Newton near a simple root, but the method never leaves a valid bracket.',
    },
  ],
};

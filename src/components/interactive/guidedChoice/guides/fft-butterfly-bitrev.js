/** FFT butterfly yₚ±Z y_q — pick the equation. */

export default {
  title: 'FFT butterfly and bit reversal',
  lead:
    'Reuse twiddle periodicity: $O(N^{2})$ DFT → $O(N\\log_2 N)$ FFT. Pick the butterfly map.',
  steps: [
    {
      ask: 'The radix-2 butterfly maps a pair $(y_p,y_q)$ with twiddle $Z$ to…',
      choices: [
        {
          label:
            '$\\displaystyle (y_p,y_q)\\mapsto\\bigl(y_p+Z y_q,\\; y_p-Z y_q\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle (y_p,y_q)\\mapsto\\bigl(y_p+Z y_q,\\; y_p+Z y_q\\bigr)$ (same wing twice)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle (y_p,y_q)\\mapsto\\bigl(Z y_p+y_q,\\; Z y_p-y_q\\bigr)$',
          ok: false,
        },
      ],
      caption:
        'Here $Z=e^{-2\\pi i/N}$. For $N=8$, only four independent $Z$ powers matter. $\\log_2 N$ stages of $O(N)$ butterflies ⇒ $O(N\\log N)$.',
    },
    {
      ask: 'After natural-order radix-2 stages, output indices appear in bit-reversed order. For $N=8$, that sequence is…',
      choices: [
        {
          label: '$0,4,2,6,1,5,3,7$',
          ok: true,
        },
        {
          label: '$0,1,2,3,4,5,6,7$ (natural order)',
          ok: false,
        },
        {
          label: '$0,2,4,6,1,3,5,7$ (even-then-odd only)',
          ok: false,
        },
      ],
      caption:
        'Equivalently bit-reverse the inputs and read a natural spectrum. Production FFTs hide the shuffle; know it exists when comparing hand butterflies to library `fft`.',
    },
  ],
};
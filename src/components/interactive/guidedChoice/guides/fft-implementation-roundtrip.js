/** Implement FFT: power-of-two, bitrev, round-trip. */

export default {
  title: 'FFT implementation and round-trip',
  lead:
    'Radix-2 needs $N=2^n$. Pad or wrap to the next power of two, bit-reverse, then $\\log_2 N$ butterfly stages.',
  steps: [
    {
      caption:
        'Book probe $y_m=m+mi$ ($m=0..15$) has unnormalized DC $Y_0=120+120i$. Physics convention multiplies by $1/\\sqrt{2\\pi}$.',
    },
    {
      ask: 'A fair assessment of your FFT is to…',
      choices: [
        {
          label: 'iFFT back to $y$ (check residual) and time vs a direct DFT',
          ok: true,
        },
        {label: 'Only print N and quit', ok: false},
        {label: 'Skip inverses because FFTs cannot invert', ok: false},
      ],
      caption:
        'Keep norms consistent ($1/N$ on inverse; optional $1/\\sqrt{2\\pi}$). Prefer library FFTs in production after you understand one tiny inplace sketch.',
    },
  ],
};

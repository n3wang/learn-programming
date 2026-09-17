/** DFT sum and Nyquist — pick the equation. */

export default {
  title: 'DFT, Nyquist, and aliasing',
  lead:
    '$N$ samples spaced by $h$ imply $T=Nh$ and $s=1/h$. Pick the matching discrete formulas.',
  steps: [
    {
      ask: 'Trapezoid on a period-$T$ window yields the DFT sum. Which formula for $Y_n$?',
      choices: [
        {
          label:
            '$\\displaystyle Y_n=\\dfrac{1}{\\sqrt{2\\pi}}\\sum_{k=0}^{N-1} y_k\\,e^{-2\\pi i kn/N}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle Y_n=\\dfrac{1}{\\sqrt{2\\pi}}\\sum_{k=0}^{N-1} y_k\\,e^{+2\\pi i kn/N}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle Y_n=\\sum_{k=0}^{N-1} y_k\\,e^{-2\\pi i kn/N}$ (no $1/\\sqrt{2\\pi}$)',
          ok: false,
        },
      ],
      caption:
        'Bins: $\\omega_n=n\\,2\\pi/T$. Longer $T$ densifies frequency; smaller $h$ raises the Nyquist limit.',
    },
    {
      ask: 'Nyquist: to avoid aliasing, keep no content above…',
      choices: [
        {
          label: '$\\displaystyle f_{\\mathrm{Nyq}}=\\dfrac{s}{2}=\\dfrac{1}{2h}$',
          ok: true,
        },
        {
          label: '$\\displaystyle f_{\\mathrm{Nyq}}=s=\\dfrac{1}{h}$',
          ok: false,
        },
        {
          label: '$\\displaystyle f_{\\mathrm{Nyq}}=\\dfrac{2\\pi}{T}$ (fundamental only)',
          ok: false,
        },
      ],
      caption:
        'Content above $s/2$ folds: $f$ and $f-2s$ can share samples. Filter first or shrink $h$. Naive DFT is $O(N^{2})$.',
    },
  ],
};

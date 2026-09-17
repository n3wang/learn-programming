/** Continuous FT pair: forward + inverse Y(ω) — pick the equation. */

export default {
  title: 'Fourier transform pair',
  lead:
    'Nonperiodic signals use a continuum of frequencies. Physics convention places $1/\\sqrt{2\\pi}$ on both sides — pick the matching integral.',
  steps: [
    {
      ask: 'Inverse transform: write $y(t)$ as a continuous superposition of complex exponentials. Which formula?',
      choices: [
        {
          label:
            '$\\displaystyle y(t)=\\int_{-\\infty}^{+\\infty} Y(\\omega)\\,\\dfrac{e^{i\\omega t}}{\\sqrt{2\\pi}}\\,\\mathrm{d}\\omega$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y(t)=\\int_{-\\infty}^{+\\infty} Y(\\omega)\\,\\dfrac{e^{-i\\omega t}}{\\sqrt{2\\pi}}\\,\\mathrm{d}\\omega$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle y(t)=\\int_{-\\infty}^{+\\infty} Y(\\omega)\\,e^{i\\omega t}\\,\\mathrm{d}\\omega$ (no $1/\\sqrt{2\\pi}$)',
          ok: false,
        },
      ],
      caption:
        'Engineering often parks a single $1/(2\\pi)$ on one side. Keep exponent signs consistent with the forward transform.',
    },
    {
      ask: 'Forward transform: spectral amplitude $Y(\\omega)$ from $y(t)$. Which integral?',
      choices: [
        {
          label:
            '$\\displaystyle Y(\\omega)=\\int_{-\\infty}^{+\\infty} y(t)\\,\\dfrac{e^{-i\\omega t}}{\\sqrt{2\\pi}}\\,\\mathrm{d}t$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle Y(\\omega)=\\int_{-\\infty}^{+\\infty} y(t)\\,\\dfrac{e^{i\\omega t}}{\\sqrt{2\\pi}}\\,\\mathrm{d}t$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle Y(\\omega)=\\dfrac{1}{2\\pi}\\int_{-\\infty}^{+\\infty} y(t)\\,e^{-i\\omega t}\\,\\mathrm{d}t$',
          ok: false,
        },
      ],
      caption:
        'Plot power $|Y|^{2}$ (often semilog). Consistency of the pair uses $\\int e^{i(\\omega\'-\\omega)t}\\,\\mathrm{d}t=2\\pi\\,\\delta(\\omega\'-\\omega)$.',
    },
  ],
};

/** CWT definition + daughters — pick the equation. */

export default {
  title: 'Continuous wavelet transform',
  lead:
    'Replace STFT exponentials by localized $\\psi_{s,\\tau}$. Pick the CWT definition and daughter formula.',
  steps: [
    {
      ask: 'The continuous wavelet transform measures overlap of $y$ with a packet of scale $s$ at time $\\tau$. Which integral?',
      choices: [
        {
          label:
            '$\\displaystyle Y(s,\\tau)=\\int_{-\\infty}^{+\\infty} \\psi_{s,\\tau}^{*}(t)\\,y(t)\\,\\mathrm{d}t$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle Y(s,\\tau)=\\int_{-\\infty}^{+\\infty} \\psi_{s,\\tau}(t)\\,y^{*}(t)\\,\\mathrm{d}t$ (conjugates swapped)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle Y(s,\\tau)=\\psi_{s,\\tau}(0)\\,y(\\tau)$ (no integral)',
          ok: false,
        },
      ],
      caption:
        'Scale–frequency map: $\\omega=2\\pi/s$. Small $s$ ⇒ high $\\omega$ ⇒ fine detail.',
    },
    {
      ask: 'Daughters from a mother $\\Psi$ are…',
      choices: [
        {
          label:
            '$\\displaystyle \\psi_{s,\\tau}(t)=\\dfrac{1}{\\sqrt{s}}\\,\\Psi\\!\\left(\\dfrac{t-\\tau}{s}\\right)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\psi_{s,\\tau}(t)=\\sqrt{s}\\,\\Psi\\!\\left(\\dfrac{t-\\tau}{s}\\right)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\psi_{s,\\tau}(t)=\\Psi(st-\\tau)$ (wrong scaling)',
          ok: false,
        },
      ],
      caption:
        'Mothers need zero mean (and often vanishing moments). Invert on a dense $(s,\\tau)$ grid to check reconstruction.',
    },
  ],
};

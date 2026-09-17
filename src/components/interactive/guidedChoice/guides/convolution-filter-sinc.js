/** Convolution filter, theorem, RC H_lp/H_hp, rect→sinc — pick the equation. */

export default {
  title: 'Convolution filters and sinc',
  lead:
    'A linear filter is $g=f*h$. At each step pick the matching equation among lookalikes.',
  steps: [
    {
      ask: 'Time-domain filtering: output $g$ from input $f$ and impulse response $h$. Which definition?',
      choices: [
        {
          label:
            '$\\displaystyle g(t)=\\int_{-\\infty}^{+\\infty} f(\\tau)\\,h(t-\\tau)\\,\\mathrm{d}\\tau\\equiv f*h$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle g(t)=\\int_{-\\infty}^{+\\infty} f(\\tau)\\,h(t+\\tau)\\,\\mathrm{d}\\tau$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle g(t)=f(t)\\,h(t)$ (pointwise product, no integral)',
          ok: false,
        },
      ],
      caption:
        'Causality: $h(\\tau)=0$ for effects before causes. Next — frequency domain.',
    },
    {
      ask: 'Convolution theorem (physics normalization of §9.2–9.4). Which formula?',
      choices: [
        {
          label: '$\\displaystyle G(\\omega)=\\sqrt{2\\pi}\\,F(\\omega)\\,H(\\omega)$',
          ok: true,
        },
        {
          label: '$\\displaystyle G(\\omega)=F(\\omega)+H(\\omega)$',
          ok: false,
        },
        {
          label: '$\\displaystyle G(\\omega)=F(\\omega)/H(\\omega)$',
          ok: false,
        },
      ],
      caption:
        'Multiply spectra, then inverse-transform — often cheaper than a long time convolution.',
    },
    {
      ask: 'Analog RC lowpass and highpass ($\\tau=RC$) are…',
      choices: [
        {
          label:
            '$\\displaystyle H_{\\mathrm{lp}}=\\dfrac{1}{1+i\\omega\\tau},\\qquad H_{\\mathrm{hp}}=\\dfrac{i\\omega\\tau}{1+i\\omega\\tau}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle H_{\\mathrm{lp}}=\\dfrac{i\\omega\\tau}{1+i\\omega\\tau},\\qquad H_{\\mathrm{hp}}=\\dfrac{1}{1+i\\omega\\tau}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle H_{\\mathrm{lp}}=1+i\\omega\\tau,\\qquad H_{\\mathrm{hp}}=1-i\\omega\\tau$',
          ok: false,
        },
      ],
      caption:
        '$|H_{\\mathrm{lp}}|$ falls as $\\omega$ grows; $|H_{\\mathrm{hp}}|\\to 1$ at large $\\omega$ and vanishes at $\\omega=0$.',
    },
    {
      ask: 'An ideal lowpass is a rectangle in frequency. Its impulse response is proportional to…',
      choices: [
        {
          label:
            '$\\displaystyle H(\\omega)=\\mathrm{rect}\\!\\left(\\dfrac{\\omega}{2\\omega_c}\\right)\\quad\\longleftrightarrow\\quad h(t)\\propto\\mathrm{sinc}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle H(\\omega)=\\mathrm{rect}\\!\\left(\\dfrac{\\omega}{2\\omega_c}\\right)\\quad\\longleftrightarrow\\quad h(t)\\propto\\delta(t)$ only',
          ok: false,
        },
        {
          label:
            '$\\displaystyle H(\\omega)=\\mathrm{sinc}(\\omega)\\quad\\longleftrightarrow\\quad h(t)\\propto\\mathrm{rect}$ (roles swapped)',
          ok: false,
        },
      ],
      caption:
        'Truncate the sinc and apply a Hamming window to soften Gibbs. Same tool pretreats signals before a DFT.',
    },
  ],
};

/** Wave-packet uncertainty Δt Δω ≳ 2π — pick the equation. */

export default {
  title: 'Wave packets and uncertainty',
  lead:
    'An $N$-cycle sine burst has finite $\\Delta t$ and finite $\\Delta\\omega$. Pick the Fourier uncertainty bound.',
  steps: [
    {
      ask: 'Combining $\\Delta t\\approx N\\cdot 2\\pi/\\omega_0$ with $\\Delta\\omega\\approx\\omega_0/N$ gives…',
      choices: [
        {
          label: '$\\displaystyle \\Delta t\\,\\Delta\\omega \\gtrsim 2\\pi$',
          ok: true,
        },
        {
          label: '$\\displaystyle \\Delta t\\,\\Delta\\omega \\lesssim 2\\pi$',
          ok: false,
        },
        {
          label: '$\\displaystyle \\Delta t\\,\\Delta\\omega = 0$ for every finite packet',
          ok: false,
        },
      ],
      caption:
        'Sharper in time ⇒ broader in frequency. A pure eternal sine has $\\Delta\\omega\\to 0$ and $\\Delta t\\to\\infty$.',
    },
    {
      ask: 'More generally one writes…',
      choices: [
        {
          label: '$\\displaystyle \\Delta t\\,\\Delta\\omega \\ge 2\\pi C$',
          ok: true,
        },
        {
          label: '$\\displaystyle \\Delta t\\,\\Delta\\omega \\ge C/\\omega_0$ only',
          ok: false,
        },
        {
          label: '$\\displaystyle \\Delta t+\\Delta\\omega \\ge 2\\pi$',
          ok: false,
        },
      ],
      caption:
        'Estimate $C$ from FWHMs on Gaussians / Morlets / Mexican hats in the labs. Same bound tiles spectrograms and wavelet scalograms.',
    },
  ],
};

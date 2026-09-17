/** STFT integral with sliding window — pick the equation. */

export default {
  title: 'Short-time Fourier window',
  lead:
    'Slide $w(t-\\tau)$ across $y(t)$ and Fourier-transform each chunk. Pick the STFT integral.',
  steps: [
    {
      ask: 'The short-time Fourier transform $Y^{(\\mathrm{ST})}(\\omega,\\tau)$ is…',
      choices: [
        {
          label:
            '$\\displaystyle Y^{(\\mathrm{ST})}(\\omega,\\tau)=\\int_{-\\infty}^{+\\infty}\\dfrac{e^{i\\omega t}}{\\sqrt{2\\pi}}\\,w(t-\\tau)\\,y(t)\\,\\mathrm{d}t$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle Y^{(\\mathrm{ST})}(\\omega,\\tau)=\\int_{-\\infty}^{+\\infty}\\dfrac{e^{i\\omega t}}{\\sqrt{2\\pi}}\\,y(t)\\,\\mathrm{d}t$ (no window)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle Y^{(\\mathrm{ST})}(\\omega,\\tau)=w(\\tau)\\,Y(\\omega)$ (factor out a constant window)',
          ok: false,
        },
      ],
      caption:
        'Only samples under the window contribute. Extra argument $\\tau$ is the window center — display as a spectrogram.',
    },
    {
      ask: 'A fixed STFT window width means…',
      choices: [
        {
          label:
            'the same $\\Delta t$–$\\Delta\\omega$ tradeoff for every frequency band',
          ok: true,
        },
        {
          label: 'infinite time resolution at all $\\omega$',
          ok: false,
        },
        {
          label: 'no uncertainty bound applies',
          ok: false,
        },
      ],
      caption:
        'Wavelets vary scale with frequency (narrow windows for highs, wide for lows). Compression drops small / redundant coeffs within the uncertainty budget.',
    },
  ],
};

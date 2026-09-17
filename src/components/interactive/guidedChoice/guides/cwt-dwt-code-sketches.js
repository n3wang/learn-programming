/** Assemble Morlet CWT + Daub4 pyramid sketches (no VPython). */

export default {
  title: 'Wavelet code sketches',
  lead:
    'Sandbox locks teach kernels; local notebooks need a clear CWT grid and a Daub4 pyramid on a chirp — without pasting textbook VPython listings.',
  steps: [
    {
      caption:
        'CWT: staged $y(t)$, mother $\\Psi(T)=\\sin(8T)e^{-T^2/2}$, Riemann $Y(s,\\tau)=s^{-1/2}\\sum y\\Psi h$. Grow $s$ geometrically; slide $\\tau$ linearly.',
    },
    {
      ask: 'After a Daub4 pyramid on length $2^n$, the safest first check is…',
      choices: [
        {
          label: 'invert (upsample + transpose taps) and compare to the chirp samples',
          ok: true,
        },
        {label: 'delete all detail coefficients immediately', ok: false},
        {label: 'replace Daub4 by a random 4-tap filter', ok: false},
      ],
      caption:
        'Keep transform math; swap VPython `gcurve` / wireframes for Matplotlib or any local plotter. PCA comes after the 1D pipeline is trustworthy.',
    },
  ],
};

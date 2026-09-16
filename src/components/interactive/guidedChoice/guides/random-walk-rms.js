/** Why R_rms grows like √N for a random walk. */

export default {
  title: 'Random-walk distance',
  lead: 'A perfume molecule takes $N$ random unit steps. The vector average vanishes — so why does the molecule still travel?',
  steps: [
    {
      caption: 'Expand $R^{2}=(\\sum\\Delta x)^{2}+(\\sum\\Delta y)^{2}$. Cross terms average to zero for a truly random walk; diagonal terms survive.',
    },
    {
      ask: 'After averaging many walks, the RMS distance from the origin is…',
      choices: [
        {label: '$R_{\\mathrm{rms}}\\simeq\\sqrt{N}\\, r_{\\mathrm{rms}}$', ok: true},
        {label: '$R_{\\mathrm{rms}}\\simeq N\\, r_{\\mathrm{rms}}$ (as if every step went the same way)', ok: false},
        {label: '$R_{\\mathrm{rms}}=0$ because $\\langle\\vec{R}\\rangle=0$', ok: false},
      ],
      caption: 'Displacement vector averages to zero; the length of that vector does not. Diffusion spreads like $\\sqrt{N}$.',
    },
    {
      ask: 'One simulated walk of $N$ steps lands far from $\\sqrt{N}$. That means…',
      choices: [
        {label: 'you need many independent trials — theory is about averages, not every path', ok: true},
        {label: 'the $\\sqrt{N}$ law is wrong', ok: false},
        {label: 'unit-length normalization is forbidden', ok: false},
      ],
      caption: 'Use $K\\approx\\sqrt{N}$ trials with different seeds, then compare $\\langle R^{2}\\rangle^{1/2}$ to $\\sqrt{N}\\, r_{\\mathrm{rms}}$.',
    },
  ],
};

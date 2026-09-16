/** Stop while the log–log error curve is still dropping. */

export default {
  title: 'Where to quit',
  lead: 'A log–log plot of relative error vs $N$ falls steeply, then wobbles upward. You do not know the exact answer $\\mathcal{A}$.',
  steps: [
    {
      caption: 'For moderate $N$, $\\epsilon_{\\mathrm{app}}\\simeq\\alpha/N^{\\beta}$ still dominates, so extra steps buy digits.',
    },
    {
      ask: 'The steep straight drop on $\\log_{10}|\\mathrm{error}|$ vs $\\log_{10} N$ means…',
      choices: [
        {label: 'the algorithm is converging; slope $\\approx -\\beta$', ok: true},
        {label: 'round-off has already taken over', ok: false},
        {label: 'the method cannot converge', ok: false},
      ],
      caption: 'Power-law decay is a straight line on a log–log plot. That is the region where more $N$ still helps.',
    },
    {
      ask: 'You should stop the production run…',
      choices: [
        {label: 'just before the curve flattens and starts a slow, noisy rise', ok: true},
        {label: 'at the largest $N$ the machine can finish overnight', ok: false},
        {label: 'as soon as the first digit looks plausible', ok: false},
      ],
      caption: 'The trough is where $\\epsilon_{\\mathrm{app}}\\simeq\\epsilon_{\\mathrm{ro}}$. Past that, extra steps manufacture round-off.',
    },
  ],
};

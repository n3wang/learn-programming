/** Control variates: estimate residual ∫(f−g) when J=∫g is known. */

export default {
  title: 'Monte Carlo variance reduction',
  lead: 'When f is peaked, uniform samples waste effort — track f with a known g.',
  steps: [
    {
      caption:
        'Rapidly varying $f$ (e.g. a narrow Gaussian on a wide interval) leaves most uniform draws where $f\\approx 0$. Error still $\\sim 1/\\sqrt{N}$, but each sample teaches little.',
    },
    {
      ask: 'A control variate rewrites $I=\\int f$ as…',
      choices: [
        {label: '$\\int(f-g)+J$ with $J=\\int g$ known', ok: true},
        {label: 'Simpson on random LCG nodes', ok: false},
        {label: 'rejection under a box of height $f$', ok: false},
      ],
      caption:
        'Monte Carlo only averages the residual $f-g$. Choose $g$ so $|f-g|\\le\\varepsilon$ and $\\mathrm{Var}(f-g)<\\mathrm{Var}(f)$.',
    },
    {
      ask: 'On $[0,1]$, $f=e^{-x}$ with $g=1-x$ uses $J=$…',
      choices: [
        {label: '$1/2$', ok: true},
        {label: '$1-e^{-1}$', ok: false},
        {label: '$0$', ok: false},
      ],
      caption:
        'Labs compare plain $(1/N)\\sum e^{-x}$ to $(1/N)\\sum(e^{-x}-(1-x))+1/2$ on the same LCG stream.',
    },
  ],
};

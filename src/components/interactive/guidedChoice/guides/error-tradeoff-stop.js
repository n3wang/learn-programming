/** Error tradeoff vs N: pick the matching equation at each step. */

export default {
  title: 'Where to quit',
  lead:
    'Approximation falls, round-off climbs. At each step pick the matching equation (lookalikes included).',
  steps: [
    {
      ask: 'Once $N$ is large, algorithmic (approximation) error typically scales as…',
      choices: [
        {
          label: '$\\displaystyle\\epsilon_{\\mathrm{app}}\\simeq\\frac{\\alpha}{N^{\\beta}}$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\epsilon_{\\mathrm{app}}\\simeq\\alpha N^{\\beta}$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\epsilon_{\\mathrm{app}}\\simeq\\sqrt{N}\\,\\epsilon_m$',
          ok: false,
        },
      ],
      caption: '$\\alpha,\\beta$ are empirical; a falling power law means the algorithm is working.',
    },
    {
      ask: 'Uncorrelated round-off after $N$ steps still looks like a random walk:',
      choices: [
        {
          label: '$\\displaystyle\\epsilon_{\\mathrm{ro}}\\simeq\\sqrt{N}\\,\\epsilon_m$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\epsilon_{\\mathrm{ro}}\\simeq\\epsilon_m/N$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\epsilon_{\\mathrm{ro}}\\simeq\\alpha/N^{\\beta}$',
          ok: false,
        },
      ],
      caption: 'Add the two contributions for a total-error cartoon.',
    },
    {
      ask: 'Total error as a function of $N$ is…',
      choices: [
        {
          label:
            '$\\displaystyle\\epsilon_{\\mathrm{tot}}\\simeq\\frac{\\alpha}{N^{\\beta}}+\\sqrt{N}\\,\\epsilon_m$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\epsilon_{\\mathrm{tot}}\\simeq\\frac{\\alpha}{N^{\\beta}}-\\sqrt{N}\\,\\epsilon_m$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\epsilon_{\\mathrm{tot}}\\simeq\\alpha N^{\\beta}+\\epsilon_m/N$',
          ok: false,
        },
      ],
      caption:
        'Small $N$: first term wins. Large $N$: the square root takes over and the answer worsens.',
    },
    {
      ask: 'While round-off is still small, the computed answer sits near…',
      choices: [
        {
          label: '$\\displaystyle A(N)\\simeq\\mathcal{A}+\\frac{\\alpha}{N^{\\beta}}$',
          ok: true,
        },
        {
          label: '$\\displaystyle A(N)\\simeq\\mathcal{A}-\\frac{\\alpha}{N^{\\beta}}$ only (always under)',
          ok: false,
        },
        {
          label: '$\\displaystyle A(N)\\simeq\\mathcal{A}+\\sqrt{N}\\,\\epsilon_m$',
          ok: false,
        },
      ],
      caption: 'You do not know $\\mathcal{A}$. Compare two resolutions instead.',
    },
    {
      ask: 'Run $2N$ steps and subtract. Which difference isolates the algorithmic piece?',
      choices: [
        {
          label:
            '$\\displaystyle A(N)-A(2N)\\simeq\\frac{\\alpha}{N^{\\beta}}\\bigl(1-2^{-\\beta}\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle A(N)-A(2N)\\simeq\\frac{\\alpha}{N^{\\beta}}\\bigl(1+2^{-\\beta}\\bigr)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle A(N)+A(2N)\\simeq\\frac{\\alpha}{N^{\\beta}}\\bigl(1-2^{-\\beta}\\bigr)$',
          ok: false,
        },
      ],
      caption:
        'Plot $\\log_{10}|A(N)-A(2N)|/|A(2N)|$ vs $\\log_{10} N$: steep drop $\\Rightarrow$ converging; flatten/uptick $\\Rightarrow$ round-off.',
    },
    {
      ask: 'For $\\epsilon_{\\mathrm{tot}}=1/N^{2}+\\sqrt{N}\\,\\epsilon_m$, set $d\\epsilon_{\\mathrm{tot}}/dN=0$. Which stationary condition?',
      choices: [
        {
          label:
            '$\\displaystyle-\\frac{2}{N^{3}}+\\frac{1}{2}\\frac{\\epsilon_m}{\\sqrt{N}}=0$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\frac{2}{N^{3}}+\\frac{1}{2}\\frac{\\epsilon_m}{\\sqrt{N}}=0$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle-\\frac{2}{N^{3}}-\\frac{1}{2}\\frac{\\epsilon_m}{\\sqrt{N}}=0$',
          ok: false,
        },
      ],
      caption:
        'General power: $N^{*}=(2\\alpha\\beta/\\epsilon_m)^{1/(\\beta+1/2)}$. Quit just before the trough’s noisy uptick.',
    },
  ],
};

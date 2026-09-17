/** Spherical Bessel seeds, recurrence, Miller downward — pick the equation. */

export default {
  title: 'Downward $j_\\ell$',
  lead:
    'Seeds, three-term recurrence, then Miller rescale. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'The regular seed $j_0(x)$ is…',
      choices: [
        {label: '$\\displaystyle j_0=\\frac{\\sin x}{x}$', ok: true},
        {label: '$\\displaystyle j_0=-\\frac{\\cos x}{x}$', ok: false},
        {label: '$\\displaystyle j_0=\\frac{\\sin x}{x^{2}}-\\frac{\\cos x}{x}$', ok: false},
      ],
      caption: 'That last lookalike is actually $j_1$.',
    },
    {
      ask: 'The next regular seed $j_1(x)$ is…',
      choices: [
        {
          label: '$\\displaystyle j_1=\\frac{\\sin x}{x^{2}}-\\frac{\\cos x}{x}$',
          ok: true,
        },
        {
          label: '$\\displaystyle j_1=\\frac{\\sin x}{x^{2}}+\\frac{\\cos x}{x}$',
          ok: false,
        },
        {
          label: '$\\displaystyle j_1=-\\frac{\\cos x}{x^{2}}-\\frac{\\sin x}{x}$',
          ok: false,
        },
      ],
      caption: 'Irregular seeds flip trig and signs.',
    },
    {
      ask: 'The irregular seed $n_0(x)$ is…',
      choices: [
        {label: '$\\displaystyle n_0=-\\frac{\\cos x}{x}$', ok: true},
        {label: '$\\displaystyle n_0=\\frac{\\cos x}{x}$', ok: false},
        {label: '$\\displaystyle n_0=\\frac{\\sin x}{x}$', ok: false},
      ],
    },
    {
      ask: 'And $n_1(x)$ is…',
      choices: [
        {
          label: '$\\displaystyle n_1=-\\frac{\\cos x}{x^{2}}-\\frac{\\sin x}{x}$',
          ok: true,
        },
        {
          label: '$\\displaystyle n_1=-\\frac{\\cos x}{x^{2}}+\\frac{\\sin x}{x}$',
          ok: false,
        },
        {
          label: '$\\displaystyle n_1=\\frac{\\sin x}{x^{2}}-\\frac{\\cos x}{x}$',
          ok: false,
        },
      ],
      caption: 'Both $j_\\ell$ and $n_\\ell$ obey the same three-term recurrence.',
    },
    {
      ask: 'Upward recurrence from $\\ell-1,\\ell$ to $\\ell+1$ is…',
      choices: [
        {
          label:
            '$\\displaystyle j_{\\ell+1}=\\frac{2\\ell+1}{x}j_\\ell-j_{\\ell-1}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle j_{\\ell+1}=\\frac{2\\ell+1}{x}j_\\ell+j_{\\ell-1}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle j_{\\ell+1}=\\frac{2\\ell-1}{x}j_\\ell-j_{\\ell-1}$',
          ok: false,
        },
      ],
      caption:
        'Upward eventually subtracts large − large → tiny $j_\\ell$, mixing in Neumann pollution $j_\\ell^{(c)}=j_\\ell+\\epsilon\\,n_\\ell$.',
    },
    {
      ask: 'Downward recurrence (Miller direction) rearranges to…',
      choices: [
        {
          label:
            '$\\displaystyle j_{\\ell-1}=\\frac{2\\ell+1}{x}j_\\ell-j_{\\ell+1}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle j_{\\ell-1}=\\frac{2\\ell+1}{x}j_\\ell+j_{\\ell+1}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle j_{\\ell-1}=\\frac{2\\ell-1}{x}j_\\ell-j_{\\ell+1}$',
          ok: false,
        },
      ],
      caption: 'Start at large $L$ with arbitrary seeds; errors shrink walking downward.',
    },
    {
      ask: 'After downward recursion, renormalize so $j_0$ matches the analytic seed:',
      choices: [
        {
          label:
            '$\\displaystyle j_\\ell^{\\mathrm{N}}=j_\\ell^{c}\\,\\frac{j_0^{\\mathrm{anal}}}{j_0^{c}},\\quad j_0^{\\mathrm{anal}}=\\frac{\\sin x}{x}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle j_\\ell^{\\mathrm{N}}=j_\\ell^{c}\\,\\frac{j_0^{c}}{j_0^{\\mathrm{anal}}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle j_\\ell^{\\mathrm{N}}=j_\\ell^{c}-j_0^{\\mathrm{anal}}$',
          ok: false,
        },
      ],
      caption:
        'Relative $\\ell$-dependence is stable; absolute scale comes from $j_0=\\sin x/x$.',
    },
  ],
};

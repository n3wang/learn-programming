/** Mean-value Monte Carlo chain (1D → weights → σ → high-D) — pick the equation. */

export default {
  title: 'Mean-value Monte Carlo',
  lead:
    'Mean-value theorem → sample average → variance → high-$D$. Pick the matching equation.',
  steps: [
    {
      ask: 'The mean-value theorem on $[a,b]$ states…',
      choices: [
        {
          label:
            '$\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x=(b-a)\\,f(c)$ for some $c\\in[a,b]$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x=(b+a)\\,f(c)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x=f(c)/(b-a)$',
          ok: false,
        },
      ],
      caption: 'Monte Carlo replaces the unknown $f(c)$ by a sample mean.',
    },
    {
      ask: 'With $x_i$ uniform on $[a,b]$, the estimator is…',
      choices: [
        {
          label:
            '$\\displaystyle\\langle f\\rangle\\approx\\frac{1}{N}\\sum_{i=1}^{N}f(x_i),\\qquad I\\simeq(b-a)\\langle f\\rangle$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle I\\simeq\\frac{1}{N}\\sum_{i=1}^{N}f(x_i)$ (drop $b-a$)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle I\\simeq(b-a)\\sum_{i=1}^{N}f(x_i)$ (no $1/N$)',
          ok: false,
        },
      ],
      caption: 'Same idea as equal weights $w_i=(b-a)/N$.',
    },
    {
      ask: 'Equivalently, every sample carries weight…',
      choices: [
        {
          label:
            '$\\displaystyle w_i=\\frac{b-a}{N},\\qquad I\\simeq\\sum_{i=1}^{N}f(x_i)\\,w_i$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle w_i=\\frac{N}{b-a},\\qquad I\\simeq\\sum_{i=1}^{N}f(x_i)\\,w_i$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle w_i=b-a,\\qquad I\\simeq\\sum_{i=1}^{N}f(x_i)\\,w_i$',
          ok: false,
        },
      ],
      caption: 'If the sample variance of $f(x_i)$ is $\\sigma_f^{2}$, variance of the mean is $\\sigma_f^{2}/N$.',
    },
    {
      ask: 'Uncertainty on $I$ therefore scales as…',
      choices: [
        {
          label:
            '$\\displaystyle\\sigma_I\\sim\\frac{\\sigma_f}{\\sqrt{N}}\\,(b-a)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\sigma_I\\sim\\frac{\\sigma_f}{N}\\,(b-a)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\sigma_I\\sim\\sigma_f\\sqrt{N}\\,(b-a)$',
          ok: false,
        },
      ],
      caption: 'Doubling accuracy costs about $4\\times$ more samples.',
    },
    {
      ask: 'On a rectangle $[a,b]\\times[c,d]$, the 2D mean-value form is…',
      choices: [
        {
          label:
            '$\\displaystyle\\int_a^b\\int_c^d f= (b-a)(d-c)\\,\\langle f\\rangle$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\int_a^b\\int_c^d f= (b-a+d-c)\\,\\langle f\\rangle$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\int_a^b\\int_c^d f= \\langle f\\rangle/(b-a)(d-c)$',
          ok: false,
        },
      ],
      caption:
        'Hyper-rectangle of volume $V$: $I\\simeq V\\langle f\\rangle$. Error $\\sim 1/\\sqrt{N}$ independent of $D$ — grids cost $M^{D}$.',
    },
  ],
};

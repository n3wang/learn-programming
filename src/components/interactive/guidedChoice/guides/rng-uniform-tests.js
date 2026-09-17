/** Uniform RNG moment and lag-product tests — pick the equation. */

export default {
  title: 'Testing a uniform generator',
  lead:
    'Moments and lag products for uniforms on $[0,1]$. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'The $k$th sample moment of $N$ draws is…',
      choices: [
        {
          label: '$\\displaystyle\\langle x^{k}\\rangle=\\frac{1}{N}\\sum_{i=1}^{N} x_i^{k}$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\langle x^{k}\\rangle=\\sum_{i=1}^{N} x_i^{k}$ (no $1/N$)',
          ok: false,
        },
        {
          label: '$\\displaystyle\\langle x^{k}\\rangle=\\frac{1}{N}\\sum_{i=1}^{N} x_i$',
          ok: false,
        },
      ],
      caption: 'Compare to the exact integral for a uniform density.',
    },
    {
      ask: 'For uniforms on $[0,1]$, the exact $k$th moment is…',
      choices: [
        {
          label:
            '$\\displaystyle\\langle x^{k}\\rangle\\simeq\\int_0^1 x^{k}\\,dx=\\frac{1}{k+1}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\langle x^{k}\\rangle\\simeq\\int_0^1 x^{k}\\,dx=\\frac{1}{k}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\langle x^{k}\\rangle\\simeq\\int_0^1 x^{k}\\,dx=\\frac{1}{k-1}$ ($k>1$)',
          ok: false,
        },
      ],
      caption:
        'Sampling noise of order $1/\\sqrt{N}$: check that $\\sqrt{N}|\\langle x^{k}\\rangle-1/(k+1)|$ stays $O(1)$.',
    },
    {
      ask: 'The lag product at lag $k$ is defined as…',
      choices: [
        {
          label:
            '$\\displaystyle C(k)=\\frac{1}{N}\\sum_{i=1}^{N} x_i\\,x_{i+k}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle C(k)=\\frac{1}{N}\\sum_{i=1}^{N}(x_i-x_{i+k})$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle C(k)=\\frac{1}{N}\\sum_{i=1}^{N} x_i^{k}$',
          ok: false,
        },
      ],
      caption: 'Independent uniforms have joint density $1$ on the unit square.',
    },
    {
      ask: 'That independence predicts…',
      choices: [
        {
          label:
            '$\\displaystyle C(k)\\simeq\\int_0^1\\!\\!\\int_0^1 xy\\,dx\\,dy=\\frac{1}{4}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle C(k)\\simeq\\int_0^1\\!\\!\\int_0^1 xy\\,dx\\,dy=\\frac{1}{2}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle C(k)\\simeq\\int_0^1\\!\\!\\int_0^1 xy\\,dx\\,dy=\\frac{1}{3}$',
          ok: false,
        },
      ],
      caption:
        'Matching $1/4$ with $\\sqrt{N}|C-1/4|=O(1)$ supports independence — still scatter-plot successive pairs.',
    },
  ],
};

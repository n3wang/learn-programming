/** Lagrange remainder and why global high-degree fits misbehave. */

export default {
  title: 'Lagrange remainder and global fits',
  lead:
    'The interpolant hits every node — but between them the error can explode. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'The interpolation remainder between the true $g$ and the $n$-point Lagrange polynomial is approximately…',
      choices: [
        {
          label:
            '$\\displaystyle R_n\\simeq\\dfrac{(x-x_1)\\cdots(x-x_n)}{n!}\\,g^{(n)}(\\zeta)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle R_n\\simeq\\dfrac{g(x_1)+\\cdots+g(x_n)}{n}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle R_n\\simeq n!\\,(x-x_1)\\cdots(x-x_n)$ (no derivative)',
          ok: false,
        },
      ],
      caption:
        'Some $\\zeta$ lies in the interval. Large high-order derivatives (noisy tables) make $R_n$ large between nodes.',
    },
    {
      ask: 'Nine tabulated points force one global interpolant of degree…',
      choices: [
        {
          label: '$\\displaystyle n-1=8$ for $n=9$ nodes',
          ok: true,
        },
        {
          label: '$\\displaystyle n=9$ (degree equals the node count)',
          ok: false,
        },
        {
          label: '$\\displaystyle 2$ regardless of $n$',
          ok: false,
        },
      ],
      caption:
        'The curve still passes through every tabulated point, but between nodes it can swing wildly — peaks and dips unrelated to the physics.',
    },
    {
      ask: 'Local low-order practice replaces one global sum. Which formula matches?',
      choices: [
        {
          label:
            '$\\displaystyle g(x)\\approx\\sum_{i\\in I_\\ell}g_i\\lambda_i(x)$ on each small window $I_\\ell$ with $|I_\\ell|=3$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle g(x)=\\sum_{i=1}^{2n-1}g_i\\lambda_i(x)$ (raise degree to $2n-1$)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle g(x)=\\sum_{i=1}^{n}g_i\\lambda_i(x)$ for all $x$ outside $[x_1,x_n]$ (same global basis)',
          ok: false,
        },
      ],
      caption:
        'Extrapolation is riskier still: outside the table the answer depends more on which polynomial you fitted than on the data. Splines take the local idea further.',
    },
  ],
};

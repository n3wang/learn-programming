/** Riemann sum / box-counting integration framework — equation picks. */

export default {
  title: 'Box counting and quadrature',
  lead:
    'An experiment gives a rate $dN/dt$. You need $N(1)=\\int_0^1 (dN/dt)\\,dt$. Pick the matching sum at each step.',
  steps: [
    {
      ask: 'The shared skeleton of integration algorithms is…',
      choices: [
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq\\sum_i f(x_i)\\,w_i$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq f\'(a)$ (one forward difference)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq\\sum_i f(x_i)$ with no weights',
          ok: false,
        },
      ],
      caption:
        'The Riemann limit takes box width $h\\to 0$. Numerically you keep finite $N$ and choose $(x_i,w_i)$.',
    },
    {
      ask: 'With equal panel width $h=(b-a)/N$, a left-endpoint box sum is…',
      choices: [
        {
          label: '$\\displaystyle h\\sum_{i=0}^{N-1} f(a+ih)$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\sum_{i=0}^{N-1} f(a+ih)$ (no factor of $h$)',
          ok: false,
        },
        {
          label: '$\\displaystyle h\\sum_{i=1}^{N} f(a+ih^{2})$',
          ok: false,
        },
      ],
      caption:
        'Different rules (left, mid, trapezoid, Simpson, …) are different $(x_i,w_i)$ choices inside the same $\\sum f_i w_i$ template.',
    },
    {
      ask: 'The midpoint rule on the same panels replaces the left sample by…',
      choices: [
        {
          label:
            '$\\displaystyle h\\sum_{i=0}^{N-1} f\\bigl(a+(i+\\tfrac12)h\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle h\\sum_{i=0}^{N-1} f(a+ih)$ (same as left)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\tfrac12 h\\bigl(f(a)+f(b)\\bigr)$ only (one panel forever)',
          ok: false,
        },
      ],
      caption:
        'Analytic antiderivatives can be hard; on a machine the area under a curve is a weighted sum of boxes.',
    },
  ],
};

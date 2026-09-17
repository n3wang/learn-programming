/** Newton–Raphson: finite-difference f′ and backtracking — equation picks. */

export default {
  title: 'Newton–Raphson search',
  lead:
    'You have $\\Delta x=-f/f\'$. Pick the practical derivative and the backtrack rule among lookalikes.',
  steps: [
    {
      ask: 'If you do not have an analytic $f\'$, a practical substitute is…',
      choices: [
        {
          label:
            '$\\displaystyle f\'(x)\\simeq\\dfrac{f(x+\\delta x)-f(x)}{\\delta x}$',
          ok: true,
        },
        {
          label: '$\\displaystyle f\'(x)\\equiv 1$ for every $x$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle f\'(x)\\simeq f(x)\\,\\delta x$ (no difference)',
          ok: false,
        },
      ],
      caption:
        'Central differences are finer but cost an extra $f$ evaluation. Once $|f|$ is tiny, the path matters less.',
    },
    {
      ask: 'If $|f(x_0+\\Delta x)|$ grows versus $|f(x_0)|$, backtracking replaces the step by…',
      choices: [
        {
          label:
            '$\\displaystyle\\Delta x\\leftarrow\\dfrac{\\Delta x}{2},\\;\\dfrac{\\Delta x}{4},\\;\\ldots$ until $|f|$ no longer grows',
          ok: true,
        },
        {
          label: '$\\displaystyle\\Delta x\\leftarrow 2\\Delta x$ (double and hope)',
          ok: false,
        },
        {
          label: '$\\displaystyle\\Delta x\\leftarrow 0$ and stop forever',
          ok: false,
        },
      ],
      caption:
        'Newton fails when the guess is far from a nearly-linear neighborhood. Plot first, or bisect a few steps, then switch to Newton.',
    },
    {
      ask: 'The iteration update itself (once $\\Delta x$ is accepted) is…',
      choices: [
        {
          label: '$\\displaystyle x\\leftarrow x+\\Delta x$',
          ok: true,
        },
        {
          label: '$\\displaystyle x\\leftarrow x\\cdot\\Delta x$',
          ok: false,
        },
        {
          label: '$\\displaystyle x\\leftarrow\\Delta x/x$',
          ok: false,
        },
      ],
      caption:
        'Repeat until $|f(x)|$ or $|\\Delta x|$ falls below a chosen $\\varepsilon$ — as on the even square-well $g(E)$.',
    },
  ],
};

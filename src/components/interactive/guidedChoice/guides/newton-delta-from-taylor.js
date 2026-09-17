/** Newton Δx from a first-order Taylor model — equation picks. */

export default {
  title: 'Newton step from Taylor',
  lead:
    'Guess $x_0$ near a root of $f$. Pick the algebra that turns the local tangent into the next guess.',
  steps: [
    {
      ask: 'Write the unknown root as an old guess plus a correction. Which decomposition?',
      choices: [
        {label: '$x=x_0+\\Delta x$', ok: true},
        {label: '$x=x_0\\cdot\\Delta x$', ok: false},
        {label: '$x=\\Delta x/x_0$', ok: false},
      ],
      caption:
        'Keep only the linear Taylor piece: $f(x_0+\\Delta x)\\simeq f(x_0)+f\'(x_0)\\Delta x$.',
    },
    {
      ask: 'Force that linear model through zero. Solving for the correction gives…',
      choices: [
        {
          label: '$\\displaystyle\\Delta x=-\\dfrac{f(x_0)}{f\'(x_0)}$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\Delta x=f(x_0)\\cdot f\'(x_0)$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\Delta x=\\dfrac{x_{+}-x_{-}}{2}$ only',
          ok: false,
        },
      ],
      caption:
        'Geometrically: the tangent at $x_0$ hits the axis at $x_0+\\Delta x$. Iterate until $|f|$ or $|\\Delta x|$ is tiny.',
    },
    {
      ask: 'If $f\'(x_0)\\approx 0$ at the guess, the Newton correction…',
      choices: [
        {
          label:
            '$\\displaystyle|\\Delta x|=\\left|\\dfrac{f(x_0)}{f\'(x_0)}\\right|\\to\\infty$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\Delta x=0$ and the root is found in one step',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\Delta x=(x_{+}-x_{-})/2$ automatically',
          ok: false,
        },
      ],
      caption:
        'Horizontal tangent ⇒ restart or fall back to bisection / backtracking. Far from the root you can also cycle or escape.',
    },
  ],
};

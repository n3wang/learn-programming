/** Lagrange interpolation: fitting one polynomial through n points. */

export default {
  title: 'Lagrange interpolation',
  lead: 'A table of numbers hides an infinite family of curves. Lagrange gives one closed-form polynomial that hits every point exactly.',
  steps: [
    {
      caption: 'For $n$ points $(x_i,g_i)$, $g(x)\\simeq\\sum_i g_i\\lambda_i(x)$, where $\\lambda_i(x)=\\prod_{j\\ne i}\\frac{x-x_j}{x_i-x_j}$ is $1$ at $x_i$ and $0$ at every other node.',
    },
    {
      ask: 'With $n$ data points, the Lagrange formula produces a polynomial of degree…',
      choices: [
        {label: '$n-1$', ok: true},
        {label: '$n$', ok: false},
        {label: '$n+1$', ok: false},
      ],
      caption: 'Four points ⇒ a cubic; nine points (the full cross-section table) ⇒ an 8th-degree polynomial.',
    },
    {
      ask: 'Fitting all nine noisy cross-section points with one 8th-degree polynomial tends to…',
      choices: [
        {label: 'oscillate wildly between the tabulated points', ok: true},
        {label: 'smooth the data better than a low-order local fit', ok: false},
        {label: 'have no effect — degree does not change the shape', ok: false},
      ],
      caption: 'The interpolation error involves $g^{(n)}(\\zeta)$ — high derivatives from a high-degree global fit blow up between nodes when data carries noise.',
    },
    {
      ask: 'The usual remedy for the global-fit oscillation problem is to…',
      choices: [
        {label: 'use a low-order fit (e.g. n=3) locally in each interval instead of one global polynomial', ok: true},
        {label: 'always raise the degree further', ok: false},
        {label: 'extrapolate outside the data range', ok: false},
      ],
      caption: 'Local, low-order interpolation avoids the wild swings — this is exactly the motivation for splines.',
    },
  ],
};

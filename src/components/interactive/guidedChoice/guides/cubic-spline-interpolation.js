/** Cubic spline interpolation: piecewise cubics matched in value, slope, curvature. */

export default {
  title: 'Cubic spline interpolation',
  lead: 'Instead of one high-degree polynomial for the whole table, fit a different cubic in each interval — and glue them together smoothly.',
  steps: [
    {
      caption: 'On $[x_i,x_{i+1}]$: $g_i(x)=g_i+g_i\'(x-x_i)+\\tfrac12 g_i\'\'(x-x_i)^2+\\tfrac16 g_i\'\'\'(x-x_i)^3$. Matching value, first, and second derivatives at each shared node keeps the curve and its curvature continuous.',
    },
    {
      ask: 'What makes a "natural" cubic spline natural?',
      choices: [
        {label: 'the second derivative is set to zero at both endpoints', ok: true},
        {label: 'the first derivative is set to zero at both endpoints', ok: false},
        {label: 'all third derivatives are zero everywhere', ok: false},
      ],
      caption: 'It mimics a flexible drafting spline whose ends are unconstrained, so curvature vanishes there.',
    },
    {
      ask: 'Compared with one high-degree Lagrange polynomial through all the data, a cubic spline fit is typically…',
      choices: [
        {label: 'smoother and less prone to wild oscillation between nodes, since each piece is low-degree', ok: true},
        {label: 'identical, since both pass through every data point', ok: false},
        {label: 'worse, because splines cannot be differentiated', ok: false},
      ],
      caption: 'Splines can be safely differentiated and integrated piece by piece — useful when, e.g., a potential needs to be turned into a force.',
    },
    {
      ask: 'Integrating a spline fit over an interval is done by…',
      choices: [
        {label: 'integrating each cubic piece analytically and summing over intervals', ok: true},
        {label: 'summing the tabulated $g_i$ values directly', ok: false},
        {label: 'switching to Gaussian quadrature — splines cannot be integrated', ok: false},
      ],
      caption: 'Each cubic term integrates in closed form; this is about as good as it gets when g is known only at tabulated points.',
    },
  ],
};

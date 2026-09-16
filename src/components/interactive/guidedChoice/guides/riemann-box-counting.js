/** Riemann sum / box-counting integration framework. */

export default {
  title: 'Box counting and quadrature',
  lead: 'An experiment gives a rate $dN/dt$. You need $N(1)=\\int_0^1 (dN/dt)\\,dt$. How does a computer turn that into a finite sum?',
  steps: [
    {
      caption: 'Analytic antiderivatives can be hard; on a machine the area under a curve is a sum of boxes — historically “numerical quadrature.”',
    },
    {
      ask: 'The shared skeleton of integration algorithms is…',
      choices: [
        {label: '$\\int_a^b f \\simeq \\sum_i f(x_i)\\,w_i$ for chosen nodes and weights', ok: true},
        {label: 'always a single forward difference of $f$', ok: false},
        {label: 'only valid when $N\\to\\infty$ in IEEE arithmetic', ok: false},
      ],
      caption: 'The Riemann limit takes box width $h\\to 0$. Numerically you keep finite $N$ and choose where to sample $f$ and how to weight each sample.',
    },
    {
      ask: 'With equal panel width $h=(b-a)/N$, a left-endpoint box sum is…',
      choices: [
        {label: '$h\\sum_{i=0}^{N-1} f(a+ih)$', ok: true},
        {label: '$\\sum f(x_i)$ with no factor of $h$', ok: false},
        {label: 'exactly $\\int f$ for every continuous $f$ at $N=2$', ok: false},
      ],
      caption: 'Different rules (left, mid, trapezoid, Simpson, …) are different $(x_i,w_i)$ choices inside the same $\\sum f_i w_i$ template.',
    },
  ],
};

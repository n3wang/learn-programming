/** Moment and lag-product tests for a uniform RNG. */

export default {
  title: 'Testing a uniform generator',
  lead: 'Pseudorandom streams are correlated by construction. Which quick checks catch a bad generator before your Monte Carlo paper does?',
  steps: [
    {
      caption: 'Look at the numbers, plot $r_i$ vs $i$, and scatter $(r_{2i},r_{2i+1})$. A lattice or stripe pattern fails immediately.',
    },
    {
      ask: 'For uniforms on $[0,1]$, the $k$th sample moment should approach…',
      choices: [
        {label: '$1/(k+1)$, with $\\sqrt{N}|\\mathrm{error}|$ of order 1 if the deviations are random', ok: true},
        {label: '$k!$ always', ok: false},
        {label: '$0$ for every $k$', ok: false},
      ],
      caption: '$\\int_0^1 x^k\\,dx=1/(k+1)$. Growing $\\sqrt{N}|\\mathrm{error}|$ hints at bias, not mere sampling noise.',
    },
    {
      ask: 'The lag product $C(k)=\\langle x_i x_{i+k}\\rangle$ for independent uniforms is…',
      choices: [
        {label: '$\\approx 1/4$', ok: true},
        {label: '$\\approx 1/2$', ok: false},
        {label: '$\\approx 0$', ok: false},
      ],
      caption: '$\\iint xy\\,dx\\,dy=1/4$. Pass the average and still plot scatter — averages can hide lattices.',
    },
  ],
};

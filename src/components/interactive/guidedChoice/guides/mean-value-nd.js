/** Mean-value theorem MC and why high-D favors sampling. */

export default {
  title: 'Mean-value Monte Carlo',
  lead: 'Replace the unknown mean-value height f(c) by a sample average — then raise the dimension.',
  steps: [
    {
      caption:
        'Mean-value theorem: $\\int_a^b f=(b-a)f(c)$. Monte Carlo uses $I\\simeq(b-a)\\langle f\\rangle$ with $\\langle f\\rangle=(1/N)\\sum f(x_i)$ and weights $w_i=(b-a)/N$.',
    },
    {
      ask: 'The uncertainty $\\sigma_I$ for plain sampling scales as…',
      choices: [
        {label: '$\\sigma_f/\\sqrt{N}$ (times the interval length factor)', ok: true},
        {label: '$\\sigma_f/N^{2}$', ok: false},
        {label: 'independent of $N$', ok: false},
      ],
      caption: 'Variance of the mean is $\\sigma_f^{2}/N$. More digits $\\Rightarrow$ roughly $4\\times$ samples.',
    },
    {
      ask: 'Why does high dimension favor Monte Carlo over a product grid?',
      choices: [
        {
          label: 'Grid cost is $M^{D}$; MC error stays $\\sim 1/\\sqrt{N}$ independent of $D$',
          ok: true,
        },
        {label: 'MC is exact for degree $2N-1$ polynomials', ok: false},
        {label: 'MC needs fewer than one sample', ok: false},
      ],
      caption:
        'Crossover often near $D\\approx 3$–$4$. Check $I=\\int_{[0,1]^{10}}(\\sum x_i)^{2}=155/6$ in the labs.',
    },
  ],
};

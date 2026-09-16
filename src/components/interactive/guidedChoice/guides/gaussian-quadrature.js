/** Gaussian quadrature: nodes, weights, mapping, exactness. */

export default {
  title: 'Gaussian quadrature',
  lead: 'Equal-spacing rules fix the nodes. What if you also optimize the sample locations?',
  steps: [
    {
      caption: 'Write $\\int W g \\simeq \\sum w_i g(x_i)$. Gauss chooses $(x_i,w_i)$ so the rule is exact for every polynomial $g$ of degree $\\le 2N-1$.',
    },
    {
      ask: 'Classical Gauss–Legendre nodes on $[-1,1]$ are…',
      choices: [
        {label: 'the $N$ zeros of the Legendre polynomial $P_N$ (interior to the interval)', ok: true},
        {label: 'equally spaced points including the endpoints', ok: false},
        {label: 'random Gaussian samples', ok: false},
      ],
      caption: 'Weights involve $P_N\'(y_i)$. Different $N$ give completely different node sets.',
    },
    {
      ask: 'Mapping $[-1,1]\\to[a,b]$ uniformly multiplies each weight by…',
      choices: [
        {label: '$(b-a)/2$', ok: true},
        {label: '$b-a$', ok: false},
        {label: '$1$ (weights unchanged)', ok: false},
      ],
      caption: 'Infinite ranges use rational maps: outermost nodes stay finite but grow with $N$.',
    },
  ],
};

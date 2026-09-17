/** Cubic spline: matching conditions and panel integral — pick the equations. */

export default {
  title: 'Cubic spline matching and quadrature',
  lead:
    'Piecewise cubics glued by value, slope, and curvature. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'On $[x_i,x_{i+1}]$ the Taylor cubic about the left node is…',
      choices: [
        {
          label:
            '$\\displaystyle g_i(x)=g_i+g_i\'(x-x_i)+\\tfrac12 g_i\'\'(x-x_i)^{2}+\\tfrac16 g_i\'\'\'(x-x_i)^{3}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle g_i(x)=g_i+g_i\'(x-x_i)+\\tfrac12 g_i\'\'(x-x_i)^{2}$ (no cubic term)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle g_i(x)=g_i+g_i\'(x-x_i)+\\tfrac16 g_i\'\'(x-x_i)^{2}+\\tfrac12 g_i\'\'\'(x-x_i)^{3}$',
          ok: false,
        },
      ],
      caption:
        'Higher than third derivatives vanish for a cubic. The task is to recover $g_i\',g_i\'\',g_i\'\'\'$ from the tabulated $g_i$.',
    },
    {
      ask: 'Value matching at a shared node requires…',
      choices: [
        {
          label: '$\\displaystyle g_i(x_{i+1})=g_{i+1}(x_{i+1})$',
          ok: true,
        },
        {
          label: '$\\displaystyle g_i(x_{i+1})=g_{i+1}(x_i)$',
          ok: false,
        },
        {
          label: '$\\displaystyle g_i\'(x_{i+1})=g_{i+1}\'\'(x_{i+1})$',
          ok: false,
        },
      ],
      caption:
        'Slope and curvature matching at interiors: $g_{i-1}\'(x_i)=g_i\'(x_i)$ and $g_{i-1}\'\'(x_i)=g_i\'\'(x_i)$.',
    },
    {
      ask: 'A common closure for the third derivative from adjacent second derivatives is…',
      choices: [
        {
          label:
            '$\\displaystyle g_i\'\'\'\\simeq\\dfrac{g_{i+1}\'\'-g_i\'\'}{x_{i+1}-x_i}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle g_i\'\'\'\\simeq\\dfrac{g_{i+1}\'\'+g_i\'\'}{x_{i+1}-x_i}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle g_i\'\'\'\\simeq\\dfrac{g_{i+1}\'-g_i\'}{x_{i+1}-x_i}$',
          ok: false,
        },
      ],
      caption:
        'Interior matching alone gives $N-2$ equations for $N$ unknown second derivatives — endpoints need boundary data (natural: $g\'\'(a)=g\'\'(b)=0$).',
    },
    {
      ask: 'Integrating one cubic panel analytically yields the antiderivative evaluation…',
      choices: [
        {
          label:
            '$\\displaystyle\\int_{x_i}^{x_{i+1}}g\\simeq\\Bigl[g_i x+\\tfrac12 g_i\' x^{2}+\\tfrac16 g_i\'\' x^{3}+\\tfrac1{24}g_i\'\'\' x^{4}\\Bigr]_{x_i}^{x_{i+1}}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\int_{x_i}^{x_{i+1}}g\\simeq\\Bigl[g_i x+\\tfrac12 g_i\' x^{2}+\\tfrac12 g_i\'\' x^{3}+\\tfrac16 g_i\'\'\' x^{4}\\Bigr]_{x_i}^{x_{i+1}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\int_{x_i}^{x_{i+1}}g\\simeq\\bigl[g_i\'\'\' x\\bigr]_{x_i}^{x_{i+1}}$',
          ok: false,
        },
      ],
      caption:
        'Sum consecutive panels for a multi-interval integral. When $g$ is known only at nodes, this is about as accurate as tabulated quadrature gets; if you can evaluate $g$ freely, prefer Gauss.',
    },
  ],
};

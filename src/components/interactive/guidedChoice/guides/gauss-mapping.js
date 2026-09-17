/** Map Gauss–Legendre (y_i, w_i′) on [−1,1] onto other intervals — pick the right equation. */

export default {
  title: 'Mapping Gaussian points',
  lead:
    'Reference data live on $-1<y_i<1$. At each step pick the map that matches the target interval (lookalikes included).',
  steps: [
    {
      ask: 'Uniform map $[-1,1]\\to[a,b]$ (midpoint $(a+b)/2$). Which formula for the nodes $x_i$?',
      choices: [
        {
          label:
            '$\\displaystyle x_i=\\dfrac{b+a}{2}+\\dfrac{b-a}{2}y_i$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle x_i=\\dfrac{b+a}{2}-\\dfrac{b-a}{2}y_i$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle x_i=\\dfrac{b-a}{2}+\\dfrac{b+a}{2}y_i$',
          ok: false,
        },
      ],
      caption:
        'Linear: $y=-1\\mapsto a$, $y=+1\\mapsto b$. Next — how the weights transform.',
    },
    {
      ask: 'Same uniform map. Weights pick up the Jacobian. Which is correct?',
      choices: [
        {
          label: '$\\displaystyle w_i=\\dfrac{b-a}{2}w_i\'$',
          ok: true,
        },
        {
          label: '$\\displaystyle w_i=(b-a)\\,w_i\'$',
          ok: false,
        },
        {
          label: '$\\displaystyle w_i=\\dfrac{2}{b-a}w_i\'$',
          ok: false,
        },
      ],
      caption:
        'Equivalent integral identity: $\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x=\\dfrac{b-a}{2}\\int_{-1}^{1} f\\bigl(x(y)\\bigr)\\,\\mathrm{d}y$.',
    },
    {
      ask: 'Half-line $[0,\\infty)$ with scale $a$ (midpoint scale). Nodes?',
      choices: [
        {
          label: '$\\displaystyle x_i=a\\dfrac{1+y_i}{1-y_i}$',
          ok: true,
        },
        {
          label: '$\\displaystyle x_i=a\\dfrac{1-y_i}{1+y_i}$',
          ok: false,
        },
        {
          label: '$\\displaystyle x_i=a\\dfrac{1+y_i^{2}}{1-y_i^{2}}$',
          ok: false,
        },
      ],
      caption:
        'Weights: $\\displaystyle w_i=\\dfrac{2a}{(1-y_i)^{2}}w_i\'$. As $y_i\\to 1^-$, $x_i\\to+\\infty$.',
    },
    {
      ask: 'Whole line $(-\\infty,\\infty)$ with scale $a$. Nodes?',
      choices: [
        {
          label: '$\\displaystyle x_i=a\\dfrac{y_i}{1-y_i^{2}}$',
          ok: true,
        },
        {
          label: '$\\displaystyle x_i=a\\dfrac{y_i}{1-y_i}$',
          ok: false,
        },
        {
          label: '$\\displaystyle x_i=a\\dfrac{1+y_i}{1-y_i^{2}}$',
          ok: false,
        },
      ],
      caption:
        'Weights: $\\displaystyle w_i=\\dfrac{a(1+y_i^{2})}{(1-y_i^{2})^{2}}w_i\'$. Odd in $y_i$ — nodes come in $\\pm$ pairs.',
    },
    {
      ask: 'Ray $[a,\\infty)$ with midpoint parameter $a+2b$. Nodes?',
      choices: [
        {
          label: '$\\displaystyle x_i=\\dfrac{a+2b+a y_i}{1-y_i}$',
          ok: true,
        },
        {
          label: '$\\displaystyle x_i=\\dfrac{a+2b+b y_i}{1-y_i}$',
          ok: false,
        },
        {
          label: '$\\displaystyle x_i=\\dfrac{b+(b-2a)y_i}{1-y_i}$',
          ok: false,
        },
      ],
      caption:
        'At $y_i=0$, $x_i=a+2b$ (the named midpoint). Weights: $\\displaystyle w_i=\\dfrac{2(b+a)}{(1-y_i)^{2}}w_i\'$.',
    },
    {
      ask: 'Finite $[0,b]$ with midpoint $ab/(b+a)$. Nodes?',
      choices: [
        {
          label:
            '$\\displaystyle x_i=\\dfrac{ba(1+y_i)}{b+a-(b-a)y_i}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle x_i=\\dfrac{ba(1-y_i)}{b+a+(b-a)y_i}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle x_i=\\dfrac{ba(1+y_i)}{b+a+(b-a)y_i}$',
          ok: false,
        },
      ],
      caption:
        'Weights: $\\displaystyle w_i=\\dfrac{2ab^{2}}{\\bigl(b+a-(b-a)y_i\\bigr)^{2}}w_i\'$. Even “infinite” maps only place nodes at large finite $x$ — raising $N$ pushes the outermost node farther out, never to infinity.',
    },
  ],
};

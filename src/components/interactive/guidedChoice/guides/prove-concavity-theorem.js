/** Guided proof: Theorem 15.1 — concavity from f″ via MVT. */

export default {
  title: 'Proof — Theorem 15.1 (concavity)',
  lead: 'If f″>0 on (a,b), the graph lies above its tangents (concave up).',
  steps: [
    {
      ask: 'Fix $x_0\\in(a,b)$. From $f\'\'(x_0)>0$, on a neighborhood of $x_0$ the derivative $f\'$ is…',
      choices: [
        {label: 'Increasing (Theorem 13.7 applied to $f\'$)', ok: true},
        {label: 'Decreasing', ok: false},
        {label: 'Constant', ok: false},
      ],
      caption: 'Positive derivative of $f\'$ means $f\'$ itself increases.',
    },
    {
      ask: 'For $x>x_0$ nearby, MVT gives $f(x)-f(x_0)=f\'(x^{*})(x-x_0)$ with $x_0<x^{*}<x$. Because $f\'$ is increasing…',
      choices: [
        {
          label: '$f\'(x^{*})>f\'(x_0)$, so $f(x)>f\'(x_0)(x-x_0)+f(x_0)$ — above the tangent',
          ok: true,
        },
        {label: '$f(x)$ lies below the tangent', ok: false},
        {label: '$f\'(x^{*})=f\'(x_0)$ always', ok: false},
      ],
      caption: 'The tangent line is $y=f\'(x_0)(x-x_0)+f(x_0)$.',
    },
    {
      ask: 'Part (b) with $f\'\'<0$ follows by…',
      choices: [
        {label: 'Applying (a) to $-f$ (or repeating the argument with reversed inequalities)', ok: true},
        {label: 'Requiring $f\'=0$', ok: false},
        {label: 'Using only Rolle’s theorem', ok: false},
      ],
      caption: 'Negative $f\'\'$ ⇒ concave down (below tangents).',
    },
  ],
};

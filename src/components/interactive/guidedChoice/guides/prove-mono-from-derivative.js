/** Guided proof: sign of f′ ⇒ monotone (Thm 13.7). */

export default {
  title: 'Proof — Theorem 13.7 (monotone from f′)',
  lead: 'Use MVT on an arbitrary pair a<b inside the interval.',
  steps: [
    {
      ask: 'For $a<b$ in the interval, MVT gives…',
      choices: [
        {
          label: "$\\dfrac{f(b)-f(a)}{b-a}=f'(x_0)$ for some $x_0\\in(a,b)$",
          ok: true,
        },
        {label: '$f(b)=f(a)$ always', ok: false},
        {label: '$f\'(a)=f\'(b)$', ok: false},
      ],
      caption: 'Average rate equals some instantaneous rate.',
    },
    {
      ask: 'If $f\'>0$ on the interval, then that quotient is positive, so…',
      choices: [
        {label: '$f(b)-f(a)>0$, hence $f(a)<f(b)$ — $f$ is increasing', ok: true},
        {label: '$f$ must be constant', ok: false},
        {label: '$f(b)<f(a)$', ok: false},
      ],
      caption: 'Same argument with $f\'<0$ gives decreasing.',
    },
    {
      ask: 'Part (b) can also be reduced to (a) by…',
      choices: [
        {label: 'Setting $g=-f$ (then $g\'>0\\Rightarrow g$ increasing $\\Rightarrow f$ decreasing)', ok: true},
        {label: 'Deleting the interval', ok: false},
        {label: 'Requiring $f\'\'=0$', ok: false},
      ],
      caption: 'Negating reverses inequalities.',
    },
  ],
};

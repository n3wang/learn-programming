/** Guided proof: MVT via auxiliary F and Rolle. */

export default {
  title: 'Proof — Law of the Mean (MVT)',
  lead: 'Build an auxiliary function that vanishes at both ends, then apply Rolle.',
  steps: [
    {
      ask: 'The usual trick is to set…',
      choices: [
        {
          label:
            "$F(x)=f(x)-f(a)-\\dfrac{f(b)-f(a)}{b-a}(x-a)$",
          ok: true,
        },
        {label: '$F(x)=f\'(x)$ only', ok: false},
        {label: '$F(x)=f(b)-f(a)$ (constant)', ok: false},
      ],
      caption: 'Subtract the chord’s linear interpolant from $f$.',
    },
    {
      ask: 'Why does Rolle apply to $F$?',
      choices: [
        {label: '$F(a)=0=F(b)$, and $F$ inherits continuity / differentiability from $f$', ok: true},
        {label: 'Because $F\'>0$ always', ok: false},
        {label: 'Because $f$ is quadratic', ok: false},
      ],
      caption: 'Equal endpoint values are exactly Rolle’s setup (after shifting).',
    },
    {
      ask: 'From $F\'(x_0)=0$ we read…',
      choices: [
        {
          label: "$f'(x_0)=\\dfrac{f(b)-f(a)}{b-a}$",
          ok: true,
        },
        {label: '$f(x_0)=0$', ok: false},
        {label: '$f\'(x_0)=f(b)+f(a)$', ok: false},
      ],
      caption: '$F\'=f\'$ minus the constant secant slope.',
    },
  ],
};

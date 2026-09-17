/** Guided: f′=0 on (a,b) ⇒ f constant (Prob. 15). */

export default {
  title: 'Proof — vanishing derivative ⇒ constant',
  lead: 'Apply the Law of the Mean to an arbitrary pair of points.',
  steps: [
    {
      ask: 'Fix any $u<v$ in $(a,b)$. MVT gives…',
      choices: [
        {
          label: "$\\dfrac{f(v)-f(u)}{v-u}=f'(x_0)$ for some $x_0\\in(u,v)$",
          ok: true,
        },
        {label: '$f(v)=f\'(u)$', ok: false},
        {label: '$f$ must have a corner', ok: false},
      ],
      caption: 'Average change equals an instantaneous rate.',
    },
    {
      ask: 'If $f\'=0$ everywhere on $(a,b)$, that forces…',
      choices: [
        {label: '$f(v)-f(u)=0$, so $f(v)=f(u)$', ok: true},
        {label: '$f(v)>f(u)$ always', ok: false},
        {label: '$v=u$', ok: false},
      ],
      caption: 'Arbitrary pair ⇒ $f$ takes the same value everywhere.',
    },
    {
      ask: 'Corollary: if $f\'=g\'$ on $(a,b)$, then…',
      choices: [
        {
          label: '$(f-g)\'=0\\Rightarrow f-g$ is constant $\\Rightarrow f=g+K$',
          ok: true,
        },
        {label: '$f=g$ with $K=0$ forced', ok: false},
        {label: '$f\'\'=g\'\'$ only', ok: false},
      ],
      caption: 'Problem 18 is Problem 15 applied to $f-g$.',
    },
  ],
};

/** Guided proof sketch: extended MVT (Cauchy). */

export default {
  title: 'Proof — Extended Law of the Mean',
  lead: 'Rule out g(b)=g(a), then apply Rolle to a Cauchy-style auxiliary function.',
  steps: [
    {
      ask: 'Why must $g(b)\\ne g(a)$ under the hypotheses?',
      choices: [
        {
          label: 'If $g(b)=g(a)$, generalized Rolle gives some $g\'=0$, contradicting $g\'\\ne 0$ on $(a,b)$',
          ok: true,
        },
        {label: 'Because $f$ is linear', ok: false},
        {label: 'Because $a=b$', ok: false},
      ],
      caption: 'So the denominator $g(b)-g(a)$ is safe.',
    },
    {
      ask: 'A standard auxiliary function is…',
      choices: [
        {
          label:
            "$F(x)=f(x)-f(b)-\\dfrac{f(b)-f(a)}{g(b)-g(a)}\\bigl(g(x)-g(b)\\bigr)$",
          ok: true,
        },
        {label: '$F(x)=f(x)+g(x)$ only', ok: false},
        {label: '$F(x)=g\'(x)$', ok: false},
      ],
      caption: 'Designed so $F(a)=F(b)=0$.',
    },
    {
      ask: 'Rolle on $F$ then yields…',
      choices: [
        {
          label:
            "$\\dfrac{f'(x_0)}{g'(x_0)}=\\dfrac{f(b)-f(a)}{g(b)-g(a)}$",
          ok: true,
        },
        {label: '$f(x_0)=g(x_0)$', ok: false},
        {label: '$g\'(x_0)=0$', ok: false},
      ],
      caption: 'Ordinary MVT is the special case $g(x)=x$.',
    },
  ],
};

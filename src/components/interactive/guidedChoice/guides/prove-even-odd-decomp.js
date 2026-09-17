/** Guided proof: unique even + odd decomposition. */

export default {
  title: 'Proof — even + odd decomposition',
  lead: 'Any F defined on a symmetric domain is uniquely E + O with E even and O odd.',
  steps: [
    {
      ask: 'Define $E(x)=\\tfrac12\\bigl(F(x)+F(-x)\\)$. Then $E(-x)$ equals…',
      choices: [
        {label: '$E(x)$ — so $E$ is even', ok: true},
        {label: '$-E(x)$', ok: false},
        {label: '$F(x)$', ok: false},
      ],
      caption: 'Swapping $x$ with $-x$ leaves the average unchanged.',
    },
    {
      ask: 'With $O(x)=\\tfrac12\\bigl(F(x)-F(-x)\\)$, we get…',
      choices: [
        {label: '$O$ odd and $E+O=F$', ok: true},
        {label: '$O$ even', ok: false},
        {label: '$E+O=0$', ok: false},
      ],
      caption: 'The two halves reassemble $F$.',
    },
    {
      ask: 'For uniqueness: if $F=E_1+O_1=E_2+O_2$, then $E_1-E_2=O_2-O_1$ is both even and odd, hence…',
      choices: [
        {label: 'Identically zero — so the splitting is unique', ok: true},
        {label: 'A nonzero constant', ok: false},
        {label: 'Equal to $F$', ok: false},
      ],
      caption: 'Only the zero function is both even and odd (on a domain containing $\\pm x$).',
    },
  ],
};

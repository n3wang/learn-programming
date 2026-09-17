/** Guided proof: first derivative test (sign patterns). */

export default {
  title: 'Proof — first derivative test',
  lead: 'Assume $f\'(x_0)=0$. Read relative max/min from the sign of $f\'$ on each side.',
  steps: [
    {
      ask: 'Case $\\{+,\\,-\\}$: $f\'>0$ just left of $x_0$ and $f\'<0$ just right. By Theorem 13.7…',
      choices: [
        {
          label: '$f$ increases into $x_0$ and decreases after — relative maximum at $x_0$',
          ok: true,
        },
        {label: 'Relative minimum at $x_0$', ok: false},
        {label: 'Neither max nor min', ok: false},
      ],
      caption: 'Rise then fall is a local peak.',
    },
    {
      ask: 'Case $\\{-,\\,+\\}$ follows from $\\{+,\\,-\\}$ applied to…',
      choices: [
        {label: '$-f$ (negating swaps max and min)', ok: true},
        {label: '$f\'\'$ only', ok: false},
        {label: 'The constant function $0$', ok: false},
      ],
      caption: 'Fall then rise is a local valley.',
    },
    {
      ask: 'Cases $\\{+,\\,+\\}$ or $\\{-,\\,-\\}$ mean…',
      choices: [
        {
          label: '$f$ keeps the same mono type through $x_0$ — neither relative max nor min',
          ok: true,
        },
        {label: 'Always an absolute maximum on $\\mathbb{R}$', ok: false},
        {label: '$f\'(x_0)$ cannot be zero', ok: false},
      ],
      caption: 'Horizontal tangent without a turn (e.g. $x^{3}$ at $0$).',
    },
  ],
};

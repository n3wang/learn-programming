/** Guided proof: Rolle from EVT + Thm 13.1. */

export default {
  title: 'Proof — Rolle’s Theorem',
  lead: 'Constant case, then Extreme Value Theorem + critical-point theorem.',
  steps: [
    {
      ask: 'If $f\\equiv 0$ on $[a,b]$, then…',
      choices: [
        {label: '$f\'=0$ everywhere on $(a,b)$, so Rolle holds trivially', ok: true},
        {label: 'Rolle fails', ok: false},
        {label: '$f\'$ cannot exist', ok: false},
      ],
      caption: 'The zero function already has horizontal tangents everywhere.',
    },
    {
      ask: 'If $f$ is not identically zero but $f(a)=f(b)=0$, EVT gives…',
      choices: [
        {
          label: 'A max or min on $[a,b]$ attained at some $x_0\\in(a,b)$ (value cannot be $0$ at the ends only)',
          ok: true,
        },
        {label: 'No extrema ever', ok: false},
        {label: 'A discontinuity at $a$', ok: false},
      ],
      caption: 'A strictly positive max (or negative min) cannot occur at the zero endpoints.',
    },
    {
      ask: 'That interior extremum, with differentiability, forces…',
      choices: [
        {label: '$f\'(x_0)=0$ by Theorem 13.1', ok: true},
        {label: '$f(x_0)=f\'(x_0)$', ok: false},
        {label: '$f\'\'(x_0)=0$ only', ok: false},
      ],
      caption: 'Rolle = “equal endpoint zeros ⇒ horizontal tangent inside.”',
    },
  ],
};

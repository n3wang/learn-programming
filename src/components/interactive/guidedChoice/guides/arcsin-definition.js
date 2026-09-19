/** Guided: arcsin definition and range. */

export default {
  title: 'Arcsine — definition',
  lead: 'Restrict sin to [−π/2, π/2] to get a one-to-one inverse.',
  steps: [
    {
      ask: 'sin⁻¹ x = y means…',
      choices: [
        {label: 'sin y = x with y ∈ [−π/2, π/2]', ok: true},
        {label: '1/sin x = y', ok: false},
        {label: 'sin x = y with no range restriction', ok: false},
      ],
      caption: 'Inverse trig ≠ reciprocal trig.',
    },
    {
      ask: 'Domain and range of arcsin are…',
      choices: [
        {label: 'Domain [−1,1], range [−π/2, π/2]', ok: true},
        {label: 'Domain ℝ, range [0, π]', ok: false},
        {label: 'Domain [−1,1], range [0, π]', ok: false},
      ],
      caption: 'Range equals the restricted domain of sin.',
    },
    {
      ask: 'arcsin(−x) equals…',
      choices: [
        {label: '−arcsin x (odd)', ok: true},
        {label: 'arcsin x', ok: false},
        {label: 'π − arcsin x', ok: false},
      ],
      caption: 'Because sin is odd on [−π/2, π/2].',
    },
  ],
};

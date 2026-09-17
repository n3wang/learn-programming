/** Guided: first derivative test sign patterns. */

export default {
  title: 'First derivative test',
  lead: 'Read the sign of f′ just left and right of a critical number where f′(c)=0.',
  steps: [
    {
      ask: 'Case {+, −} (f′ positive left, negative right) means…',
      choices: [
        {label: 'Relative maximum at c', ok: true},
        {label: 'Relative minimum at c', ok: false},
        {label: 'Neither', ok: false},
      ],
      caption: 'The graph rises into c and falls away.',
    },
    {
      ask: 'Case {−, +} means…',
      choices: [
        {label: 'Relative minimum at c', ok: true},
        {label: 'Relative maximum at c', ok: false},
        {label: 'Inflection only, always', ok: false},
      ],
      caption: 'Falls into c, then rises.',
    },
    {
      ask: 'Cases {+, +} or {−, −} mean…',
      choices: [
        {label: 'Neither a relative max nor a relative min at c', ok: true},
        {label: 'Always an absolute max on ℝ', ok: false},
        {label: 'f′(c) cannot be zero', ok: false},
      ],
      caption: 'Same-sign slopes: a horizontal tangent that is not a turning point (e.g. x³).',
    },
  ],
};

/** Guided: arccos and arctan ranges + derivatives. */

export default {
  title: 'Arccos and arctan',
  lead: 'Restricted domains for cos and tan; derivative formulas.',
  steps: [
    {
      ask: 'Range of arccos is…',
      choices: [
        {label: '[0, π]', ok: true},
        {label: '[−π/2, π/2]', ok: false},
        {label: '(−π/2, π/2)', ok: false},
      ],
      caption: 'Cos restricted to [0, π] is one-to-one.',
    },
    {
      ask: 'Dₓ(arccos x) equals…',
      choices: [
        {label: '−1 / √(1 − x²)', ok: true},
        {label: '1 / √(1 − x²)', ok: false},
        {label: '1 / (1 + x²)', ok: false},
      ],
      caption: 'Opposite sign of arcsin′ (and arcsin+arccos=π/2).',
    },
    {
      ask: 'Dₓ(arctan x) equals…',
      choices: [
        {label: '1 / (1 + x²)', ok: true},
        {label: '1 / √(1 − x²)', ok: false},
        {label: 'sec² x', ok: false},
      ],
      caption: 'From sec² y · y′ = 1 and sec² = 1 + tan².',
    },
  ],
};

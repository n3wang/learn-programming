/** Guided: arcsin x = arctan(x/√(1−x²)) and sec⁻¹ vs arccos. */

export default {
  title: 'Inverse-trig identities',
  lead: 'Triangle / range arguments relating arcsin, arctan, sec⁻¹, arccos.',
  steps: [
    {
      ask: 'For |x|<1, if θ = arcsin x then tan θ equals…',
      choices: [
        {label: 'x / √(1−x²)', ok: true},
        {label: '√(1−x²)/x', ok: false},
        {label: '1/x', ok: false},
      ],
      caption: 'Opp x, adj √(1−x²) on [−π/2,π/2].',
    },
    {
      ask: 'Therefore arcsin x equals…',
      choices: [
        {label: 'arctan(x/√(1−x²)) for |x|<1', ok: true},
        {label: 'arccos x', ok: false},
        {label: 'arctan x always', ok: false},
      ],
      caption: 'At |x|=1 the arctan expression blows up / needs a limit.',
    },
    {
      ask: 'For x ≥ 1, sec⁻¹ x equals…',
      choices: [
        {label: 'arccos(1/x)', ok: true},
        {label: 'arcsin(1/x)', ok: false},
        {label: '2π − arccos(1/x)', ok: false},
      ],
      caption: 'For x ≤ −1 this chapter uses 2π − arccos(1/x).',
    },
  ],
};

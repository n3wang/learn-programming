/** Guided proof: Dₓ(sec⁻¹ x) = 1/(x √(x²−1)). */

export default {
  title: 'Proof — derivative of sec⁻¹',
  lead: 'Implicit differentiation of sec y = x; tan y > 0 on the chosen range.',
  steps: [
    {
      ask: 'If y = sec⁻¹ x, differentiating sec y = x gives…',
      choices: [
        {label: 'tan y · sec y · y′ = 1', ok: true},
        {label: 'cos y · y′ = 1', ok: false},
        {label: 'sec² y · y′ = 1', ok: false},
      ],
      caption: 'D(sec)=tan sec.',
    },
    {
      ask: 'On this chapter’s range for sec⁻¹, tan y equals…',
      choices: [
        {label: '+√(x² − 1) (positive)', ok: true},
        {label: '−√(x² − 1)', ok: false},
        {label: 'x', ok: false},
      ],
      caption: 'tan² = sec² − 1 = x² − 1; range forces tan ≥ 0.',
    },
    {
      ask: 'Therefore y′ equals…',
      choices: [
        {label: '1 / (x √(x² − 1))', ok: true},
        {label: '−1 / (x √(x² − 1))', ok: false},
        {label: '1 / √(1 − x²)', ok: false},
      ],
      caption: '1/(tan y · sec y) with sec y = x.',
    },
  ],
};

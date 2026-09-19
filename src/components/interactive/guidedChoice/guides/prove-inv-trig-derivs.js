/** Guided: prove (18.2), (18.4), (18.6) sketch. */

export default {
  title: 'Prove arccos′, arccot′, csc⁻¹′',
  lead: 'Implicit differentiation + range sign choices.',
  steps: [
    {
      ask: 'For y = arccos x, cos y = x ⇒ −sin y · y′ = 1. On [0,π], sin y ≥ 0, so…',
      choices: [
        {label: 'y′ = −1/√(1−x²)', ok: true},
        {label: 'y′ = +1/√(1−x²)', ok: false},
        {label: 'y′ = 1/(1+x²)', ok: false},
      ],
      caption: 'Formula (18.2).',
    },
    {
      ask: 'For y = arccot x, −csc² y · y′ = 1 and csc² = 1 + cot² give…',
      choices: [
        {label: 'y′ = −1/(1+x²)', ok: true},
        {label: 'y′ = 1/(1+x²)', ok: false},
        {label: 'y′ = −1/√(1−x²)', ok: false},
      ],
      caption: 'Formula (18.4).',
    },
    {
      ask: 'For y = csc⁻¹ x, differentiating csc y = x yields a formula that is…',
      choices: [
        {
          label: 'The negative of (sec⁻¹)′: −1/(x √(x²−1))',
          ok: true,
        },
        {label: 'Identical to (sec⁻¹)′', ok: false},
        {label: '1/√(1−x²)', ok: false},
      ],
      caption: 'Formula (18.6).',
    },
  ],
};

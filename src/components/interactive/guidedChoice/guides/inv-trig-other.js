/** Guided: arccot, arcsec, arccsc derivative formulas. */

export default {
  title: 'Other inverse trig derivatives',
  lead: 'cot⁻¹, sec⁻¹, csc⁻¹ — domains chosen for clean formulas.',
  steps: [
    {
      ask: 'Dₓ(cot⁻¹ x) equals…',
      choices: [
        {label: '−1 / (1 + x²)', ok: true},
        {label: '1 / (1 + x²)', ok: false},
        {label: '1 / (x √(x²−1))', ok: false},
      ],
      caption: 'Negative of arctan′.',
    },
    {
      ask: 'Domain of sec⁻¹ x (and csc⁻¹ x) is…',
      choices: [
        {label: '|x| ≥ 1', ok: true},
        {label: '[−1, 1]', ok: false},
        {label: 'All real x', ok: false},
      ],
      caption: 'Range of sec/csc outside (−1,1).',
    },
    {
      ask: 'Dₓ(sec⁻¹ x) equals…',
      choices: [
        {label: '1 / (x √(x² − 1))', ok: true},
        {label: '−1 / (x √(x² − 1))', ok: false},
        {label: '1 / √(1 − x²)', ok: false},
      ],
      caption: 'Formula (18.5); csc⁻¹ flips the sign.',
    },
  ],
};

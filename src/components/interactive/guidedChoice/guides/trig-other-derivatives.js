/** Guided: derivatives of tan, cot, sec, csc. */

export default {
  title: 'Derivatives of tan, cot, sec, csc',
  lead: 'Quotient / reciprocal rules from sin and cos.',
  steps: [
    {
      ask: 'Dₓ(tan x) = Dₓ(sin x / cos x) equals…',
      choices: [
        {label: 'sec² x', ok: true},
        {label: '−csc² x', ok: false},
        {label: 'tan x sec x', ok: false},
      ],
      caption: 'Quotient rule + sin²+cos²=1.',
    },
    {
      ask: 'Dₓ(sec x) = Dₓ(1/cos x) equals…',
      choices: [
        {label: 'tan x sec x', ok: true},
        {label: 'sec² x', ok: false},
        {label: '−cot x csc x', ok: false},
      ],
      caption: 'Chain/reciprocal: sin/cos² = (sin/cos)(1/cos).',
    },
    {
      ask: 'tan(x+π) equals…',
      choices: [
        {label: 'tan x (period π)', ok: true},
        {label: '−tan x', ok: false},
        {label: 'cot x', ok: false},
      ],
      caption: 'sin and cos both flip sign; their ratio is unchanged.',
    },
  ],
};

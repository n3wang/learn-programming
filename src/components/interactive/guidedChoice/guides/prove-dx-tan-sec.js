/** Guided proof: Dₓ(tan x)=sec²x and Dₓ(sec x)=tan x sec x. */

export default {
  title: 'Proof — derivatives of tan and sec',
  lead: 'Quotient / reciprocal rules from sin and cos.',
  steps: [
    {
      ask: 'Writing tan x = sin x / cos x, the quotient rule numerator is…',
      choices: [
        {
          label: 'cos x · cos x − sin x · (−sin x) = cos²x + sin²x',
          ok: true,
        },
        {label: 'sin x cos x only', ok: false},
        {label: '−sin²x − cos²x', ok: false},
      ],
      caption: '(u′v − uv′) with u=sin, v=cos.',
    },
    {
      ask: 'Hence Dₓ(tan x) simplifies to…',
      choices: [
        {label: '1/cos²x = sec²x', ok: true},
        {label: '−csc²x', ok: false},
        {label: 'tan x sec x', ok: false},
      ],
      caption: '(cos²+sin²)/cos² = 1/cos².',
    },
    {
      ask: 'For sec x = 1/cos x, the Chain/reciprocal rule gives…',
      choices: [
        {
          label: '−(−sin x)/cos²x = sin x / cos²x = tan x sec x',
          ok: true,
        },
        {label: 'sec²x', ok: false},
        {label: '−cot x csc x', ok: false},
      ],
      caption: 'D(1/v) = −v′/v² with v=cos.',
    },
  ],
};

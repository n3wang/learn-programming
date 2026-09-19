/** Guided: tan(x+π)=tan x and tan(u−v) formula. */

export default {
  title: 'Proof — tan period and tan(u−v)',
  lead: 'Sign flip under +π; divide sin/cos addition by cos u cos v.',
  steps: [
    {
      ask: 'sin(x+π) and cos(x+π) equal…',
      choices: [
        {label: '−sin x and −cos x', ok: true},
        {label: 'sin x and −cos x', ok: false},
        {label: '−sin x and cos x', ok: false},
      ],
      caption: 'Addition formulas with cos π=−1, sin π=0.',
    },
    {
      ask: 'Therefore tan(x+π) equals…',
      choices: [
        {label: 'tan x (period π)', ok: true},
        {label: '−tan x', ok: false},
        {label: 'cot x', ok: false},
      ],
      caption: 'Ratio of two negatives cancels.',
    },
    {
      ask: 'Dividing sin(u−v)/cos(u−v) by cos u cos v yields…',
      choices: [
        {
          label: '(tan u − tan v)/(1 + tan u tan v)',
          ok: true,
        },
        {label: '(tan u + tan v)/(1 − tan u tan v)', ok: false},
        {label: 'tan u − tan v', ok: false},
      ],
      caption: 'Numerator → tan u − tan v; denominator → 1 + tan u tan v.',
    },
  ],
};

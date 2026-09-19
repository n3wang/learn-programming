/** Guided: angle-addition and related identities. */

export default {
  title: 'Angle-addition formulas',
  lead: 'Start from cos(u−v); derive the rest by substituting −v or cofunctions.',
  steps: [
    {
      ask: 'The core identity (16.6) is…',
      choices: [
        {label: 'cos(u−v) = cos u cos v + sin u sin v', ok: true},
        {label: 'cos(u−v) = cos u cos v − sin u sin v', ok: false},
        {label: 'sin(u+v) = sin u sin v', ok: false},
      ],
      caption: 'Other addition formulas build from this one.',
    },
    {
      ask: 'cos(u+v) follows from (16.6) by…',
      choices: [
        {label: 'Replacing v by −v and using cos even / sin odd', ok: true},
        {label: 'Setting u = v only', ok: false},
        {label: 'Dividing by sin u', ok: false},
      ],
      caption: 'Yields cos(u+v) = cos u cos v − sin u sin v.',
    },
    {
      ask: 'sin(u+v) can be obtained as…',
      choices: [
        {
          label: 'cos(π/2 − (u+v)) expanded with (16.6) and cofunctions',
          ok: true,
        },
        {label: 'cos(u+v) alone', ok: false},
        {label: 'Only from a calculator', ok: false},
      ],
      caption: 'Gives sin(u+v) = sin u cos v + cos u sin v.',
    },
  ],
};

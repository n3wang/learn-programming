/** Guided: related-rates workflow + ladder. */

export default {
  title: 'Related rates — method',
  lead: 'Relate quantities, differentiate in t, plug the instant.',
  steps: [
    {
      ask: 'First step in a related-rates problem is…',
      choices: [
        {
          label: 'Draw a figure and name the changing quantities with variables',
          ok: true,
        },
        {label: 'Plug numbers into the derivative immediately', ok: false},
        {label: 'Ignore units', ok: false},
      ],
      caption: 'Geometry first; rates later.',
    },
    {
      ask: 'After writing an equation relating the variables, you…',
      choices: [
        {
          label: 'Differentiate both sides with respect to t (Chain Rule)',
          ok: true,
        },
        {label: 'Differentiate with respect to x only', ok: false},
        {label: 'Set all rates to zero', ok: false},
      ],
      caption: 'That connects the unknown rate to known rates.',
    },
    {
      ask: 'When do you substitute the specific values (like x=7)?',
      choices: [
        {
          label: 'After differentiating — never before (unless a quantity is constant)',
          ok: true,
        },
        {label: 'Before differentiating always', ok: false},
        {label: 'Never', ok: false},
      ],
      caption: 'Constants (ladder length) can be plugged earlier.',
    },
  ],
};

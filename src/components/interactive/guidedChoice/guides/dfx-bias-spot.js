/** Guided: naming judgmental biases. */

export default {
  title: 'Name the bias',
  lead: 'Identify what is distorting the forecast.',
  steps: [
    {
      ask: 'Finance pushes the forecast up to match the annual budget despite weak sales.',
      choices: [
        {label: 'Enforcing', ok: true},
        {label: 'Sandbagging', ok: false},
        {label: 'Hedging', ok: false},
      ],
      caption: 'A goal masquerading as a prediction.',
    },
    {
      ask: 'Marketing cites one enthusiastic customer interview as proof the launch will be huge.',
      choices: [
        {label: 'Confirmation bias', ok: true},
        {label: 'Anchoring', ok: false},
        {label: 'Hindsight', ok: false},
      ],
      caption: 'Favouring evidence that supports what we want to believe.',
    },
    {
      ask: 'The process counts new store openings but ignores closures.',
      choices: [
        {label: 'One-sided data (biased process)', ok: true},
        {label: 'Apophenia', ok: false},
        {label: 'Sandbagging', ok: false},
      ],
      caption: 'Blind spots built into the process.',
    },
  ],
};

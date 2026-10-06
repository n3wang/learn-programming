/** Guided: when to adjust the baseline. */

export default {
  title: 'Adjust or not?',
  lead: 'Adjust only with information the model lacks.',
  steps: [
    {
      ask: '“Our largest customer is switching suppliers next quarter.”',
      choices: [
        {label: 'Adjust — the model can’t know this', ok: true},
        {label: 'Don’t adjust', ok: false},
        {label: 'Edit last year’s history', ok: false},
      ],
      caption: 'Customer information is classic planner value.',
    },
    {
      ask: '“The trend looks too flat to me.” (no new information)',
      choices: [
        {label: 'Don’t adjust — if the model misses trends, fix the model', ok: true},
        {label: 'Raise every item by 5%', ok: false},
        {label: 'Adjust only A items', ok: false},
      ],
      caption: 'Gut feel rarely beats the model on patterns it already sees.',
    },
    {
      ask: 'Price rises next month, and price is already a model feature.',
      choices: [
        {label: 'Don’t adjust — that would double-count', ok: true},
        {label: 'Cut the forecast 10% anyway', ok: false},
        {label: 'Raise it', ok: false},
      ],
      caption: 'Check what the model already knows.',
    },
  ],
};

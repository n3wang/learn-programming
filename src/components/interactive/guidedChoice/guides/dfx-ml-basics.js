/** Guided: machine-learning basics for forecasters. */

export default {
  title: 'ML in plain terms',
  lead: 'Apply the core ideas.',
  steps: [
    {
      ask: 'You want the model to anticipate Black Friday. What matters most?',
      choices: [
        {label: 'A feature saying whether each item will be discounted', ok: true},
        {label: 'A deeper neural network', ok: false},
        {label: 'Three more years of history only', ok: false},
      ],
      caption: 'Features carry the information; algorithms can’t invent it.',
    },
    {
      ask: 'You have 30 items with 2 years of history. Global ML or simple local models?',
      choices: [
        {label: 'Start with simple models and benchmarks — too little data for ML to shine', ok: true},
        {label: 'Global ML will surely win', ok: false},
        {label: 'Neither — stop forecasting', ok: false},
      ],
      caption: 'Global models need many examples.',
    },
    {
      ask: 'Weather has 0.01% feature importance. What can you conclude?',
      choices: [
        {label: 'The model barely uses it — likely safe to drop (or check data quality if you expected more)', ok: true},
        {label: 'Weather lowers demand', ok: false},
        {label: 'Weather is the key driver', ok: false},
      ],
      caption: 'Importance shows reliance, not direction or size of effect.',
    },
  ],
};

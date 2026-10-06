/** Guided: error analysis in the model loop. */

export default {
  title: 'Diagnose the miss',
  lead: 'Error analysis shows big misses. What is the root cause?',
  steps: [
    {
      ask: 'Demand dropped 30% after a price rise the model never saw.',
      choices: [
        {label: 'Missing driver — add price data the model can use', ok: true},
        {label: 'Wrong data', ok: false},
        {label: 'Overfitting', ok: false},
      ],
      caption: 'You can’t blame a model for information it never had.',
    },
    {
      ask: 'History shows a 10× spike from a duplicated order upload.',
      choices: [
        {label: 'Wrong data — fix the source, don’t hand-smooth', ok: true},
        {label: 'Missing driver', ok: false},
        {label: 'Underfitting', ok: false},
      ],
      caption: 'Fix root causes.',
    },
    {
      ask: 'The model forecasts a December peak that never existed in demand.',
      choices: [
        {label: 'Overfitting — tune or simplify the model', ok: true},
        {label: 'Underfitting', ok: false},
        {label: 'Shortage', ok: false},
      ],
      caption: 'It fitted noise as seasonality.',
    },
  ],
};

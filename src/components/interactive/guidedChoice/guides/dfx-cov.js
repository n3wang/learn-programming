/** Guided: why COV misleads. */

export default {
  title: 'Is COV telling the truth?',
  lead: 'Judge forecastability correctly.',
  steps: [
    {
      ask: 'Demand 10, 20, 30, 40, 50, 60 has COV ≈ 49%. Hard to forecast?',
      choices: [
        {label: 'No — a steady trend is easy to forecast', ok: true},
        {label: 'Yes — high COV', ok: false},
        {label: 'Cannot tell from anything', ok: false},
      ],
      caption: 'Trend inflates COV.',
    },
    {
      ask: 'Why does COV look better than real forecasts even for flat demand?',
      choices: [
        {label: 'It compares each period with that same period’s mean — data leakage', ok: true},
        {label: 'It squares errors', ok: false},
        {label: 'It uses weights', ok: false},
      ],
      caption: 'A real forecaster never knows the future mean.',
    },
    {
      ask: 'What should replace COV as a forecastability measure?',
      choices: [
        {label: 'The out-of-sample error of a good simple benchmark', ok: true},
        {label: 'MAPE', ok: false},
        {label: 'Sales volume', ok: false},
      ],
      caption: 'Measure what a fair forecast can actually achieve.',
    },
  ],
};

/** Guided: which KPI misbehaves where. */

export default {
  title: 'Which metric misleads here?',
  lead: 'Spot the metric that gives the wrong signal.',
  steps: [
    {
      ask: 'One huge demand spike dominates the score.',
      choices: [
        {label: 'RMSE', ok: true},
        {label: 'MAE', ok: false},
        {label: 'MAPE', ok: false},
      ],
      caption: 'Squaring amplifies the single big error.',
    },
    {
      ask: 'An intermittent item: which metric prefers forecasting zero forever?',
      choices: [
        {label: 'MAE', ok: true},
        {label: 'RMSE', ok: false},
        {label: 'Bias', ok: false},
      ],
      caption: 'MAE aims at the median, which is zero.',
    },
    {
      ask: 'Which metric cannot be computed when some periods have zero demand?',
      choices: [
        {label: 'MAPE', ok: true},
        {label: 'MAE', ok: false},
        {label: 'Bias', ok: false},
      ],
      caption: 'It divides by each period’s demand.',
    },
  ],
};

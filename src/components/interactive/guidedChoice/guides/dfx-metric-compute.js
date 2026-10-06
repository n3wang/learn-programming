/** Guided: computing bias, MAE, MAPE, RMSE. */

export default {
  title: 'Compute the metrics',
  lead: 'Demand 10 and 20; forecast 15 and 15.',
  steps: [
    {
      ask: 'Bias (average error, forecast − demand)?',
      choices: [
        {label: '0', ok: true},
        {label: '5', ok: false},
        {label: '−5', ok: false},
      ],
      caption: 'Errors +5 and −5 cancel — bias alone hides the misses.',
    },
    {
      ask: 'MAE% (total abs error ÷ total demand)?',
      choices: [
        {label: '33.3%', ok: true},
        {label: '37.5%', ok: false},
        {label: '50%', ok: false},
      ],
      caption: '10 / 30 = 33.3%.',
    },
    {
      ask: 'MAPE (average of each abs error ÷ its own demand)?',
      choices: [
        {label: '37.5%', ok: true},
        {label: '33.3%', ok: false},
        {label: '25%', ok: false},
      ],
      caption: '(50% + 25%) / 2 = 37.5% — the low-demand period weighs more.',
    },
  ],
};

/** Guided: the MAE + |bias| score. */

export default {
  title: 'Score the forecasts',
  lead: 'Score% = MAE% + |Bias%|.',
  steps: [
    {
      ask: 'Forecast A: MAE 35%, bias −10%. Score?',
      choices: [
        {label: '45%', ok: true},
        {label: '25%', ok: false},
        {label: '35%', ok: false},
      ],
      caption: 'Always add the absolute bias.',
    },
    {
      ask: 'Forecast B: MAE 38%, bias +1%. Which is better, A or B?',
      choices: [
        {label: 'B (39% vs 45%)', ok: true},
        {label: 'A (lower MAE)', ok: false},
        {label: 'Tie', ok: false},
      ],
      caption: 'A slightly worse MAE can be worth a much smaller bias.',
    },
    {
      ask: 'How do you present this to management?',
      choices: [
        {label: 'Show MAE and bias separately, with a plain-language conclusion', ok: true},
        {label: 'Only show the combined score', ok: false},
        {label: 'Show MAPE', ok: false},
      ],
      caption: '“B is the best balance of accuracy and bias.”',
    },
  ],
};

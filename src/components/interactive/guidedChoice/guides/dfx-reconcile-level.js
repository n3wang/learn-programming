/** Guided: why forecasts differ across hierarchy levels. */

export default {
  title: 'Sum of forecasts vs forecast of sum',
  lead: 'Explain differences between levels.',
  steps: [
    {
      ask: 'The family forecast is 5% above the sum of SKU forecasts. Most likely reason?',
      choices: [
        {label: 'Spot sales and odd items appear at family level but are unpredictable per SKU', ok: true},
        {label: 'A calculation error', ok: false},
        {label: 'The family model is always wrong', ok: false},
      ],
      caption: 'The forecast of the sum is not the sum of the forecasts.',
    },
    {
      ask: 'An 18-month bottom-up forecast keeps falling while the family is stable.',
      choices: [
        {label: 'It sees products ending but not the replacements', ok: true},
        {label: 'The market is collapsing', ok: false},
        {label: 'Seasonality', ok: false},
      ],
      caption: 'Life-cycle effects bias long-term bottom-up forecasts low.',
    },
    {
      ask: 'Should you scale SKU forecasts up so they match the family total?',
      choices: [
        {label: 'Not blindly — it can spread unpredictable volume onto the wrong SKUs', ok: true},
        {label: 'Always', ok: false},
        {label: 'Never compare levels', ok: false},
      ],
      caption: 'Scaling the fruit example raised SKU error from 500 to 1,000.',
    },
  ],
};

/** Guided: level, trend, seasonality. */

export default {
  title: 'Read the components',
  lead: 'Level 2,000/month, trend +50/month, additive seasonality: December +600.',
  steps: [
    {
      ask: 'Forecast for December, 4 months ahead?',
      choices: [
        {label: '2,800', ok: true},
        {label: '2,600', ok: false},
        {label: '2,200', ok: false},
      ],
      caption: '2,000 + 4×50 + 600 = 2,800.',
    },
    {
      ask: 'The engine fits trend + seasonality to 14 months of noisy data. Risk?',
      choices: [
        {label: 'Overfitting — inventing patterns from noise', ok: true},
        {label: 'Underfitting', ok: false},
        {label: 'No risk', ok: false},
      ],
      caption: 'Seasonality needs several cycles.',
    },
    {
      ask: 'Software defaults to multiplicative trends. Recommendation?',
      choices: [
        {label: 'Prefer additive trends', ok: true},
        {label: 'Keep multiplicative', ok: false},
        {label: 'Remove the level', ok: false},
      ],
      caption: 'Compounding growth is risky to extrapolate.',
    },
  ],
};

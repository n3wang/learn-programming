/** Guided: trading volatility. */

export default {
  title: 'Trade the volatility view',
  lead: 'Pick the position for each view.',
  steps: [
    {
      ask: 'You expect implied vol to fall and the market to stay calm.',
      choices: [
        {label: 'Sell an ATM straddle (or sell options and delta-hedge)', ok: true},
        {label: 'Buy a straddle', ok: false},
        {label: 'Buy calls only', ok: false},
      ],
      caption: 'Collect theta; risk is large realised moves (short gamma).',
    },
    {
      ask: 'You bought options and delta-hedge. The market swings sharply up and down.',
      choices: [
        {label: 'Re-hedging profits: sell high, buy back low', ok: true},
        {label: 'Re-hedging losses', ok: false},
        {label: 'No effect', ok: false},
      ],
      caption: 'Long gamma benefits from realised volatility — minus theta.',
    },
    {
      ask: 'Annual vol is 15% and gold is 1,425. Roughly what daily range is “normal”?',
      choices: [
        {label: 'About ±13.5', ok: true},
        {label: 'About ±214', ok: false},
        {label: 'About ±1.4', ok: false},
      ],
      caption: '15% / √250 ≈ 0.95% per day.',
    },
  ],
};

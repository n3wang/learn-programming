/** Guided: choosing forwards, futures, swaps, or options. */

export default {
  title: 'Pick the instrument',
  lead: 'Match each need to a derivative.',
  steps: [
    {
      ask: 'A jeweller wants a fixed gold price for one delivery in 3 months, negotiated with its bank.',
      choices: [
        {label: 'OTC forward', ok: true},
        {label: 'Average rate option', ok: false},
        {label: 'Spread option', ok: false},
      ],
      caption: 'Bilateral price certainty for a single date.',
    },
    {
      ask: 'A trader wants standardised, exchange-cleared exposure it can exit any day.',
      choices: [
        {label: 'Futures', ok: true},
        {label: 'Forward', ok: false},
        {label: 'Physical supply contract', ok: false},
      ],
      caption: 'Standard terms, clearing, daily margin.',
    },
    {
      ask: 'An airline buys fuel every month at the monthly average price and wants a fixed cost for two years.',
      choices: [
        {label: 'Pay-fixed swap on the monthly average', ok: true},
        {label: 'One forward for month 24', ok: false},
        {label: 'Sell a call', ok: false},
      ],
      caption: 'A strip of average-price settlements matches the exposure.',
    },
  ],
};

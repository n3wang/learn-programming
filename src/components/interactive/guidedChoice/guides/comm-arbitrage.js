/** Guided: cash-and-carry and commodity arbitrage. */

export default {
  title: 'Spot the arbitrage',
  lead: 'Compare market prices with cash-and-carry fair value.',
  steps: [
    {
      ask: 'Cash aluminium 2,000; one week’s carry 3.50; one-week forward 2,005. Trade?',
      choices: [
        {label: 'Buy cash, sell forward — lock in 1.50', ok: true},
        {label: 'Sell cash, buy forward', ok: false},
        {label: 'No arbitrage', ok: false},
      ],
      caption: 'Fair forward 2,003.50 < market 2,005.',
    },
    {
      ask: 'Crude spot 47, 12-month forward 60, storage on a tanker ~7.20/bbl/yr, low rates.',
      choices: [
        {label: 'Buy spot, store at sea, sell forward', ok: true},
        {label: 'Sell spot, buy forward', ok: false},
        {label: 'Nothing — storage is impossible', ok: false},
      ],
      caption: 'A steep contango pays for storage.',
    },
    {
      ask: 'Copper is backwardated and the forward looks “cheap” versus carry. Can you sell spot and buy forward?',
      choices: [
        {label: 'Usually not — there is no physical metal to borrow to sell spot', ok: true},
        {label: 'Yes, risk-free', ok: false},
        {label: 'Only on weekends', ok: false},
      ],
      caption: 'Scarcity blocks the reverse cash-and-carry.',
    },
  ],
};

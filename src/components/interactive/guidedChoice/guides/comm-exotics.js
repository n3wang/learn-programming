/** Guided: exotic option building blocks. */

export default {
  title: 'Name the exotic',
  lead: 'Match each payoff to its exotic option.',
  steps: [
    {
      ask: 'Pays a fixed USD 10,000 if gold ends above 1,500, however far above.',
      choices: [
        {label: 'Binary (digital) option', ok: true},
        {label: 'Average rate option', ok: false},
        {label: 'Spread option', ok: false},
      ],
      caption: 'Fixed payout, like a bet.',
    },
    {
      ask: 'A refiner wants protection if gasoline minus crude narrows below USD 10.',
      choices: [
        {label: 'Put on the crack spread with strike 10', ok: true},
        {label: 'Call on crude', ok: false},
        {label: 'Digital call on gasoline', ok: false},
      ],
      caption: 'Put payoff = MAX(strike − (gasoline − crude), 0).',
    },
    {
      ask: 'A buyer’s physical contract prices on the monthly average; it wants a cap.',
      choices: [
        {label: 'Average rate call', ok: true},
        {label: 'Up-and-out call', ok: false},
        {label: 'Vanilla put', ok: false},
      ],
      caption: 'Match the hedge to how the commercial contract prices.',
    },
  ],
};

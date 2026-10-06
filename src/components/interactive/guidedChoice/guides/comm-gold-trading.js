/** Guided: gold trading structures and yield enhancement. */

export default {
  title: 'Trade and enhance',
  lead: 'Match the need to the structure.',
  steps: [
    {
      ask: 'A bank with weak credit needs cheap 3-month USD funding and owns gold.',
      choices: [
        {label: 'Gold swap: sell gold spot, buy it back forward', ok: true},
        {label: 'Buy gold futures', ok: false},
        {label: 'Deferred margin account', ok: false},
      ],
      caption: 'A gold swap is a USD loan collateralised by gold.',
    },
    {
      ask: 'A hedge fund wants gold exposure but must never take metal delivery.',
      choices: [
        {label: 'Non-deliverable (cash-settled) gold swap', ok: true},
        {label: 'Allocated bullion', ok: false},
        {label: 'Locational swap', ok: false},
      ],
      caption: 'Settles one USD amount at maturity.',
    },
    {
      ask: 'A central bank wants extra income on reserves and expects gold to rise only modestly.',
      choices: [
        {label: 'Covered call with an out-of-the-money strike', ok: true},
        {label: 'Buy calls', ok: false},
        {label: 'Sell all its gold', ok: false},
      ],
      caption: 'Premium adds yield; gains above strike + premium are given up.',
    },
  ],
};

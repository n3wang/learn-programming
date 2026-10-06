/** Guided: choosing a corporate hedging approach. */

export default {
  title: 'Choose the hedge strategy',
  lead: 'An automaker buys aluminium for car bodies.',
  steps: [
    {
      ask: 'Aluminium is 1% of the car’s cost and price changes are easily passed on.',
      choices: [
        {label: 'Possibly don’t hedge', ok: true},
        {label: 'Hedge 150% with options', ok: false},
        {label: 'Buy the smelter', ok: false},
      ],
      caption: 'Small, pass-through exposures may not justify hedging.',
    },
    {
      ask: 'A fixed-price fleet contract is signed for 2 years of deliveries.',
      choices: [
        {label: 'Lock in unit costs with forwards or swaps for the contract volume', ok: true},
        {label: 'Stay unhedged and hope', ok: false},
        {label: 'Sell call options', ok: false},
      ],
      caption: 'Fixed revenue → fix the cost to protect margin.',
    },
    {
      ask: 'Production forecasts are uncertain.',
      choices: [
        {label: 'Hedge a proportion (e.g. 70%) with cash-settled contracts', ok: true},
        {label: 'Hedge 100% physically with one mine', ok: false},
        {label: 'Hedge double to be safe', ok: false},
      ],
      caption: 'Avoid hedges with no underlying exposure.',
    },
  ],
};

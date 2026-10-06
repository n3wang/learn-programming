/** Guided: coal producer hedging choices. */

export default {
  title: 'Hedge a coal producer',
  lead: 'An Australian miner sells 5,000 t a month at the floating API2 price.',
  steps: [
    {
      ask: 'It fears prices will fall and likes the current USD 60 swap level.',
      choices: [
        {label: 'Receive fixed 60 / pay floating API2 on a swap', ok: true},
        {label: 'Pay fixed 60 / receive floating', ok: false},
        {label: 'Buy calls', ok: false},
      ],
      caption: 'Floating legs cancel; it earns 60/t.',
    },
    {
      ask: 'It expects prices to rise but cannot afford to be wrong.',
      choices: [
        {label: 'Buy a receiver swaption (right to receive fixed 60) for a premium', ok: true},
        {label: 'Receive fixed on a swap today', ok: false},
        {label: 'Sell puts', ok: false},
      ],
      caption: 'Floor at 60 less premium, upside kept.',
    },
    {
      ask: 'Spot is 50; it thinks prices will stay below 55 and wants extra cash flow.',
      choices: [
        {label: 'Sell a 55 call for about 2 (covered call)', ok: true},
        {label: 'Buy a 55 call', ok: false},
        {label: 'Buy a 45 put', ok: false},
      ],
      caption: 'Above 55 it is capped at 57.',
    },
    {
      ask: 'It sells most output on long-term fixed contracts and now expects a rally.',
      choices: [
        {label: 'Pay fixed / receive floating to regain exposure to rising prices', ok: true},
        {label: 'Receive fixed on more volume', ok: false},
        {label: 'Sell covered calls', ok: false},
      ],
      caption: 'Swaps can add risk as well as remove it.',
    },
  ],
};

/** Guided: hedging plastics without futures. */

export default {
  title: 'Hedge plastics without futures',
  lead: 'Pick a hedge for each participant.',
  steps: [
    {
      ask: 'A converter buys 500 t a month at the index price and fears increases.',
      choices: [
        {label: 'Pay fixed on an index swap (or buy a strip of forwards)', ok: true},
        {label: 'Receive fixed on a swap', ok: false},
        {label: 'Sell calls', ok: false},
      ],
      caption: 'Swap gains offset higher physical costs.',
    },
    {
      ask: 'A distributor has sold 200 t forward at a fixed price but has not bought it yet.',
      choices: [
        {label: 'Offset hedge: buy a matching forward now', ok: true},
        {label: 'Sell a forward', ok: false},
        {label: 'Wait for delivery', ok: false},
      ],
      caption: 'Locks the margin on that specific deal.',
    },
    {
      ask: 'No OTC market quotes the exact grade. What then?',
      choices: [
        {label: 'Proxy hedge in a correlated liquid market (crude, naphtha) and accept basis risk', ok: true},
        {label: 'Hedging is impossible', ok: false},
        {label: 'Use gold futures', ok: false},
      ],
      caption: 'Size with the regression slope (β).',
    },
    {
      ask: 'The converter wants a ceiling but to keep the benefit of falling prices.',
      choices: [
        {label: 'Buy an average-price call', ok: true},
        {label: 'Sell a put', ok: false},
        {label: 'Pay fixed on a swap', ok: false},
      ],
      caption: 'Costs a premium; the writer hedges via proxies.',
    },
  ],
};

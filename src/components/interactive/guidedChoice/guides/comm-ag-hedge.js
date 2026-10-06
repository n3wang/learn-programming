/** Guided: choosing an agricultural hedge. */

export default {
  title: 'Choose the farm hedge',
  lead: 'Match each user to a structure — and spot the catch.',
  steps: [
    {
      ask: 'A feed mill needs 700,000 bu of corn in November and fears rising prices.',
      choices: [
        {label: 'Pay fixed on a corn swap vs the first-nearby CME future', ok: true},
        {label: 'Receive fixed on a corn swap', ok: false},
        {label: 'Sell corn calls', ok: false},
      ],
      caption: 'Swap gains offset dearer physical corn.',
    },
    {
      ask: 'A biodiesel maker buys soybean oil and sells diesel-priced fuel.',
      choices: [
        {label: 'Pay the floating (soy oil − diesel) spread, receive fixed', ok: true},
        {label: 'Buy diesel futures only', ok: false},
        {label: 'Sell soybean oil futures', ok: false},
      ],
      caption: 'Locks the margin; basis risk remains vs real biodiesel prices.',
    },
    {
      ask: 'A producer is offered a zero-cost structure selling at 3.45 when the market is 3.15 — but 2× volume if prices rise and a knock-out at 2.85.',
      choices: [
        {label: 'Attractive price, but leveraged upside losses and no protection in a crash', ok: true},
        {label: 'A free lunch', ok: false},
        {label: 'Identical to a forward sale', ok: false},
      ],
      caption: 'Long puts + 2× short calls, both down-and-out.',
    },
    {
      ask: 'A consumer’s TARN collar has reached its USD 1.00 target.',
      choices: [
        {label: 'The trade terminates — no further protection or liability', ok: true},
        {label: 'Payments double', ok: false},
        {label: 'It rolls automatically for another year', ok: false},
      ],
      caption: 'Capped gains are part of the price of the better strike.',
    },
  ],
};

/** Guided: producer hedging choices in gold. */

export default {
  title: 'Hedge the gold mine',
  lead: 'Choose the producer structure.',
  steps: [
    {
      ask: 'The miner expects gold to fall and wants maximum certainty at no cost.',
      choices: [
        {label: 'Sell forward', ok: true},
        {label: 'Buy a put', ok: false},
        {label: 'Sell a covered call', ok: false},
      ],
      caption: 'If you expect falls, forwards beat paying put premium (especially in contango).',
    },
    {
      ask: 'The miner expects gold to rise but needs insurance against a fall.',
      choices: [
        {label: 'Buy a put (or a cheaper Asian/barrier put)', ok: true},
        {label: 'Sell forward', ok: false},
        {label: 'Do a knock-out swap', ok: false},
      ],
      caption: 'Options keep the upside for a premium.',
    },
    {
      ask: 'A producer can’t deliver on a forward due in two days.',
      choices: [
        {label: 'Gold swap: buy spot to close, sell a later forward', ok: true},
        {label: 'Default and renegotiate', ok: false},
        {label: 'Buy a call', ok: false},
      ],
      caption: 'Pay the spot difference now; deliver later at the new forward.',
    },
  ],
};

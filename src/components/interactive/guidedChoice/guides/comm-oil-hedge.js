/** Guided: hedging along the oil chain. */

export default {
  title: 'Hedge along the oil chain',
  lead: 'Match each participant to a hedge.',
  steps: [
    {
      ask: 'A refiner fears its margin will shrink next quarter.',
      choices: [
        {label: 'Sell the crack: buy crude futures, sell product futures (or receive fixed on a margin swap)', ok: true},
        {label: 'Buy crude calls only', ok: false},
        {label: 'Buy product futures', ok: false},
      ],
      caption: 'Lock the spread, not a single price.',
    },
    {
      ask: 'An airline wants a fixed jet price but jet has no liquid futures.',
      choices: [
        {label: 'Gas oil futures plus a jet differential swap (or a jet swap)', ok: true},
        {label: 'Natural gas futures', ok: false},
        {label: 'Do nothing', ok: false},
      ],
      caption: 'Jet = gas oil + jet diff.',
    },
    {
      ask: 'A tank owner has spare capacity in a backwardated gas oil market.',
      choices: [
        {label: 'Sell a put on the calendar spread to earn premium', ok: true},
        {label: 'Buy and store now', ok: false},
        {label: 'Sell crude futures', ok: false},
      ],
      caption: 'Storage is optionality: if contango appears, use it; otherwise keep the premium.',
    },
  ],
};

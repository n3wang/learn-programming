/** Guided: consumer hedging choices in base metals. */

export default {
  title: 'Hedge the automaker',
  lead: 'Aluminium cash 2,400, 3-month 2,500. The automaker buys at a floating monthly average.',
  steps: [
    {
      ask: 'It expects prices to rise and wants certainty with no premium.',
      choices: [
        {label: 'Buy a floating-price forward at 2,500', ok: true},
        {label: 'Buy a call', ok: false},
        {label: 'Sell a put only', ok: false},
      ],
      caption: 'If you expect a rise, the forward beats paying premium.',
    },
    {
      ask: 'It wants a cap but no upfront premium, accepting a floor on benefits.',
      choices: [
        {label: 'Min-max: buy call 2,600, sell put 2,410', ok: true},
        {label: 'Knock-out forward', ok: false},
        {label: 'Sell a call', ok: false},
      ],
      caption: 'Cost bounded between 2,410 and 2,600.',
    },
    {
      ask: 'It buys aluminium and copper and wants cheaper protection than two calls.',
      choices: [
        {label: 'A basket call on both metals', ok: true},
        {label: 'Two separate calls', ok: false},
        {label: 'A put on copper', ok: false},
      ],
      caption: 'Imperfect correlation lowers the basket’s volatility and cost.',
    },
  ],
};

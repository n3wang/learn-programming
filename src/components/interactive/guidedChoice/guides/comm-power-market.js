/** Guided: how a power pool clears. */

export default {
  title: 'Clear a power pool',
  lead: 'Four generators each offer 250 MW at 60, 65, 70, 75. Walk through the auction.',
  steps: [
    {
      ask: 'How does the system operator stack the offers?',
      choices: [
        {label: 'Cheapest first — the merit order', ok: true},
        {label: 'Largest plant first', ok: false},
        {label: 'Alphabetically by owner', ok: false},
      ],
      caption: 'Lowest-cost plants are dispatched first.',
    },
    {
      ask: 'Demand is 1,000 MW. What is the clearing price?',
      choices: [
        {label: '75 — all four are needed, the last accepted offer sets the price', ok: true},
        {label: '60 — the cheapest offer', ok: false},
        {label: '67.50 — the average offer', ok: false},
      ],
      caption: 'Everyone is paid the system marginal price.',
    },
    {
      ask: 'Demand falls to 750 MW. What happens?',
      choices: [
        {label: 'Generator IV is out of merit; price falls to 70', ok: true},
        {label: 'Price stays 75', ok: false},
        {label: 'All generators cut output by a quarter', ok: false},
      ],
      caption: 'The marginal plant changes with demand.',
    },
    {
      ask: 'How does a bilateral market like Great Britain differ?',
      choices: [
        {label: 'Parties contract directly, notify net positions by gate closure, and the operator balances only the residual', ok: true},
        {label: 'All power is sold into one central auction', ok: false},
        {label: 'Prices are set by the regulator', ok: false},
      ],
      caption: 'Self-dispatch plus a balancing mechanism.',
    },
  ],
};

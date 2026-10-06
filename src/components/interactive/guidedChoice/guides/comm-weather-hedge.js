/** Guided: picking a weather hedge. */

export default {
  title: 'Pick the weather hedge',
  lead: 'HDD rises when it is cold; CDD rises when it is hot.',
  steps: [
    {
      ask: 'A gas distributor loses money in a mild winter.',
      choices: [
        {label: 'Buy an HDD put', ok: true},
        {label: 'Buy an HDD call', ok: false},
        {label: 'Buy a CDD call', ok: false},
      ],
      caption: 'Mild winter → low HDD → the put pays.',
    },
    {
      ask: 'A cattle farmer loses money in cold autumns.',
      choices: [
        {label: 'Buy an HDD call', ok: true},
        {label: 'Buy an HDD put', ok: false},
        {label: 'Sell a CDD call', ok: false},
      ],
      caption: 'Colder → higher HDD → the call pays.',
    },
    {
      ask: 'A Midwest utility loses money in cool summers but won’t pay a premium.',
      choices: [
        {label: 'Zero-cost collar: buy an OTM put on temperature, sell an OTM call', ok: true},
        {label: 'Buy a call', ok: false},
        {label: 'Do nothing', ok: false},
      ],
      caption: 'Gives up gains in very hot summers.',
    },
    {
      ask: 'An outdoor event’s site is 50 km from the official station and rain is the risk.',
      choices: [
        {label: 'An OTC rainfall deal designed around the station-to-site basis risk', ok: true},
        {label: 'A CME temperature future', ok: false},
        {label: 'An EUA future', ok: false},
      ],
      caption: 'Rainfall is very local, so basis risk matters more than for temperature.',
    },
  ],
};

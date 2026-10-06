/** Guided: reading commodity price drivers and curve shape. */

export default {
  title: 'Read the market',
  lead: 'Link fundamentals to price behaviour.',
  steps: [
    {
      ask: 'A strike closes a big copper mine; LME stocks cover only a few days of demand.',
      choices: [
        {label: 'Sharp spot rise; curve likely moves into backwardation', ok: true},
        {label: 'Little effect; curve deepens into contango', ok: false},
        {label: 'Only long-dated prices react', ok: false},
      ],
      caption: 'Thin inventories amplify shocks at the front of the curve.',
    },
    {
      ask: 'Gold mine output falls 3%.',
      choices: [
        {label: 'Small short-term price effect — huge above-ground stocks', ok: true},
        {label: 'Price spikes 30%', ok: false},
        {label: 'Gold goes into deep backwardation', ok: false},
      ],
      caption: 'Stock-to-use matters more than flow changes.',
    },
    {
      ask: 'Prices have fallen below many producers’ cash costs, yet output continues.',
      choices: [
        {label: 'Normal short term — fixed costs and hopes of recovery keep mines running', ok: true},
        {label: 'Impossible — marginal cost is a hard floor', ok: false},
        {label: 'Proof that costs don’t matter', ok: false},
      ],
      caption: 'Cost support works mainly in the long run.',
    },
  ],
};

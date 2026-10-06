/** Guided: lost sales vs backorders. */

export default {
  title: 'Lost or waiting?',
  lead: 'How unmet demand behaves changes what to forecast carefully.',
  steps: [
    {
      ask: 'A supermarket shopper finds an empty shelf and buys a competitor’s brand.',
      choices: [
        {label: 'Lost sale — each period’s forecast matters', ok: true},
        {label: 'Backorder', ok: false},
        {label: 'Duplicate order', ok: false},
      ],
      caption: 'Typical of B2C and FMCG.',
    },
    {
      ask: 'An industrial customer keeps its order open until stock arrives.',
      choices: [
        {label: 'Backorder — focus on the cumulative total over the risk horizon', ok: true},
        {label: 'Lost sale', ok: false},
        {label: 'Substitution', ok: false},
      ],
      caption: 'Carry unfulfilled forecast into later periods.',
    },
    {
      ask: 'Some B2B customers wait, others switch to a competitor.',
      choices: [
        {label: 'Hybrid — get each period and the total right', ok: true},
        {label: 'Pure lost sales', ok: false},
        {label: 'Pure backorders', ok: false},
      ],
      caption: 'Most B2B chains are a mix.',
    },
  ],
};

/** Guided: where futures returns come from. */

export default {
  title: 'Decompose a futures return',
  lead: 'Spot gold rose 45 over ten days; a rolled long futures position made 44.53.',
  steps: [
    {
      ask: 'On the roll day you sell the expiring future at 1,015.05 and buy the next at 1,016.75. What P&L does the roll itself create?',
      choices: [
        {label: 'None — both trades are at market prices', ok: true},
        {label: 'A loss of 1.70', ok: false},
        {label: 'A gain of 1.70', ok: false},
      ],
      caption: 'The −1.70 is a price difference between two contracts, not a realised loss.',
    },
    {
      ask: 'What is the roll yield under the revised definition?',
      choices: [
        {label: 'Futures return − spot return = 44.53 − 45.00 = −0.47', ok: true},
        {label: '−1.70', ok: false},
        {label: '+45.00', ok: false},
      ],
      caption: 'It equals basis return (+1.23) plus the roll adjustment (−1.70).',
    },
    {
      ask: 'Why is it negative here?',
      choices: [
        {label: 'Contango: financing (3%) exceeds the lease rate (1%), so holding carries a net cost', ok: true},
        {label: 'Gold fell', ok: false},
        {label: 'Exchange fees', ok: false},
      ],
      caption: 'Futures price in the cost of carry.',
    },
    {
      ask: 'Over many years, which piece dominates?',
      choices: [
        {label: 'Cumulative roll adjustments — the basis is bounded', ok: true},
        {label: 'The basis return', ok: false},
        {label: 'Neither', ok: false},
      ],
      caption: 'So the old rule holds: contango hurts longs, backwardation helps.',
    },
  ],
};

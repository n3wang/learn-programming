/** Guided: diagnosing bullwhip causes. */

export default {
  title: 'Name the bullwhip cause',
  lead: 'Match each symptom to its cause.',
  steps: [
    {
      ask: 'A distributor only orders full truckloads once a month to get a freight discount.',
      choices: [
        {label: 'Order batching', ok: true},
        {label: 'Shortage gaming', ok: false},
        {label: 'Lead-time variation', ok: false},
      ],
      caption: 'Fewer, bigger, later orders make a lumpy signal.',
    },
    {
      ask: 'Stores triple their orders after hearing a rumour of supply problems.',
      choices: [
        {label: 'Shortage gaming', ok: true},
        {label: 'Promotions', ok: false},
        {label: 'Order forecasting', ok: false},
      ],
      caption: 'Speculative orders often create the very shortage feared.',
    },
    {
      ask: 'A retailer keeps 4 weeks of cover; a 10% dip in its forecast halves its next order.',
      choices: [
        {label: 'Order forecasting amplified by the inventory policy', ok: true},
        {label: 'Price fluctuation', ok: false},
        {label: 'Order batching', ok: false},
      ],
      caption: 'Target 4 × 90 = 360; excess 40; order 90 − 40 = 50.',
    },
  ],
};

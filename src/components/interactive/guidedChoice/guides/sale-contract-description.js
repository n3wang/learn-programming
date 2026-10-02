/** Guided: drafting the description of goods. */

export default {
  title: 'Describe the goods',
  lead: 'Buyer wants precision; seller wants only the precision it can deliver.',
  steps: [
    {
      ask: 'An importer needs young broilers, not stewing hens. The contract should say…',
      choices: [
        {label: 'The specific type, grade, and weight range of bird required', ok: true},
        {label: '“Chicken” — everyone knows what that means', ok: false},
        {label: '“Good quality poultry”', ok: false},
      ],
      caption: 'If a variety matters to you, write it in — the claimant bears the burden of proof.',
    },
    {
      ask: 'An exporter’s catalogue colours vary slightly by production batch. In the contract it should…',
      choices: [
        {label: 'Omit colour unless needed to identify the goods', ok: true},
        {label: 'Copy every catalogue colour code exactly', ok: false},
        {label: 'Promise the colours will match photos', ok: false},
      ],
      caption: 'Unneeded specs become promises — and L/C discrepancies.',
    },
    {
      ask: 'Goods have a trivial defect usual in the trade. Under the ICC model approach, the buyer…',
      choices: [
        {label: 'Must accept them, possibly with a price reduction', ok: true},
        {label: 'May reject the whole shipment for any deviation', ok: false},
        {label: 'Gets the goods free', ok: false},
      ],
      caption: 'The model blocks rejection for truly minor, good-faith deviations.',
    },
  ],
};

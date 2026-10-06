/** Guided: forfaiting mechanics and pricing. */

export default {
  title: 'Forfait a capital-goods sale',
  lead: 'A machine maker sells USD 6 million of equipment on 3-year deferred terms.',
  steps: [
    {
      ask: 'What security will a forfaiter most likely want on the importer’s bills?',
      choices: [
        {label: 'An aval or irrevocable, assignable guarantee from a creditworthy bank', ok: true},
        {label: 'A copy of the importer’s website', ok: false},
        {label: 'The exporter’s personal guarantee', ok: false},
      ],
      caption: 'Avalised paper is liquid and carries bank credit.',
    },
    {
      ask: 'When should the exporter secure the forfaiter’s commitment?',
      choices: [
        {label: 'Before signing the contract, so the finance cost can be priced in', ok: true},
        {label: 'After the importer stops paying', ok: false},
        {label: 'Only at maturity', ok: false},
      ],
      caption: 'The commitment fixes the rate and the availability date.',
    },
    {
      ask: 'The importer’s country is politically unstable. What happens to the forfaiting price?',
      choices: [
        {label: 'The margin rises to cover political and transfer risk', ok: true},
        {label: 'Nothing — forfaiting ignores country risk', ok: false},
        {label: 'The deal becomes recourse automatically', ok: false},
      ],
      caption: 'Margin varies by country and guarantor.',
    },
  ],
};

/** Guided: documentary collections, D/P vs D/A. */

export default {
  title: 'Collections: D/P or D/A?',
  lead: 'The exporter ships under a documentary collection and lodges documents with its bank.',
  steps: [
    {
      ask: 'The exporter wants the buyer to get the bill of lading only after paying. Choose…',
      choices: [
        {label: 'D/P — documents against payment', ok: true},
        {label: 'D/A — documents against acceptance', ok: false},
        {label: 'Clean collection', ok: false},
      ],
      caption: 'Under D/P the bank swaps the B/L for cash.',
    },
    {
      ask: 'Under D/A, the buyer accepts a 90-day draft and takes the goods. If it does not pay at maturity, the exporter…',
      choices: [
        {label: 'Holds an accepted draft it can sue on, but has lost control of the goods', ok: true},
        {label: 'Is paid by the collecting bank anyway', ok: false},
        {label: 'Gets the goods back automatically', ok: false},
      ],
      caption: 'Banks take no payment risk in collections.',
    },
    {
      ask: 'Before agreeing any collection, a prudent exporter should…',
      choices: [
        {label: 'Get a credit report on the buyer and assess country risk', ok: true},
        {label: 'Skip the collection instruction details', ok: false},
        {label: 'Assume the bank checks the buyer’s solvency', ok: false},
      ],
      caption: 'The buyer may refuse the goods, fail to pay, or customs may block them.',
    },
  ],
};

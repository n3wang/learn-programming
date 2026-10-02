/** Guided: which rules govern which link of an export deal. */

export default {
  title: 'The contract chain',
  lead: 'Match each link of the export deal to the rules that govern it.',
  steps: [
    {
      ask: 'The carrier’s liability for cargo damage at sea is set mainly by…',
      choices: [
        {label: 'The carriage contract and sea-transport law (e.g. Hague-Visby)', ok: true},
        {label: 'The Incoterm in the sale contract', ok: false},
        {label: 'The buyer’s purchase order', ok: false},
      ],
      caption: 'Incoterms® bind seller and buyer only — never the carrier.',
    },
    {
      ask: 'The documents a bank will accept under a documentary credit follow…',
      choices: [
        {label: 'The credit’s terms, read under ICC uniform rules such as UCP 600', ok: true},
        {label: 'Whatever the seller thinks is reasonable', ok: false},
        {label: 'The WTO tariff schedule', ok: false},
      ],
      caption: 'Banks deal in documents — draft the sale so the credit cannot demand the impossible.',
    },
    {
      ask: 'Under CIF, the seller must insure at least…',
      choices: [
        {label: 'Minimum cover for contract price + 10%, unless the sale says more', ok: true},
        {label: 'All risks including war, automatically', ok: false},
        {label: 'Nothing — insurance is always the buyer’s job', ok: false},
      ],
      caption: 'Upgrade the cover in the sale contract if the goods need it.',
    },
  ],
};

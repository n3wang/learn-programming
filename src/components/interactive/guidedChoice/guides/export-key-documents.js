/** Guided: match export documents to their job. */

export default {
  title: 'Key export documents',
  lead: 'Pick what each paper is for in a documentary sale.',
  steps: [
    {
      ask: 'Which document is the carrier’s receipt and title-related control paper in many sea shipments?',
      choices: [
        {label: 'Bill of lading', ok: true},
        {label: 'Pro forma invoice alone', ok: false},
        {label: 'RFQ form', ok: false},
      ],
      caption: 'Negotiable B/Ls also matter for selling goods in transit and for L/C control.',
    },
    {
      ask: 'Under classic CIF Incoterms® practice, insurance cover is often arranged for…',
      choices: [
        {label: 'About 110% of the goods value (extra 10% for buyer’s minimum profit)', ok: true},
        {label: 'Exactly the customs fine amount', ok: false},
        {label: 'Zero — CIF never includes insurance', ok: false},
      ],
      caption: 'Parties can agree higher cover; read the named Incoterms® edition.',
    },
    {
      ask: 'A pre-shipment inspection certificate under an L/C mainly helps the buyer…',
      choices: [
        {label: 'Link payment documents to independent quality/quantity evidence', ok: true},
        {label: 'Avoid ever paying freight', ok: false},
        {label: 'Rewrite WTO tariff schedules', ok: false},
      ],
      caption: 'Not mandatory everywhere, but common on large or unfamiliar deals.',
    },
  ],
};

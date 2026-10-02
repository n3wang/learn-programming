/** Guided: order the classic documentary-sale timeline. */

export default {
  title: 'Export document timeline',
  lead: 'Place each stage in the usual order for a credit-backed CIF-style deal.',
  steps: [
    {
      ask: 'After marketing, what usually comes first from the importer?',
      choices: [
        {label: 'RFQ / request for a price quote', ok: true},
        {label: 'Presentation of the bill of lading to the confirming bank', ok: false},
        {label: 'Import declaration after delivery', ok: false},
      ],
      caption: 'Inquiry first; binding forms and shipping papers come later.',
    },
    {
      ask: 'Ideally, when should the buyer open the documentary credit?',
      choices: [
        {label: 'By the contract deadline — before shipment', ok: true},
        {label: 'Only after the goods are already delivered inland', ok: false},
        {label: 'Never, if Incoterms® are named', ok: false},
      ],
      caption: 'No open credit = exporter ships into payment risk.',
    },
    {
      ask: 'Document presentation for payment normally happens…',
      choices: [
        {label: 'After shipment, with the B/L and other credit-required papers', ok: true},
        {label: 'Before the RFQ is sent', ok: false},
        {label: 'Only after the WTO issues a ruling', ok: false},
      ],
      caption: 'Ship → assemble pack → present to the nominated/confirming bank.',
    },
  ],
};

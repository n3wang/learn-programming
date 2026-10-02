/** Guided: who makes the first binding move. */

export default {
  title: 'Offer vs acceptance in export forms',
  lead: 'RFQ, pro forma, and purchase order do not always play the same legal role.',
  steps: [
    {
      ask: 'An RFQ from an importer is usually…',
      choices: [
        {label: 'A structured inquiry — not yet a binding sale offer', ok: true},
        {label: 'Automatic acceptance of the exporter’s GTCs', ok: false},
        {label: 'A negotiable bill of lading', ok: false},
      ],
      caption: 'RFQ / RFP asks for a quote; formation comes later.',
    },
    {
      ask: 'A pro forma invoice commonly functions as…',
      choices: [
        {label: 'An early statement of price, delivery, and payment terms (sometimes a binding offer)', ok: true},
        {label: 'Proof that customs duties were paid', ok: false},
        {label: 'The confirming bank’s advice of credit', ok: false},
      ],
      caption: 'It mirrors the eventual commercial invoice but arrives earlier.',
    },
    {
      ask: 'When a large buyer’s PO is the first binding offer, acceptance is typically…',
      choices: [
        {label: 'The seller’s confirmation of that purchase order', ok: true},
        {label: 'Silence from the freight forwarder', ok: false},
        {label: 'Opening of any bank account', ok: false},
      ],
      caption: 'Always ask which form made the first binding move.',
    },
  ],
};

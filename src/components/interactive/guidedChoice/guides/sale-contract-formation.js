/** Guided: offer and acceptance with pro formas, POs, and model contracts. */

export default {
  title: 'Forming the sale contract',
  lead: 'Identify the offer, the acceptance, and whose terms travel with them.',
  steps: [
    {
      ask: 'After an RFQ and an informal quote, the buyer issues a PO with its conditions of purchase. The PO is…',
      choices: [
        {label: 'The binding offer — the seller’s confirmation accepts it', ok: true},
        {label: 'Just an inquiry with no legal effect', ok: false},
        {label: 'Automatically the final contract without any reply', ok: false},
      ],
      caption: 'Whoever makes the binding offer usually anchors the terms.',
    },
    {
      ask: 'A cocoa contract says “FOB” per a trade-association form. To get ICC meaning you should…',
      choices: [
        {label: 'Write the rule plus “Incoterms® [year]” explicitly', ok: true},
        {label: 'Assume every FOB means the same thing', ok: false},
        {label: 'Delete the delivery term', ok: false},
      ],
      caption: 'Sector forms may define FOB/CIF differently from Incoterms®.',
    },
    {
      ask: 'The buyer’s draft has a harsh liability clause. A model contract helps you by…',
      choices: [
        {label: 'Offering a neutral, balanced benchmark wording to negotiate toward', ok: true},
        {label: 'Overriding the buyer’s draft automatically', ok: false},
        {label: 'Making negotiation unnecessary', ok: false},
      ],
      caption: 'Models work as-is, as drafting sources, or as negotiation levers.',
    },
  ],
};

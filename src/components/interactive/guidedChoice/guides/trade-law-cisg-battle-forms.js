/** Guided: CISG scope and the battle of the forms. */

export default {
  title: 'CISG and the battle of the forms',
  lead: 'Seller’s quotation, buyer’s purchase order, seller’s acknowledgement — which terms win?',
  steps: [
    {
      ask: 'The buyer’s order accepts the quote but changes the payment terms. Under the CISG this is…',
      choices: [
        {label: 'A rejection plus counter-offer (payment is material)', ok: true},
        {label: 'A binding contract on the seller’s terms', ok: false},
        {label: 'Irrelevant — payment terms are never material', ok: false},
      ],
      caption: 'Price, quantity, quality, delivery, payment, liability, and disputes are material.',
    },
    {
      ask: 'The order only adds a minor packaging note. The seller says nothing. Result?',
      choices: [
        {label: 'Contract formed including the minor change', ok: true},
        {label: 'No contract until the seller signs', ok: false},
        {label: 'Contract on the original quote, ignoring the note', ok: false},
      ],
      caption: 'Non-material changes stick unless the offeror objects promptly.',
    },
    {
      ask: 'To exclude the CISG while choosing the seller’s national law, the contract should…',
      choices: [
        {label: 'State expressly that the CISG does not apply', ok: true},
        {label: 'Just name the seller’s country', ok: false},
        {label: 'Mention Incoterms®', ok: false},
      ],
      caption: 'Naming a CISG state’s law alone keeps the Convention in play.',
    },
  ],
};

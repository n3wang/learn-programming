/** Guided: quote hygiene for Incoterms®. */

export default {
  title: 'Incoterms® quote hygiene',
  lead: 'Write rules so courts and counterparties cannot invent missing pieces.',
  steps: [
    {
      ask: 'Best contract wording pattern?',
      choices: [
        {label: 'FOB Rotterdam Incoterms® 2010 (rule + place + edition)', ok: true},
        {label: 'Just “FOB” with no place or year', ok: false},
        {label: '“Maximum shipping” with no three-letter rule', ok: false},
      ],
      caption: 'Explicit incorporation beats hoping CISG usages fill the gap.',
    },
    {
      ask: 'Incoterms® alone do not settle…',
      choices: [
        {label: 'Transfer of title / property and the price payment method', ok: true},
        {label: 'Whether the seller or buyer clears export under FCA', ok: false},
        {label: 'Whether CIF requires seller-arranged insurance', ok: false},
      ],
      caption: 'Add retention-of-title, payment, and insurance upgrades in the sale contract.',
    },
    {
      ask: 'Appending “CIF landed” without defining it…',
      choices: [
        {label: 'Can create ambiguity — cost shifts may unsettle risk/customs allocation', ok: true},
        {label: 'Is a defined Incoterms® 2010 standard variant', ok: false},
        {label: 'Transfers WTO dispute jurisdiction', ok: false},
      ],
      caption: 'Variants are not standardized; write what you mean.',
    },
  ],
};

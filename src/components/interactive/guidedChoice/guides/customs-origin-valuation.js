/** Guided: customs valuation and rules of origin. */

export default {
  title: 'Value and origin',
  lead: 'Work out what duty is charged on, and whether a preference applies.',
  steps: [
    {
      ask: 'The buyer supplied a free mould to the foreign factory. For customs value, the mould is…',
      choices: [
        {label: 'An assist — added to the transaction value', ok: true},
        {label: 'Ignored because no money changed hands', ok: false},
        {label: 'Deducted from the price', ok: false},
      ],
      caption: 'Assists, selling commissions and some royalties are added.',
    },
    {
      ask: 'Same goods go to the U.S. and to the EU. Where does freight raise the duty base?',
      choices: [
        {label: 'EU (CIF basis)', ok: true},
        {label: 'U.S. (FOB basis)', ok: false},
        {label: 'Both equally', ok: false},
      ],
      caption: 'The U.S., Canada and Australia value on FOB.',
    },
    {
      ask: 'Ex-works 100; non-originating inputs 55; FTA needs 50% RVC. Does it qualify?',
      choices: [
        {label: 'No — RVC is 45%', ok: false},
        {label: 'Yes — RVC is 55%', ok: false},
        {label: 'No — unless another rule (e.g. tariff shift) is allowed', ok: true},
      ],
      caption: '(100 − 55)/100 = 45%; some agreements offer alternative rules.',
    },
  ],
};

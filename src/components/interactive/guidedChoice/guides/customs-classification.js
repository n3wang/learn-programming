/** Guided: customs responsibility and classification. */

export default {
  title: 'Classify and clear',
  lead: 'Decide who clears and how to get the code right.',
  steps: [
    {
      ask: 'A foreign buyer asks for EXW, but cannot file export declarations in your country. Better term?',
      choices: [
        {label: 'FCA — the seller clears export', ok: true},
        {label: 'DDP — the seller clears everything', ok: false},
        {label: 'Keep EXW and hope', ok: false},
      ],
      caption: 'FCA is the usual fix for EXW export-clearance problems.',
    },
    {
      ask: 'A high-volume product could fall under two headings with different duty rates. Best step?',
      choices: [
        {label: 'Apply the GIRs and request a binding tariff ruling', ok: true},
        {label: 'Pick the lower-duty code', ok: false},
        {label: 'Let the broker decide and stop worrying', ok: false},
      ],
      caption: 'The importer remains responsible for the declaration.',
    },
    {
      ask: 'The HS is updated to a new edition. You should…',
      choices: [
        {label: 'Review your product codes against the new edition', ok: true},
        {label: 'Do nothing — codes never change', ok: false},
        {label: 'Only check codes for new products', ok: false},
      ],
      caption: 'Editions come about every five years.',
    },
  ],
};

/** Guided: agency or distributorship? */

export default {
  title: 'Agent or distributor?',
  lead: 'Pick the better structure for each exporter.',
  steps: [
    {
      ask: 'Custom medical scanners, each configured per hospital, with long service contracts.',
      choices: [
        {label: 'Commercial agent — customers buy directly from the maker', ok: true},
        {label: 'Distributor holding large stock', ok: false},
        {label: 'Occasional intermediary', ok: false},
      ],
      caption: 'Unique, complex, maintenance-heavy goods favour agency.',
    },
    {
      ask: 'Spare parts and consumables sold to thousands of workshops who need next-day delivery.',
      choices: [
        {label: 'Distributor that buys and stocks the goods', ok: true},
        {label: 'Agent with no stock', ok: false},
        {label: 'Franchise', ok: false},
      ],
      caption: 'Large local stock and many small customers favour distribution.',
    },
    {
      ask: 'An exporter wants no exposure to thousands of end-customers’ credit.',
      choices: [
        {label: 'Distributorship — only the distributor’s credit matters', ok: true},
        {label: 'Agency without del credere', ok: false},
        {label: 'Direct sales on open account', ok: false},
      ],
      caption: 'The distributor carries end-customer credit risk.',
    },
  ],
};

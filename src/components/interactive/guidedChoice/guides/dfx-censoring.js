/** Guided: shortage censoring and lost-sales estimation. */

export default {
  title: 'Censor the shortages',
  lead: 'Estimate demand when sales were constrained.',
  steps: [
    {
      ask: 'Sales: 10, 12, 0, 0, 11, 9 (days 3–4 out of stock). Best daily demand estimate?',
      choices: [
        {label: '10.5 — average of in-stock days', ok: true},
        {label: '7.0 — average of all days', ok: false},
        {label: '0 — latest value', ok: false},
      ],
      caption: '42 / 4 = 10.5; lost sales ≈ 2 × 10.5 = 21.',
    },
    {
      ask: 'The ERP shows stock, but the product sat in the back room, not on the shelf.',
      choices: [
        {label: 'Censor those days anyway', ok: true},
        {label: 'Treat them as normal demand', ok: false},
        {label: 'Delete the product', ok: false},
      ],
      caption: 'Censor effective unavailability, not just recorded stock-outs.',
    },
    {
      ask: '1 in 5 customers usually buys a cone; cones ran out and 40 customers came after. Lost cones?',
      choices: [
        {label: '8', ok: true},
        {label: '5', ok: false},
        {label: '40', ok: false},
      ],
      caption: 'Use stock-independent drivers (customer count) to estimate lost demand.',
    },
  ],
};

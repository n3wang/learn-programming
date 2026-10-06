/** Guided: risk horizon and order sizing. */

export default {
  title: 'Size the order',
  lead: 'Monthly orders, 2-month lead time.',
  steps: [
    {
      ask: 'What is the risk horizon?',
      choices: [
        {label: '3 months (2 lead time + 1 review)', ok: true},
        {label: '2 months', ok: false},
        {label: '1 month', ok: false},
      ],
      caption: 'Periodic policies must cover lead time plus review period.',
    },
    {
      ask: 'Forecast M1–M3: 40, 60, 50. Stock 80, in transit 30, closing target 50. Order?',
      choices: [
        {label: '90', ok: true},
        {label: '150', ok: false},
        {label: '60', ok: false},
      ],
      caption: '50 + 150 − 80 − 30 = 90.',
    },
    {
      ask: 'M1 is frozen in the production plan. Should its forecast still be updated?',
      choices: [
        {label: 'Yes — M1 demand changes the right order for later months', ok: true},
        {label: 'No — frozen means frozen', ok: false},
        {label: 'Only if accuracy is low', ok: false},
      ],
      caption: 'Freeze plans, not information.',
    },
  ],
};

/** Guided: factoring, forfaiting, or credit insurance? */

export default {
  title: 'Which receivables finance?',
  lead: 'Match each exporter to the best tool.',
  steps: [
    {
      ask: 'Apparel exporter, 400 retail buyers, invoices of USD 3,000–15,000 on net 45, needs cash and collections help.',
      choices: [
        {label: 'Factoring', ok: true},
        {label: 'Forfaiting', ok: false},
        {label: 'Nothing — wait for payment', ok: false},
      ],
      caption: 'Many small short invoices plus services = factoring.',
    },
    {
      ask: 'Turbine supplier, one USD 40 million contract, 5-year deferred payment, bank-guaranteed notes.',
      choices: [
        {label: 'Forfaiting', ok: true},
        {label: 'Recourse factoring', ok: false},
        {label: 'Clean collection', ok: false},
      ],
      caption: 'Single large medium-term guaranteed receivable = forfaiting.',
    },
    {
      ask: 'Experienced exporter with its own strong credit team wants protection against buyer default at the lowest cost.',
      choices: [
        {label: 'Credit insurance', ok: true},
        {label: 'Two-factor non-recourse factoring', ok: false},
        {label: 'Forfaiting every invoice', ok: false},
      ],
      caption: 'Insurance is cheaper when you do not need the factor’s services.',
    },
  ],
};

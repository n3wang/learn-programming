/** Guided: classify and manage foreign-exchange risk. */

export default {
  title: 'Classify the FX risk',
  lead: 'A U.S. exporter sells to Europe in euros.',
  steps: [
    {
      ask: 'Contract signed today for EUR 1M, paid in 90 days. The rate may move before payment. This is…',
      choices: [
        {label: 'Transaction risk — hedgeable with a forward or option', ok: true},
        {label: 'Translation risk', ok: false},
        {label: 'Economic risk only', ok: false},
      ],
      caption: 'One deal, fixed amount, known date.',
    },
    {
      ask: 'The exporter’s European warehouse, valued in euros, must be restated in dollars at year end. This is…',
      choices: [
        {label: 'Translation (balance-sheet) risk', ok: true},
        {label: 'Transaction risk', ok: false},
        {label: 'Credit risk', ok: false},
      ],
      caption: 'An accounting restatement risk — strategic, not deal-by-deal.',
    },
    {
      ask: 'All buyers now pay in dollars, but a multi-year dollar surge makes the products uncompetitive in Europe. This is…',
      choices: [
        {label: 'Economic risk — not removed by invoicing currency or simple hedges', ok: true},
        {label: 'Transaction risk, fully hedged', ok: false},
        {label: 'No risk, since invoices are in dollars', ok: false},
      ],
      caption: 'Long-run competitiveness needs strategy: pricing, sourcing, market mix.',
    },
  ],
};

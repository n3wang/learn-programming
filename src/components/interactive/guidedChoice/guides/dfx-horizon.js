/** Guided: matching forecast set-ups to horizons. */

export default {
  title: 'Pick the set-up',
  lead: 'Choose granularity, model, and reviewers for each horizon.',
  steps: [
    {
      ask: 'Weekly store replenishment for 20,000 SKU-store pairs.',
      choices: [
        {label: 'Machine-learning baseline; planners review only key items', ok: true},
        {label: 'Monthly consensus meeting for every item', ok: false},
        {label: 'Annual causal budget model', ok: false},
      ],
      caption: 'High volume and frequency demand automation.',
    },
    {
      ask: 'Monthly production plan for the next 6 months (S&OP).',
      choices: [
        {label: 'SKU-level monthly forecast, value-weighted metrics, FVA on stakeholder inputs', ok: true},
        {label: 'Store-level daily forecast', ok: false},
        {label: 'Sales targets as the forecast', ok: false},
      ],
      caption: 'Many stakeholders — track who adds value.',
    },
    {
      ask: 'Next year’s budget with price and marketing scenarios.',
      choices: [
        {label: 'Aggregated causal model whose drivers can be discussed', ok: true},
        {label: 'SKU × store × week ML model', ok: false},
        {label: 'Copy last year’s budget', ok: false},
      ],
      caption: 'Long-term planning is scenario work; guard against bias.',
    },
  ],
};

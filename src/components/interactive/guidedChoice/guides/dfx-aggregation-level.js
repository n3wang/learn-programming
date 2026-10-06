/** Guided: choosing the focus aggregation level. */

export default {
  title: 'Choose the focus level',
  lead: 'Pick the level that matches the decision.',
  steps: [
    {
      ask: 'Deciding how much of each product to send from the plant to five regional warehouses.',
      choices: [
        {label: 'Product × warehouse footprint', ok: true},
        {label: 'Product × country', ok: false},
        {label: 'Brand × world', ok: false},
      ],
      caption: 'Use the geography each warehouse serves, not its shipments.',
    },
    {
      ask: 'A single warehouse serves all customers; replenishment is weekly.',
      choices: [
        {label: 'Product × total × week may be enough', ok: true},
        {label: 'Product × zip code × hour', ok: false},
        {label: 'Brand × year', ok: false},
      ],
      caption: 'Extra granularity only pays if a decision uses it.',
    },
    {
      ask: 'Production lines are set up per packaging format.',
      choices: [
        {label: 'Forecast per packaging format', ok: true},
        {label: 'Forecast per brand only', ok: false},
        {label: 'Flat-split the product forecast across formats', ok: false},
      ],
      caption: 'Discuss what drives each format: events, promotions, channels.',
    },
  ],
};

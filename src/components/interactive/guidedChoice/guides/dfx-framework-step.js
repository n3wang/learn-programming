/** Guided: placing problems in the 5-step demand planning framework. */

export default {
  title: 'Which step needs work?',
  lead: 'Match each symptom to the step of the framework it belongs to.',
  steps: [
    {
      ask: 'The forecast is made per country per month, but warehouses replenish per SKU per week.',
      choices: [
        {label: 'Objective — granularity does not match the decision', ok: true},
        {label: 'Metrics', ok: false},
        {label: 'Baseline model', ok: false},
      ],
      caption: 'Start from the decision; it sets granularity and horizon.',
    },
    {
      ask: 'History is built from shipments, and stock-outs show up as zero demand.',
      choices: [
        {label: 'Data — unconstrained demand is not being captured', ok: true},
        {label: 'Review process', ok: false},
        {label: 'Objective', ok: false},
      ],
      caption: 'Forecast demand, not constrained sales.',
    },
    {
      ask: 'Sales keeps raising the forecast every month, and nobody knows if it helps.',
      choices: [
        {label: 'Review process — track forecast value added', ok: true},
        {label: 'Data', ok: false},
        {label: 'Baseline model', ok: false},
      ],
      caption: 'FVA shows whether each override improves accuracy.',
    },
  ],
};

/** Guided: amicable dispute tools before binding proceedings. */

export default {
  title: 'Climb the escalation ladder',
  lead: 'A long-term supply relationship hits trouble. Pick the right rung.',
  steps: [
    {
      ask: 'Raw-material costs jump 30% in a five-year contract. The first tool to reach for is…',
      choices: [
        {label: 'The price-escalation / adaptation clause, if the contract has one', ok: true},
        {label: 'An immediate lawsuit for the old price', ok: false},
        {label: 'Stopping deliveries without notice', ok: false},
      ],
      caption: 'Adaptation clauses let the deal flex instead of break.',
    },
    {
      ask: 'You decide to accept one late delivery without penalty. To protect future rights you should…',
      choices: [
        {label: 'Object in writing, stating this is a one-off concession', ok: true},
        {label: 'Say nothing to keep the relationship warm', ok: false},
        {label: 'Cancel the whole contract', ok: false},
      ],
      caption: 'Silent tolerance can become waiver.',
    },
    {
      ask: 'Both sides disagree about whether a machine meets its spec. A cheap, non-adversarial next step is…',
      choices: [
        {label: 'Ask an independent technical expert for an opinion', ok: true},
        {label: 'File in the buyer’s national court', ok: false},
        {label: 'Publish the dispute online', ok: false},
      ],
      caption: 'Not binding alone, but a contemporaneous expert record is highly persuasive later.',
    },
  ],
};

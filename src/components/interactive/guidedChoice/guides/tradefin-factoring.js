/** Guided: factoring structures and choices. */

export default {
  title: 'Set up factoring',
  lead: 'An SME exporter sells to 200 foreign buyers on net 60 and is short of cash.',
  steps: [
    {
      ask: 'It cannot afford a large customer’s bankruptcy. Which terms protect it?',
      choices: [
        {label: 'Non-recourse factoring within approved credit limits', ok: true},
        {label: 'Recourse factoring — it is cheaper', ok: false},
        {label: 'A bigger overdraft', ok: false},
      ],
      caption: 'Recourse leaves the credit risk with the exporter.',
    },
    {
      ask: 'Most buyers are in an unfamiliar market with a different language and legal system. Prefer…',
      choices: [
        {label: 'A two-factor scheme with an import factor in that market', ok: true},
        {label: 'Single-factor — it is always better', ok: false},
        {label: 'No credit checks at all', ok: false},
      ],
      caption: 'The import factor checks buyers and collects locally.',
    },
    {
      ask: 'The exporter does not want buyers to know it uses finance. It should use…',
      choices: [
        {label: 'Undisclosed factoring / invoice discounting', ok: true},
        {label: 'Disclosed factoring with notices on every invoice', ok: false},
        {label: 'Forfaiting with an aval', ok: false},
      ],
      caption: 'Silent arrangements keep the customer relationship unchanged.',
    },
  ],
};

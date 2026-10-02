/** Guided: drafting choice-of-law and dispute-resolution clauses. */

export default {
  title: 'Dispute clause drafting',
  lead: 'A French seller and a New York buyer are finalizing their contract.',
  steps: [
    {
      ask: 'If the contract names no law and no forum, what happens in a dispute?',
      choices: [
        {label: 'Courts in several countries may claim jurisdiction and run conflict-of-laws analyses', ok: true},
        {label: 'The seller’s law always applies automatically', ok: false},
        {label: 'The dispute cannot be heard anywhere', ok: false},
      ],
      caption: 'Silence invites parallel proceedings and uncertainty about the governing law.',
    },
    {
      ask: 'They choose ICC arbitration. What else should the clause specify?',
      choices: [
        {label: 'Applicable law, seat, language, and number of arbitrators', ok: true},
        {label: 'Nothing — “arbitration” alone is enough', ok: false},
        {label: 'The judge’s name', ok: false},
      ],
      caption: 'Use a model clause and fill in the key variables.',
    },
    {
      ask: 'Why does each side push for its home forum?',
      choices: [
        {label: 'Foreign proceedings are costly and inconvenient, which deters claims', ok: true},
        {label: 'Home courts must always rule for local companies', ok: false},
        {label: 'Forum has no effect on cost', ok: false},
      ],
      caption: 'Forum choice sets the cost threshold for any future claim.',
    },
  ],
};

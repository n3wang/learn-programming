/** Guided: breach severity and remedies. */

export default {
  title: 'Breach and remedies',
  lead: 'Classify each breach and pick the likely remedy.',
  steps: [
    {
      ask: 'The seller ships 9,950 of 10,000 units; the shortfall is commercially trivial. Likely remedy?',
      choices: [
        {label: 'Price reduction (substantial performance)', ok: true},
        {label: 'Terminate the whole contract', ok: false},
        {label: 'Consequential damages for lost profits', ok: false},
      ],
      caption: 'Minor shortfalls rarely justify harsh remedies.',
    },
    {
      ask: 'Custom tooling arrives unusable and cannot be repaired before the buyer’s season. This is…',
      choices: [
        {label: 'A fundamental breach — the buyer may avoid (terminate) the contract', ok: true},
        {label: 'Always curable, so the buyer must wait indefinitely', ok: false},
        {label: 'Not a breach if the goods were shipped on time', ok: false},
      ],
      caption: 'Losing the essential benefit of the bargain opens termination.',
    },
    {
      ask: 'Goods arrive slightly late every month and the buyer never complains. Risk?',
      choices: [
        {label: 'A court may find the buyer waived strict delivery dates', ok: true},
        {label: 'None — rights can never be waived by conduct', ok: false},
        {label: 'The seller automatically owes liquidated damages', ok: false},
      ],
      caption: 'Object in writing to small breaches even when you accept the goods.',
    },
  ],
};

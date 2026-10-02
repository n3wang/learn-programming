/** Guided: independence, strict compliance, and waivers. */

export default {
  title: 'Strict compliance in practice',
  lead: 'Decide whether the bank pays.',
  steps: [
    {
      ask: 'Invoice says “Model 4512”; the credit says “Model 4521”. Everything else complies.',
      choices: [
        {label: 'Discrepant — a changed number is not a harmless typo', ok: true},
        {label: 'Complying — obviously a typo', ok: false},
        {label: 'The bank should call the factory', ok: false},
      ],
      caption: 'Meaning-changing errors block payment.',
    },
    {
      ask: 'Documents comply, but the buyer says the goods are poor quality and demands the bank stop payment.',
      choices: [
        {label: 'Bank pays — the credit is independent; buyer sues under the sale contract', ok: true},
        {label: 'Bank must stop payment', ok: false},
        {label: 'Bank pays half', ok: false},
      ],
      caption: 'Only clear fraud, not a quality dispute, can block a complying presentation.',
    },
    {
      ask: 'Market prices have collapsed and the documents contain one discrepancy. What should the seller expect?',
      choices: [
        {label: 'The buyer may refuse a waiver or demand a discount', ok: true},
        {label: 'The buyer will certainly waive it', ok: false},
        {label: 'The bank will overlook it', ok: false},
      ],
      caption: 'Waivers are likely in rising markets and unlikely in falling ones.',
    },
  ],
};

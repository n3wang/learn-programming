/** Guided: written contracts, foreign-language forms, oral side deals. */

export default {
  title: 'Get it in writing',
  lead: 'A deal agreed at a trade fair now needs paperwork.',
  steps: [
    {
      ask: 'The seller hands you a pre-printed form in a language you cannot read. Best move?',
      choices: [
        {label: 'Get a translation and review every clause before signing', ok: true},
        {label: 'Sign — the oral deal already covers the important points', ok: false},
        {label: 'Sign and add “oral terms prevail” verbally', ok: false},
      ],
      caption: 'Unread printed terms can override what you thought you agreed.',
    },
    {
      ask: 'You dislike one clause in the counterparty’s standard form. You can…',
      choices: [
        {label: 'Accept subject to excluding that clause, and negotiate it openly', ok: true},
        {label: 'Assume standard forms are never negotiable', ok: false},
        {label: 'Ignore it and hope it never matters', ok: false},
      ],
      caption: 'Even standard forms leave room for targeted concessions.',
    },
    {
      ask: 'Under the CISG an oral contract is valid. What is still the main risk?',
      choices: [
        {label: 'Proving its terms — via conduct, course of dealing, or trade usage', ok: true},
        {label: 'It is automatically void after 30 days', ok: false},
        {label: 'Banks must refuse to finance it', ok: false},
      ],
      caption: 'Valid is not the same as provable; merger clauses can also exclude side deals.',
    },
  ],
};

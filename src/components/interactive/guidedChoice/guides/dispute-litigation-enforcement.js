/** Guided: forum, choice of law, and enforcing judgments abroad. */

export default {
  title: 'Litigation: forum to enforcement',
  lead: 'An exporter is owed money by a foreign buyer and is thinking of suing.',
  steps: [
    {
      ask: 'Before choosing a court, the exporter should first check…',
      choices: [
        {label: 'The contract’s forum and law clauses, and where the buyer’s assets are', ok: true},
        {label: 'Which court has the nicest building', ok: false},
        {label: 'Nothing — any court will do', ok: false},
      ],
      caption: 'Forum and collectability decide whether the suit is worth bringing.',
    },
    {
      ask: 'The forum clause names a country unconnected to either party, chosen to deter claims. A court may…',
      choices: [
        {label: 'Refuse to enforce it as unreasonable', ok: true},
        {label: 'Be obliged to enforce it in every case', ok: false},
        {label: 'Convert it into an arbitration clause', ok: false},
      ],
      caption: 'Forum clauses may face a reasonableness test, and some countries protect their nationals.',
    },
    {
      ask: 'A judgment from the exporter’s court must be enforced where the buyer’s assets are, outside the EU, with no treaty. The court there will likely ask about…',
      choices: [
        {label: 'Reciprocity — does your country enforce its judgments?', ok: true},
        {label: 'The Incoterm used', ok: false},
        {label: 'Nothing — recognition is automatic', ok: false},
      ],
      caption: 'Exequatur outcomes vary widely; awards under the New York Convention often travel better.',
    },
  ],
};

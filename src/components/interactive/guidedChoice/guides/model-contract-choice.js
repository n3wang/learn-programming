/** Guided: pick the ICC model contract for the transaction. */

export default {
  title: 'Which ICC model?',
  lead: 'Match each expansion plan to the right model contract.',
  steps: [
    {
      ask: 'A fashion brand lets a foreign manufacturer design and sell clothing under its name for royalties.',
      choices: [
        {label: 'Trademark Licence', ok: true},
        {label: 'Commercial Agency', ok: false},
        {label: 'Turnkey Supply', ok: false},
      ],
      caption: 'The licensor’s main job is quality control of the brand.',
    },
    {
      ask: 'An engineering firm will design and build a complete cement plant the buyer only has to start.',
      choices: [
        {label: 'Turnkey Supply of an Industrial Plant (or Major Projects)', ok: true},
        {label: 'International Sale', ok: false},
        {label: 'Franchising', ok: false},
      ],
      caption: 'Turnkey = contractor provides everything; buyer “turns the key”.',
    },
    {
      ask: 'A consultant will introduce a buyer for one specific deal and wants to be sure it gets paid.',
      choices: [
        {label: 'Occasional Intermediary (non-circumvention, non-disclosure)', ok: true},
        {label: 'Distributorship', ok: false},
        {label: 'Share Purchase', ok: false},
      ],
      caption: 'No continuing obligation; protection against being bypassed.',
    },
  ],
};

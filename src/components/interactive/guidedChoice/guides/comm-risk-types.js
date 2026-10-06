/** Guided: classify financial risks. */

export default {
  title: 'Name the risk',
  lead: 'Classify each problem among the five risk types.',
  steps: [
    {
      ask: 'A customer goes bankrupt owing USD 4 million for delivered copper.',
      choices: [
        {label: 'Credit risk', ok: true},
        {label: 'Market risk', ok: false},
        {label: 'Legal risk', ok: false},
      ],
      caption: 'Money owed that is never repaid.',
    },
    {
      ask: 'A court rules a hedging contract void because the company had no power to sign it.',
      choices: [
        {label: 'Legal / documentary risk', ok: true},
        {label: 'Operational risk', ok: false},
        {label: 'Market risk', ok: false},
      ],
      caption: 'Ultra vires contracts are a classic legal risk.',
    },
    {
      ask: 'Nobody independently checks a trader’s positions for a year.',
      choices: [
        {label: 'Operational risk', ok: true},
        {label: 'Credit risk', ok: false},
        {label: 'FX risk', ok: false},
      ],
      caption: 'Control weakness — and no derivative can hedge it.',
    },
  ],
};

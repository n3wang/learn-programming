/** Guided: one number forecast vs one number mindset. */

export default {
  title: 'Number or mindset?',
  lead: 'Choose the alignment approach.',
  steps: [
    {
      ask: 'A company decides daily store deliveries and 12-month raw-material contracts.',
      choices: [
        {label: 'One number mindset — shared data and events, fit-for-purpose forecasts', ok: true},
        {label: 'Strict one number forecast for every SKU-day', ok: false},
        {label: 'Each team uses its own data', ok: false},
      ],
      caption: 'Very different timescales favour a mindset.',
    },
    {
      ask: 'Marketing plans a price cut next quarter. Where should logistics learn about it?',
      choices: [
        {label: 'Through the S&OP event-sharing process', ok: true},
        {label: 'From watching sales go up', ok: false},
        {label: 'It does not need to know', ok: false},
      ],
      caption: 'Align on events, not only numbers.',
    },
    {
      ask: 'S&OP: 20,000. Weekly logistics forecast sums to 20,600. Tolerance 5%.',
      choices: [
        {label: 'Within tolerance (3%) — keep both', ok: true},
        {label: 'Force them equal', ok: false},
        {label: 'Out of tolerance', ok: false},
      ],
      caption: '600 / 20,000 = 3%.',
    },
  ],
};

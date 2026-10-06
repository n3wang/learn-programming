/** Guided: using demand drivers. */

export default {
  title: 'Use the right drivers',
  lead: 'Decide whether and how to use each driver.',
  steps: [
    {
      ask: 'You need a 6-month-ahead forecast. Should you use weather?',
      choices: [
        {label: 'No — weather is not reliably known that far ahead', ok: true},
        {label: 'Yes — always', ok: false},
        {label: 'Only in winter', ok: false},
      ],
      caption: 'You need future values of the driver.',
    },
    {
      ask: 'Future inflation is unknown but building permits lead your demand by 6 months.',
      choices: [
        {label: 'Use permits as a leading indicator', ok: true},
        {label: 'Forecast inflation first', ok: false},
        {label: 'Ignore macroeconomics', ok: false},
      ],
      caption: 'Leading indicators are known before the demand they drive.',
    },
    {
      ask: 'Detailed future prices aren’t planned, but a price rise will be announced.',
      choices: [
        {label: 'Model the announcement effect (pre-buy then dip) and run scenarios', ok: true},
        {label: 'Ignore pricing', ok: false},
        {label: 'Guess every future price', ok: false},
      ],
      caption: 'Announcements are drivers too.',
    },
  ],
};

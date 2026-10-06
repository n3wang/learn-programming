/** Guided: level of interest vs level used to build the forecast. */

export default {
  title: 'Build it from where?',
  lead: 'The level you need is not always the level you should model.',
  steps: [
    {
      ask: 'You need a weekly forecast, and you know about school holidays and a match day next week.',
      choices: [
        {label: 'Try building it from a daily model that uses those events, then sum', ok: true},
        {label: 'Only ever use weekly data', ok: false},
        {label: 'Use yearly data', ok: false},
      ],
      caption: 'Daily information can sharpen the weekly total.',
    },
    {
      ask: 'The daily-built forecast is less accurate than the weekly model on your history.',
      choices: [
        {label: 'Keep the weekly model — measure, don’t assume', ok: true},
        {label: 'Use the daily one anyway', ok: false},
        {label: 'Average them blindly', ok: false},
      ],
      caption: 'Granular is not automatically better.',
    },
    {
      ask: 'Planners want to re-run the forecast every hour.',
      choices: [
        {label: 'Probably too often — risk of over-reaction and wasted effort', ok: true},
        {label: 'Always better', ok: false},
        {label: 'Required for accuracy', ok: false},
      ],
      caption: 'Balance freshness against stability.',
    },
  ],
};

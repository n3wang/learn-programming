/** Guided: LME mechanics. */

export default {
  title: 'Work the LME',
  lead: 'Apply exchange conventions.',
  steps: [
    {
      ask: 'A fabricator needs a hedge for delivery in exactly 47 days. Can the LME match the date?',
      choices: [
        {label: 'Yes — daily prompts out to 3 months', ok: true},
        {label: 'No — only quarterly dates', ok: false},
        {label: 'Only on the third Wednesday', ok: false},
      ],
      caption: 'Daily to 3 months, weekly to 6, then monthly.',
    },
    {
      ask: 'Your LME long is up USD 30,000 today. Cash received tomorrow?',
      choices: [
        {label: 'None until the position closes or matures', ok: true},
        {label: 'USD 30,000', ok: false},
        {label: 'Half of it', ok: false},
      ],
      caption: 'Losses are called immediately; profits wait.',
    },
    {
      ask: 'You take delivery and receive a warrant for an unpopular location and brand. Remedy?',
      choices: [
        {label: 'Swap the warrant off-exchange, possibly paying a premium', ok: true},
        {label: 'Demand a different brand from the LME', ok: false},
        {label: 'Refuse delivery', ok: false},
      ],
      caption: 'Sellers choose location and brand; warrants are allocated randomly.',
    },
  ],
};

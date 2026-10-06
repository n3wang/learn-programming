/** Guided: embedding commodity optionality in debt. */

export default {
  title: 'Cheaper debt with commodity options',
  lead: 'Sell payouts that hit when you can afford them.',
  steps: [
    {
      ask: 'An airline wants a cheaper loan. Which option sale fits its business?',
      choices: [
        {label: 'Sell crude put spreads — it pays when oil is low, just as jet fuel gets cheap', ok: true},
        {label: 'Sell crude calls', ok: false},
        {label: 'Buy crude puts', ok: false},
      ],
      caption: 'The loss is offset by lower fuel costs.',
    },
    {
      ask: 'A copper miner wants rate protection mainly when copper is weak.',
      choices: [
        {label: 'A cap that knocks in only if copper falls below a barrier', ok: true},
        {label: 'A vanilla floor', ok: false},
        {label: 'Receive fixed on a swap', ok: false},
      ],
      caption: 'Cheaper cap → better floor strike.',
    },
    {
      ask: 'Is that knock-in cap likely to activate when rates are high?',
      choices: [
        {label: 'Less likely — high rates usually come with strong economies and high copper', ok: true},
        {label: 'Always', ok: false},
        {label: 'Correlation never matters', ok: false},
      ],
      caption: 'Check whether the protection is real.',
    },
    {
      ask: 'A sugar producer pays 1.5% + 5% × (days sugar > 0.10)/days vs a vanilla 3%. When does it win?',
      choices: [
        {label: 'When sugar is above the strike on fewer than 30% of days', ok: true},
        {label: 'When sugar stays high', ok: false},
        {label: 'Always', ok: false},
      ],
      caption: 'Break-even N/D = (3 − 1.5) / 5.',
    },
  ],
};

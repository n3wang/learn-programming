/** Guided: choosing an emissions trade. */

export default {
  title: 'Choose the emissions trade',
  lead: 'Match each situation to a structure.',
  steps: [
    {
      ask: 'A utility has spare free allowances for a year and the forward trades below fair value.',
      choices: [
        {label: 'Sell spot and buy forward — cheap funding', ok: true},
        {label: 'Buy spot and sell forward', ok: false},
        {label: 'Surrender them early', ok: false},
      ],
      caption: 'In 2020 this was like borrowing at about −1.34%.',
    },
    {
      ask: 'A corporate with a large EUA holding wants cheap secured funding.',
      choices: [
        {label: 'Repo: sell spot and agree to buy back forward', ok: true},
        {label: 'Buy calls', ok: false},
        {label: 'Enter a one-day swap', ok: false},
      ],
      caption: 'Inventory monetisation at Euribor + spread.',
    },
    {
      ask: 'A cement maker wants protection against rising prices but no physical delivery.',
      choices: [
        {label: 'Pay fixed on a cash-settled emissions swap', ok: true},
        {label: 'Receive fixed on a swap', ok: false},
        {label: 'Sell EUA puts', ok: false},
      ],
      caption: 'Swap gains offset a higher purchase price.',
    },
    {
      ask: 'A trader thinks EUAAs trade at too wide a discount to EUAs.',
      choices: [
        {label: 'Buy EUAAs, sell EUAs', ok: true},
        {label: 'Sell EUAAs, buy EUAs', ok: false},
        {label: 'Buy both', ok: false},
      ],
      caption: 'A spread trade on the discount narrowing.',
    },
  ],
};

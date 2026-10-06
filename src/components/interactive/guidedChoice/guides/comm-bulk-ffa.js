/** Guided: picking the FFA side. */

export default {
  title: 'Pick the FFA side',
  lead: 'Buy = pay fixed; sell = receive fixed.',
  steps: [
    {
      ask: 'A utility must import coal next year and will hire ships at market rates.',
      choices: [
        {label: 'Buy the FFA (pay fixed) — protects against rising freight', ok: true},
        {label: 'Sell the FFA', ok: false},
        {label: 'No hedge is possible', ok: false},
      ],
      caption: 'FFA gains offset dearer physical charters.',
    },
    {
      ask: 'A shipowner will charter its Supramaxes out next year.',
      choices: [
        {label: 'Sell a TC FFA (receive fixed USD/day)', ok: true},
        {label: 'Buy a TC FFA', ok: false},
        {label: 'Buy coal swaps', ok: false},
      ],
      caption: 'Locks in hire income.',
    },
    {
      ask: 'A tanker charterer on the Kuwait → Singapore route.',
      choices: [
        {label: 'Pay fixed on a TD8 Worldscale FFA', ok: true},
        {label: 'Pay fixed on a Capesize C4 FFA', ok: false},
        {label: 'Sell a Panamax FFA', ok: false},
      ],
      caption: 'Match the route to minimise basis risk.',
    },
    {
      ask: 'A trader thinks Capesize rates will outperform Panamax.',
      choices: [
        {label: 'Buy Capesize FFAs and sell Panamax FFAs — an index spread', ok: true},
        {label: 'Buy both', ok: false},
        {label: 'Sell both', ok: false},
      ],
      caption: 'FFAs also express views with no physical exposure.',
    },
  ],
};

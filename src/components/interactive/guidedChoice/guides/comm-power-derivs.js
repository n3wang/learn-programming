/** Guided: picking a power derivative. */

export default {
  title: 'Pick a power derivative',
  lead: 'Match each need to a structure.',
  steps: [
    {
      ask: 'A supplier sells fixed-price tariffs and buys at floating day-ahead prices.',
      choices: [
        {label: 'Pay fixed / receive floating on a power swap', ok: true},
        {label: 'Receive fixed on a swap', ok: false},
        {label: 'Sell power calls', ok: false},
      ],
      caption: 'Fixes its purchase cost.',
    },
    {
      ask: 'A GB onshore wind farm wants stable revenue for 15 years.',
      choices: [
        {label: 'A CfD: receives strike − market when prices are low, pays back when high', ok: true},
        {label: 'Buy a payer swaption', ok: false},
        {label: 'Sell spark spread options', ok: false},
      ],
      caption: 'Net revenue = strike price.',
    },
    {
      ask: 'A corporate buyer wants protection but expects prices to fall, and won’t pay a premium.',
      choices: [
        {label: 'Zero-cost min-max: buy a cap (payer swaption), sell a floor', ok: true},
        {label: 'Pay fixed on a swap', ok: false},
        {label: 'Do nothing', ok: false},
      ],
      caption: 'Gives up gains below the floor to fund the cap.',
    },
    {
      ask: 'A smelter with flexible power can stop and resell its power when prices spike.',
      choices: [
        {label: 'Sell OTM power calls to monetise that optionality', ok: true},
        {label: 'Buy power calls', ok: false},
        {label: 'Buy aluminium puts only', ok: false},
      ],
      caption: 'If exercised, it shuts down and delivers its power.',
    },
  ],
};

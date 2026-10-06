/** Guided: multi-criteria star rating. */

export default {
  title: 'Rate the items',
  lead: 'Base 2 stars. Good forecastability −1, small value −1, end of season +1, promotion +2, new product +3, critical +3.',
  steps: [
    {
      ask: 'New product launched with a promotion?',
      choices: [
        {label: '7 stars', ok: true},
        {label: '5 stars', ok: false},
        {label: '3 stars', ok: false},
      ],
      caption: '2 + 3 + 2 = 7.',
    },
    {
      ask: 'Small-value item, well forecast, nothing special?',
      choices: [
        {label: '0 stars', ok: true},
        {label: '2 stars', ok: false},
        {label: '1 star', ok: false},
      ],
      caption: '2 − 1 − 1 = 0 — leave it.',
    },
    {
      ask: 'A critical item scores high. What should the planner do?',
      choices: [
        {label: 'Review it carefully — but not inflate it', ok: true},
        {label: 'Add 20% to be safe', ok: false},
        {label: 'Skip it', ok: false},
      ],
      caption: 'Safety stock is the inventory manager’s tool.',
    },
  ],
};

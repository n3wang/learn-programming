/** Guided: spotting and breaking the sales-forecasting vicious circle. */

export default {
  title: 'Break the circle',
  lead: 'An item has been out of stock for weeks.',
  steps: [
    {
      ask: 'Its forecast, based on recent sales, has dropped to zero. Accuracy is 100%. Verdict?',
      choices: [
        {label: 'A broken process hidden by a flattering metric', ok: true},
        {label: 'Excellent forecasting', ok: false},
        {label: 'Demand has truly disappeared', ok: false},
      ],
      caption: 'Forecast 0, sold 0 — but customers still wanted it.',
    },
    {
      ask: 'What should purchasing receive?',
      choices: [
        {label: 'The unconstrained demand forecast', ok: true},
        {label: 'The constrained sales forecast', ok: false},
        {label: 'The sales target', ok: false},
      ],
      caption: 'Replenishment needs to know what customers want.',
    },
    {
      ask: 'Finance needs next month’s revenue. Demand 50, expected supply 30, price 4.',
      choices: [
        {label: '120 — min(50, 30) × 4', ok: true},
        {label: '200 — 50 × 4', ok: false},
        {label: '0 — the item is out of stock', ok: false},
      ],
      caption: 'Constrain demand by supply, then apply price.',
    },
  ],
};

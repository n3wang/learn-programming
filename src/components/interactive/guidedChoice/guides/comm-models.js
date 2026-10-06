/** Guided: choosing an option model and using put-call parity. */

export default {
  title: 'Pick the model',
  lead: 'Match the situation to the valuation approach.',
  steps: [
    {
      ask: 'Options on a power calendar spread that can trade below zero.',
      choices: [
        {label: 'Bachelier (normal model)', ok: true},
        {label: 'Black–Scholes–Merton', ok: false},
        {label: 'Black-76 lognormal', ok: false},
      ],
      caption: 'Lognormal models can’t produce negative prices.',
    },
    {
      ask: 'An option on an exchange-traded crude oil future with a liquid futures price.',
      choices: [
        {label: 'Black-76 — use the futures price directly', ok: true},
        {label: 'DCF of coupons', ok: false},
        {label: 'Put-call parity alone', ok: false},
      ],
      caption: 'No need to rebuild the forward from spot and carry.',
    },
    {
      ask: 'Forward 1,420, strike 1,420. Call costs 59. The put should cost…',
      choices: [
        {label: 'About 59', ok: true},
        {label: 'About 39', ok: false},
        {label: 'About 79', ok: false},
      ],
      caption: 'C − P = PV(F − K) = 0 at the forward.',
    },
  ],
};

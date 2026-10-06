/** Guided: option payoffs and moneyness. */

export default {
  title: 'Work the payoff',
  lead: 'Gold call, strike 1,400, premium 20.',
  steps: [
    {
      ask: 'Spot 1,450 at expiry. Payoff and profit?',
      choices: [
        {label: 'Payoff 50, profit 30', ok: true},
        {label: 'Payoff 30, profit 50', ok: false},
        {label: 'Payoff 0, profit −20', ok: false},
      ],
      caption: 'MAX(1,450 − 1,400, 0) = 50; minus premium 20.',
    },
    {
      ask: 'Spot is 1,380 today. The call is…',
      choices: [
        {label: 'Out-of-the-money', ok: true},
        {label: 'In-the-money', ok: false},
        {label: 'At-the-money', ok: false},
      ],
      caption: 'Buying at 1,400 is worse than the market at 1,380.',
    },
    {
      ask: 'What is the most the call SELLER can lose?',
      choices: [
        {label: 'Unlimited', ok: true},
        {label: 'The premium', ok: false},
        {label: '1,400', ok: false},
      ],
      caption: 'The seller’s profile mirrors the buyer’s unlimited upside.',
    },
  ],
};

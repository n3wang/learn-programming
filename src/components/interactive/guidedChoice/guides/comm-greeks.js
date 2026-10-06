/** Guided: Greeks and volatility shape. */

export default {
  title: 'Manage the Greeks',
  lead: 'Read and act on option risk.',
  steps: [
    {
      ask: 'You bought calls on 50,000 oz with delta 0.58. How do you delta-hedge?',
      choices: [
        {label: 'Sell about 29,000 oz forward', ok: true},
        {label: 'Buy 29,000 oz', ok: false},
        {label: 'Sell 50,000 oz', ok: false},
      ],
      caption: 'Hedge ratio = notional × delta.',
    },
    {
      ask: 'You sold options and the market starts swinging wildly. Which exposure hurts?',
      choices: [
        {label: 'Short gamma (and short vega if implied vol rises)', ok: true},
        {label: 'Long theta', ok: false},
        {label: 'Long gamma', ok: false},
      ],
      caption: 'Sellers earn time decay but suffer large moves.',
    },
    {
      ask: 'WTI 10-delta puts trade at 36% vol, 10-delta calls at 26%. What does it signal?',
      choices: [
        {label: 'Downside skew — demand for crash protection', ok: true},
        {label: 'Upside skew', ok: false},
        {label: 'Constant volatility', ok: false},
      ],
      caption: 'Natural gas and power often show the opposite (upside) skew.',
    },
  ],
};

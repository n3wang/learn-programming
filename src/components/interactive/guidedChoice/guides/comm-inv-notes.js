/** Guided: matching structured notes to views. */

export default {
  title: 'Match the note to the view',
  lead: 'Pick the structured product that fits each investor.',
  steps: [
    {
      ask: 'Bullish on gold but cannot risk losing capital.',
      choices: [
        {label: 'Capital-protected note: zero-coupon bond + call option', ok: true},
        {label: 'Reverse convertible', ok: false},
        {label: 'Worst-of autocallable', ok: false},
      ],
      caption: 'Protection is only as good as the issuer’s credit.',
    },
    {
      ask: 'Expects oil to stay flat or rise modestly and wants a high coupon.',
      choices: [
        {label: 'Reverse convertible — deposit + short down-and-in put', ok: true},
        {label: 'Capital-protected call note', ok: false},
        {label: 'Outperformance note', ok: false},
      ],
      caption: 'Capital is at risk only if the barrier is hit and prices end lower.',
    },
    {
      ask: 'Thinks oil will beat gold, whatever the overall direction.',
      choices: [
        {label: 'Outperformance note on (oil return − gold return)', ok: true},
        {label: 'Basket note on oil and gold', ok: false},
        {label: 'Worst-of call', ok: false},
      ],
      caption: 'Pays even if both fall, as long as oil falls less.',
    },
    {
      ask: 'Bullish on both coal and freight and wants a cheaper option.',
      choices: [
        {label: 'Worst-of call — pays on the weaker performer only if both rise', ok: true},
        {label: 'Best-of call', ok: false},
        {label: 'Short put', ok: false},
      ],
      caption: 'Cheaper because it needs everything to go right.',
    },
  ],
};

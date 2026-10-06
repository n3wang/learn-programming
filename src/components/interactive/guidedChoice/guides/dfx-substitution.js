/** Guided: substitution, cannibalization, and top-down splits. */

export default {
  title: 'Who stole the demand?',
  lead: 'Diagnose and correct distorted item-level sales.',
  steps: [
    {
      ask: 'Strawberry runs out; raspberry sales spike the same week.',
      choices: [
        {label: 'Substitution', ok: true},
        {label: 'Cannibalization', ok: false},
        {label: 'Seasonality', ok: false},
      ],
      caption: 'Raspberry sales exceed its own demand; strawberry demand is hidden.',
    },
    {
      ask: 'A new premium flavour launches and classic chocolate sales dip.',
      choices: [
        {label: 'Cannibalization', ok: true},
        {label: 'Substitution', ok: false},
        {label: 'Duplicate orders', ok: false},
      ],
      caption: 'Launches and promotions pull demand from similar items.',
    },
    {
      ask: 'You forecast the family total. How should you split it to SKUs?',
      choices: [
        {label: 'By shares from censored, in-stock history', ok: true},
        {label: 'By last month’s raw sales', ok: false},
        {label: 'Equally across SKUs', ok: false},
      ],
      caption: 'Raw shares punish recently out-of-stock SKUs and restart the vicious circle.',
    },
  ],
};

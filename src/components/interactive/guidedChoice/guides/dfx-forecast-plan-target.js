/** Guided: forecast vs supply plan vs budget vs sales target. */

export default {
  title: 'Prediction, decision, or goal?',
  lead: 'Classify each number.',
  steps: [
    {
      ask: '“We expect customers to order 1,000 units in March.”',
      choices: [
        {label: 'Demand forecast (prediction)', ok: true},
        {label: 'Supply plan (decision)', ok: false},
        {label: 'Sales target (incentive)', ok: false},
      ],
      caption: 'Unbiased estimate of what customers will want.',
    },
    {
      ask: '“We will produce 1,200 units in March to rebuild safety stock.”',
      choices: [
        {label: 'Supply plan (decision)', ok: true},
        {label: 'Demand forecast', ok: false},
        {label: 'Budget', ok: false},
      ],
      caption: 'The plan uses the forecast plus constraints and stock targets.',
    },
    {
      ask: 'Sales asks to lower the forecast to 800 “to be realistic”, while keeping production at 1,200.',
      choices: [
        {label: 'Likely target lobbying — check their bias history', ok: true},
        {label: 'Accept — sales knows best', ok: false},
        {label: 'Lower production too', ok: false},
      ],
      caption: 'Lower forecasts make targets easier to beat.',
    },
  ],
};

/** Guided: value-weighted portfolio KPIs. */

export default {
  title: 'Weight the portfolio',
  lead: 'Two items: screws (demand 1,000, forecast 800, €0.05) and motors (demand 20, forecast 25, €200).',
  steps: [
    {
      ask: 'Which item dominates the unweighted absolute error?',
      choices: [
        {label: 'Screws (200 units vs 5)', ok: true},
        {label: 'Motors', ok: false},
        {label: 'Equal', ok: false},
      ],
      caption: 'Volume drives unweighted metrics.',
    },
    {
      ask: 'Weighted absolute errors?',
      choices: [
        {label: 'Screws €10, motors €1,000', ok: true},
        {label: 'Screws €200, motors €5', ok: false},
        {label: 'Screws €1,000, motors €10', ok: false},
      ],
      caption: '200 × 0.05 = 10; 5 × 200 = 1,000.',
    },
    {
      ask: 'Which item should the planner look at first?',
      choices: [
        {label: 'Motors', ok: true},
        {label: 'Screws', ok: false},
        {label: 'Neither', ok: false},
      ],
      caption: 'Value weighting points to business impact.',
    },
  ],
};

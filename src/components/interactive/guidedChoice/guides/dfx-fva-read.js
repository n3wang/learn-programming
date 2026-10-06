/** Guided: reading an FVA dashboard. */

export default {
  title: 'Read the FVA table',
  lead: 'Benchmark 50%, model 42%, planners 40%, sales 44%, consensus 44% (MAE).',
  steps: [
    {
      ask: 'FVA of the baseline model versus the benchmark?',
      choices: [
        {label: '+8', ok: true},
        {label: '−8', ok: false},
        {label: '+42', ok: false},
      ],
      caption: '50 − 42 = 8 points better.',
    },
    {
      ask: 'Which step destroys value?',
      choices: [
        {label: 'Sales (−4)', ok: true},
        {label: 'Planners', ok: false},
        {label: 'Consensus', ok: false},
      ],
      caption: '40 → 44: the sales edits made it worse.',
    },
    {
      ask: 'First response?',
      choices: [
        {label: 'Investigate root causes (bias, incentives) with the team', ok: true},
        {label: 'Remove sales from the process immediately', ok: false},
        {label: 'Publish a ranking of individuals', ok: false},
      ],
      caption: 'Fix the process; removing steps is a last resort.',
    },
  ],
};

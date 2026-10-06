/** Guided: realistic ML expectations and testing. */

export default {
  title: 'Set expectations',
  lead: 'Plan an ML initiative realistically.',
  steps: [
    {
      ask: 'What error reduction versus a good moving average should you plan for?',
      choices: [
        {label: 'Roughly 0–30%, more with rich drivers', ok: true},
        {label: '60–80%', ok: false},
        {label: 'None — ML never helps', ok: false},
      ],
      caption: 'Over-promising creates resistance; under-promising kills traction.',
    },
    {
      ask: 'The team chose the best of 20 models on 2025 and reports its 2025 accuracy.',
      choices: [
        {label: 'Cherry-picking — evaluate on a held-out test period', ok: true},
        {label: 'Fine', ok: false},
        {label: 'Use MAPE instead', ok: false},
      ],
      caption: 'Test on data untouched by selection and tuning.',
    },
    {
      ask: 'ML beats the old baseline but not the full consensus process. Failure?',
      choices: [
        {label: 'No — use it as the new baseline and let planners add their information', ok: true},
        {label: 'Yes — abandon ML', ok: false},
        {label: 'Remove the planners', ok: false},
      ],
      caption: 'Better baseline, less work, better final forecast.',
    },
  ],
};

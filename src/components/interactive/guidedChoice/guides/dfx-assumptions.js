/** Guided: assumption-based group forecasts. */

export default {
  title: 'Vote first, debate after',
  lead: 'Baseline 800. Inputs: 900 (promo, +100), 1,000 (new distributor, +200), 850 (competitor exit, +50).',
  steps: [
    {
      ask: 'Simple average of the three inputs?',
      choices: [
        {label: '≈ 917', ok: true},
        {label: '1,150', ok: false},
        {label: '800', ok: false},
      ],
      caption: '(900 + 1,000 + 850) / 3 ≈ 917 — but is that right?',
    },
    {
      ask: 'The three assumptions are distinct. Better forecast?',
      choices: [
        {label: '1,150 — add the uplifts to the baseline', ok: true},
        {label: '917 — average', ok: false},
        {label: '1,000 — the highest input', ok: false},
      ],
      caption: '800 + 100 + 200 + 50 = 1,150.',
    },
    {
      ask: 'Two people both cite the same promotion. What now?',
      choices: [
        {label: 'Count its effect once', ok: true},
        {label: 'Count it twice', ok: false},
        {label: 'Ignore it', ok: false},
      ],
      caption: 'Combine distinct assumptions; remove overlaps.',
    },
  ],
};

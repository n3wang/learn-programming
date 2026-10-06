/** Guided: crude quality and refinery economics. */

export default {
  title: 'Value the crude',
  lead: 'Think like a refiner.',
  steps: [
    {
      ask: 'Crude A: API 40, 0.3% sulfur. Crude B: API 20, 2.5% sulfur. Which commands a premium?',
      choices: [
        {label: 'A — light sweet', ok: true},
        {label: 'B — heavy sour', ok: false},
        {label: 'Equal', ok: false},
      ],
      caption: 'More high-value products, less processing.',
    },
    {
      ask: 'Forties costs more than Oseberg but yields a margin of 2.40 vs 1.50. Which should the refinery run?',
      choices: [
        {label: 'Forties — maximise gross product worth minus crude cost', ok: true},
        {label: 'Oseberg — it is cheaper', ok: false},
        {label: 'Neither', ok: false},
      ],
      caption: 'Margin, not crude price, decides.',
    },
    {
      ask: 'A complex refinery can process heavy sour crude. In a tight light-crude market it…',
      choices: [
        {label: 'Earns more, as heavy grades trade at wider discounts', ok: true},
        {label: 'Must shut down', ok: false},
        {label: 'Pays a premium for heavy crude', ok: false},
      ],
      caption: 'Complexity monetises differentials.',
    },
  ],
};

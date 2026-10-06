/** Guided: fair benchmarking. */

export default {
  title: 'Benchmark fairly',
  lead: 'Is your forecast actually good?',
  steps: [
    {
      ask: 'A vendor says their model “beats the naïve forecast by 30%”. Impressed?',
      choices: [
        {label: 'Not yet — compare with the best moving average or seasonal benchmark', ok: true},
        {label: 'Yes — buy it', ok: false},
        {label: 'Compare with COV', ok: false},
      ],
      caption: 'Naïve is too easy to beat.',
    },
    {
      ask: 'Last 3 periods 80, 100, 90; last 6: 70, 110, 95, 80, 100, 90. MA3 and MA6?',
      choices: [
        {label: '90 and 90.8', ok: true},
        {label: '90 and 95', ok: false},
        {label: '100 and 90', ok: false},
      ],
      caption: '270/3 = 90; 545/6 ≈ 90.8.',
    },
    {
      ask: 'Your model was tuned on 2025. Where do you compare it with the benchmark?',
      choices: [
        {label: 'On later, unseen data (out-of-sample)', ok: true},
        {label: 'On 2025', ok: false},
        {label: 'Anywhere', ok: false},
      ],
      caption: 'In-sample comparisons reward overfitting.',
    },
  ],
};

/** TensorFlow tensors and tooling overview. */

export default {
  title: 'Tensors and ML tooling',
  lead:
    'TensorFlow moves multi-index arrays (tensors) along a dataflow graph. Rank = number of axes; shape = length of each axis. Sklearn wants column-shaped features.',
  steps: [
    {
      caption:
        'Rank 0 scalar has shape $()$. A $(2,3)$ matrix has size $6$. Physics check: $A=Z+N$ is a rank-0 add.',
    },
    {
      ask: 'For a single feature vector of length 7, sklearn typically wants shape…',
      choices: [
        {label: '(7, 1) — a column', ok: true},
        {label: 'only () forever', ok: false},
        {label: '(1, 1, 1, 7) mandatory', ok: false},
      ],
      caption:
        'Install TF 2.x locally in a conda/Jupyter environment for notebooks; this course’s graded sandbox mirrors the arithmetic in pure Python.',
    },
  ],
};

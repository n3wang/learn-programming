/** Hierarchical deep net for line patterns. */

export default {
  title: 'Graphical deep net',
  lead:
    'A didactic deep net builds features hierarchically: pixels → pairs → line orientations → class, with ReLU gating positive evidence.',
  steps: [
    {
      caption:
        'Early hidden nodes detect local structure (e.g. a vertical pair). A horizontal input can cancel a vertical probe: $(-1)(1)+(1)(1)=0$ → inactive.',
    },
    {
      ask: 'Later layers mainly…',
      choices: [
        {label: 'compose simpler detectors into richer patterns (lines / classes)', ok: true},
        {label: 'ignore all previous activations', ok: false},
        {label: 'replace ReLU with PCA only', ok: false},
      ],
      caption:
        'No same-layer edges in this teaching graph. Design challenge: separate the four two-cell patterns $[X]\\square$, $[X][X]$, $\\square[X]$, $\\square\\square$.',
    },
  ],
};

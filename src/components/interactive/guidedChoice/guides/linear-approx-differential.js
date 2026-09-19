/** Guided: linear approximation via differentials. */

export default {
  title: 'Linear approximation',
  lead: 'For small Δx: f(x+Δx) ≈ f(x) + f′(x) Δx.',
  steps: [
    {
      ask: 'To estimate √16.2, a natural base point and increment are…',
      choices: [
        {label: 'x = 16, Δx = 0.2', ok: true},
        {label: 'x = 16.2, Δx = 0', ok: false},
        {label: 'x = 0, Δx = 16.2', ok: false},
      ],
      caption: 'Choose a nearby easy value of f.',
    },
    {
      ask: 'With f(x)=√x, f′(16) equals…',
      choices: [
        {label: '1/8', ok: true},
        {label: '1/4', ok: false},
        {label: '4', ok: false},
      ],
      caption: 'f′(x) = 1/(2√x) = 1/8 at x=16.',
    },
    {
      ask: 'The linear estimate of √16.2 is…',
      choices: [
        {label: '4 + (1/8)(0.2) = 4.025', ok: true},
        {label: '4.2', ok: false},
        {label: '4', ok: false},
      ],
      caption: 'True value ≈ 4.0249 — three decimals match.',
    },
  ],
};

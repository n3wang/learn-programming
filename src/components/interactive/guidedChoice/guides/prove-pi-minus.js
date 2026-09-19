/** Guided proof: sin(π−θ)=sin θ, cos(π−θ)=−cos θ. */

export default {
  title: 'Proof — sin(π − θ) and cos(π − θ)',
  lead: 'Expand with addition formulas and the values at π.',
  steps: [
    {
      ask: 'Expand sin(π − θ) with the sine-difference formula:',
      choices: [
        {label: 'sin π cos θ − cos π sin θ', ok: true},
        {label: 'sin π cos θ + cos π sin θ', ok: false},
        {label: 'cos π cos θ only', ok: false},
      ],
      caption: 'sin(u−v)=sin u cos v − cos u sin v with u=π.',
    },
    {
      ask: 'Using sin π = 0 and cos π = −1, this simplifies to…',
      choices: [
        {label: 'sin θ', ok: true},
        {label: '−sin θ', ok: false},
        {label: 'cos θ', ok: false},
      ],
      caption: '0 · cos θ − (−1) sin θ = sin θ.',
    },
    {
      ask: 'Similarly, cos(π − θ) expands to…',
      choices: [
        {label: '−cos θ', ok: true},
        {label: 'cos θ', ok: false},
        {label: 'sin θ', ok: false},
      ],
      caption: 'cos π cos θ + sin π sin θ = −cos θ.',
    },
  ],
};

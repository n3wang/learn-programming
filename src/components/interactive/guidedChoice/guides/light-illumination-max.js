/** Guided: maximize illumination over a circular plot. */

export default {
  title: 'Light over a circular plot',
  lead: 'I = k x / (x²+900)^{3/2}; maximize in height x.',
  steps: [
    {
      ask: 'With radius 30 and height x, intensity proportional to cos θ / y² becomes…',
      choices: [
        {label: 'I = k x / (x² + 900)^{3/2}', ok: true},
        {label: 'I = k / x²', ok: false},
        {label: 'I = k cos θ only', ok: false},
      ],
      caption: 'cos θ = x/y and y² = x²+900.',
    },
    {
      ask: 'I′ = 0 reduces to…',
      choices: [
        {label: '900 − 2x² = 0 ⇒ x = 15√2', ok: true},
        {label: 'x = 30', ok: false},
        {label: 'x = 0', ok: false},
      ],
      caption: 'Quotient/chain on (x²+900)^{3/2}.',
    },
  ],
};

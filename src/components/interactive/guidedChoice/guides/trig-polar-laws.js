/** Guided: polar coords and law of cosines/sines. */

export default {
  title: 'Polar coordinates and triangle laws',
  lead: 'Connect (r,θ) to (x,y), then the laws of cosines and sines.',
  steps: [
    {
      ask: 'If A has polar coordinates (r,θ), then…',
      choices: [
        {label: 'x = r cos θ and y = r sin θ', ok: true},
        {label: 'x = r sin θ and y = r cos θ always', ok: false},
        {label: 'r = x + y', ok: false},
      ],
      caption: 'Same as scaling the unit-circle point by r.',
    },
    {
      ask: 'The law of cosines in △ABC with included angle θ opposite side c is…',
      choices: [
        {label: 'c² = a² + b² − 2ab cos θ', ok: true},
        {label: 'c² = a² + b² + 2ab cos θ', ok: false},
        {label: 'c = a + b − cos θ', ok: false},
      ],
      caption: 'Reduces to Pythagoras when θ = π/2.',
    },
    {
      ask: 'The law of sines says…',
      choices: [
        {label: 'sin A / a = sin B / b = sin C / c', ok: true},
        {label: 'sin A · a = sin B · b', ok: false},
        {label: 'A/a = B/b only for right triangles', ok: false},
      ],
      caption: 'Side opposite an angle over the sine of that angle is constant.',
    },
  ],
};

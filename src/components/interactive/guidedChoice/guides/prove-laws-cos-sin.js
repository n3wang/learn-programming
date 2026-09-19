/** Guided proof: law of cosines and law of sines. */

export default {
  title: 'Proof — laws of cosines and sines',
  lead: 'Place the triangle in the plane; use distance and area.',
  steps: [
    {
      ask: 'For the law of cosines, put C at the origin and B at (a,0). Then A is…',
      choices: [
        {label: '(b cos θ, b sin θ)', ok: true},
        {label: '(a, b)', ok: false},
        {label: '(0, b)', ok: false},
      ],
      caption: 'Polar/rectangular with r = b and angle θ = ∠C.',
    },
    {
      ask: 'Expanding c² = (x − a)² + y² and using sin²+cos²=1 yields…',
      choices: [
        {label: 'c² = a² + b² − 2ab cos θ', ok: true},
        {label: 'c² = a² + b² + 2ab cos θ', ok: false},
        {label: 'c = a − b', ok: false},
      ],
      caption: 'The cross term produces −2ab cos θ.',
    },
    {
      ask: 'For the law of sines, comparing area formulas ½ac sin B = ½bc sin A gives…',
      choices: [
        {label: 'sin A / a = sin B / b (and likewise for C)', ok: true},
        {label: 'A/a = B/b with no sines', ok: false},
        {label: 'Only Pythagoras', ok: false},
      ],
      caption: 'Cancel ½abc after writing all three area expressions.',
    },
  ],
};

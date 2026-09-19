/** Guided: unit-circle sine and cosine. */

export default {
  title: 'Unit-circle sine and cosine',
  lead: 'Rotate (1,0) by θ; read cos θ and sin θ as the coordinates of the tip.',
  steps: [
    {
      ask: 'After rotating (1,0) by θ (radians), cos θ and sin θ are…',
      choices: [
        {label: 'The x- and y-coordinates of the terminal point on the unit circle', ok: true},
        {label: 'Always positive', ok: false},
        {label: 'Only defined for acute angles', ok: false},
      ],
      caption: 'This extends the high-school right-triangle ratios to all directed angles.',
    },
    {
      ask: 'For an acute angle in a right triangle, these match…',
      choices: [
        {label: 'adjacent/hypotenuse and opposite/hypotenuse', ok: true},
        {label: 'Only the tangent ratio', ok: false},
        {label: 'Arc length formulas', ok: false},
      ],
      caption: 'Similar triangles with hypotenuse 1 recover the classical definitions.',
    },
    {
      ask: 'Which identity follows immediately from the unit circle?',
      choices: [
        {label: 'sin²θ + cos²θ = 1', ok: true},
        {label: 'sin θ = cos θ for all θ', ok: false},
        {label: 'sin(θ+π) = sin θ', ok: false},
      ],
      caption: 'Distance from origin to (cos θ, sin θ) is 1.',
    },
  ],
};

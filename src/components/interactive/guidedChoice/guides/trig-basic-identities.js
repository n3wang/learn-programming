/** Guided: basic trig identities and quadrant signs. */

export default {
  title: 'Basic trig identities',
  lead: 'Periodicity, even/odd, and quadrant signs.',
  steps: [
    {
      ask: 'cos(θ+2π) and sin(θ+2π) equal…',
      choices: [
        {label: 'cos θ and sin θ (period 2π)', ok: true},
        {label: '−cos θ and −sin θ', ok: false},
        {label: 'cos(−θ) only', ok: false},
      ],
      caption: 'A full extra turn returns to the same point.',
    },
    {
      ask: 'cos(−θ) and sin(−θ) equal…',
      choices: [
        {label: 'cos θ and −sin θ (cosine even, sine odd)', ok: true},
        {label: '−cos θ and sin θ', ok: false},
        {label: 'Both unchanged', ok: false},
      ],
      caption: 'Reflection across the x-axis.',
    },
    {
      ask: 'In quadrant II, the signs of (sin, cos) are…',
      choices: [
        {label: '(+, −)', ok: true},
        {label: '(+, +)', ok: false},
        {label: '(−, −)', ok: false},
      ],
      caption: 'x negative, y positive.',
    },
  ],
};

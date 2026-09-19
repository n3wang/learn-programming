/** Guided: Newton on x³+2x−5 and 2cos x − x². */

export default {
  title: 'Newton root finding',
  lead: 'Pick a seed from a sketch; iterate x ← x − f(x)/f′(x).',
  steps: [
    {
      ask: 'For f(x)=x³+2x−5 with x₀=1, the update is…',
      choices: [
        {label: 'xₙ₊₁ = (2xₙ³ + 5)/(3xₙ² + 2)', ok: true},
        {label: 'xₙ₊₁ = xₙ − 5', ok: false},
        {label: 'xₙ₊₁ = (xₙ³ + 2xₙ − 5)/2', ok: false},
      ],
      caption: 'x − f/f′ with f′ = 3x²+2.',
    },
    {
      ask: 'Then x₁ equals…',
      choices: [
        {label: '7/5 = 1.4', ok: true},
        {label: '1', ok: false},
        {label: '2', ok: false},
      ],
      caption: '(2·1 + 5)/(3+2) = 7/5.',
    },
    {
      ask: 'For 2 cos x − x² = 0, because f is even…',
      choices: [
        {label: 'roots come in ± pairs', ok: true},
        {label: 'there is only one real root', ok: false},
        {label: 'Newton cannot start at x₀=1', ok: false},
      ],
      caption: 'Find the positive root; negate for the other.',
    },
  ],
};

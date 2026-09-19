/** Guided: when Newton's method fails. */

export default {
  title: "When Newton's method fails",
  lead: 'Watch for f′(xₙ)=0, vertical tangents, or bad basins of attraction.',
  steps: [
    {
      ask: 'For f(x)=x^{1/3} with x₀=1, the Newton update becomes…',
      choices: [
        {label: 'xₙ₊₁ = −2 xₙ (diverges by oscillation)', ok: true},
        {label: 'xₙ₊₁ = 0 immediately', ok: false},
        {label: 'xₙ₊₁ = xₙ / 3', ok: false},
      ],
      caption: 'f′(x)=(1/3)x^{−2/3}; x − f/f′ = x − 3x = −2x.',
    },
    {
      ask: 'If f′(x₀)=0 at the seed, Newton…',
      choices: [
        {label: 'cannot take the tangent-intercept step', ok: true},
        {label: 'always converges faster', ok: false},
        {label: 'equals bisection', ok: false},
      ],
      caption: 'Horizontal tangent never meets the axis (or the formula divides by 0).',
    },
    {
      ask: 'A reliable fix when Newton misbehaves is to…',
      choices: [
        {label: 'replot, pick a better seed, or switch method near trouble', ok: true},
        {label: 'always double the step', ok: false},
        {label: 'ignore f′ and iterate x←x+1', ok: false},
      ],
      caption: 'Geometry first; Newton second.',
    },
  ],
};

/** Guided: Newton for √3 via f(x)=x²−3. */

export default {
  title: "Newton's method — √3",
  lead: 'Iterate xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) with f(x)=x²−3.',
  steps: [
    {
      ask: 'For f(x)=x²−3 the Newton update simplifies to…',
      choices: [
        {label: 'xₙ₊₁ = (xₙ² + 3)/(2 xₙ)', ok: true},
        {label: 'xₙ₊₁ = xₙ − 3', ok: false},
        {label: 'xₙ₊₁ = 2 xₙ', ok: false},
      ],
      caption: 'x − (x²−3)/(2x) = (x²+3)/(2x).',
    },
    {
      ask: 'Starting at x₀=1, the first iterate x₁ is…',
      choices: [
        {label: '2', ok: true},
        {label: '1.5', ok: false},
        {label: '√3', ok: false},
      ],
      caption: '(1+3)/2 = 2.',
    },
    {
      ask: 'Newton can fail when…',
      choices: [
        {label: 'f′(xₙ)≈0 or the start is too far from a simple root', ok: true},
        {label: 'f is differentiable', ok: false},
        {label: 'x₀ is already close', ok: false},
      ],
      caption: 'Horizontal tangent or wild oscillation — try a better seed.',
    },
  ],
};

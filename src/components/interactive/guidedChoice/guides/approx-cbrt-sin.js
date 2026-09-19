/** Guided: cube root + sin 61° linear approx. */

export default {
  title: 'Linear approx — cube root & sine',
  lead: 'Use f(x+Δx) ≈ f(x) + f′(x) Δx with a convenient nearby base.',
  steps: [
    {
      ask: 'For ∛124, the natural base is…',
      choices: [
        {label: 'x = 125, Δx = −1', ok: true},
        {label: 'x = 124, Δx = 0', ok: false},
        {label: 'x = 100, Δx = 24', ok: false},
      ],
      caption: '∛125 = 5 is exact.',
    },
    {
      ask: 'Then f′(125) for f(x)=x^{1/3} equals…',
      choices: [
        {label: '1/75', ok: true},
        {label: '1/15', ok: false},
        {label: '5', ok: false},
      ],
      caption: '(1/3)·125^{−2/3} = 1/(3·25) = 1/75.',
    },
    {
      ask: 'For sin 61°, work in radians with…',
      choices: [
        {label: 'x = π/3, Δx = π/180', ok: true},
        {label: 'x = 60, Δx = 1 (degrees in the derivative)', ok: false},
        {label: 'x = 0, Δx = 61°', ok: false},
      ],
      caption: 'Derivatives of trig need radians.',
    },
  ],
};

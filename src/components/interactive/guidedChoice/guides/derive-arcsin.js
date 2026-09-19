/** Guided: derivative of arcsin via implicit differentiation. */

export default {
  title: 'Derivative of arcsin',
  lead: 'From sin y = x, get y′ = 1/cos y = 1/√(1−x²).',
  steps: [
    {
      ask: 'If y = arcsin x, differentiating sin y = x gives…',
      choices: [
        {label: 'cos y · y′ = 1', ok: true},
        {label: 'sin y · y′ = 1', ok: false},
        {label: 'y′ = cos y', ok: false},
      ],
      caption: 'Implicit differentiation (Chain Rule).',
    },
    {
      ask: 'On the arcsin range [−π/2, π/2], cos y is…',
      choices: [
        {label: 'Nonnegative, so cos y = √(1−x²)', ok: true},
        {label: 'Always negative', ok: false},
        {label: 'Equal to x', ok: false},
      ],
      caption: 'cos² y = 1 − sin² y = 1 − x²; pick the + root.',
    },
    {
      ask: 'Therefore Dₓ(arcsin x) equals…',
      choices: [
        {label: '1 / √(1 − x²)', ok: true},
        {label: '−1 / √(1 − x²)', ok: false},
        {label: '1 / (1 + x²)', ok: false},
      ],
      caption: 'Formula (18.1).',
    },
  ],
};

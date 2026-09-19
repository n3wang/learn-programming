/** Guided: Dₓ(sin x)=cos x and Dₓ(cos x)=−sin x. */

export default {
  title: 'Derivatives of sin and cos',
  lead: 'Difference quotient → addition formula → key limits.',
  steps: [
    {
      ask: 'The difference quotient for sin is…',
      choices: [
        {
          label: '[sin(x+h)−sin x]/h',
          ok: true,
        },
        {label: 'cos(x+h)−cos x', ok: false},
        {label: 'sin(x/h)', ok: false},
      ],
      caption: 'Definition of the derivative.',
    },
    {
      ask: 'Expanding sin(x+h) and taking h→0 uses lim (sin h)/h = 1 and lim (1−cos h)/h = 0 to get…',
      choices: [
        {label: 'cos x', ok: true},
        {label: '−sin x', ok: false},
        {label: 'sec² x', ok: false},
      ],
      caption: 'Dₓ(sin x) = cos x.',
    },
    {
      ask: 'Writing cos x = sin(π/2 − x) and using the Chain Rule gives Dₓ(cos x) =…',
      choices: [
        {label: '−sin x', ok: true},
        {label: 'sin x', ok: false},
        {label: 'cos x', ok: false},
      ],
      caption: 'cos(π/2−x)·(−1) = −sin x.',
    },
  ],
};

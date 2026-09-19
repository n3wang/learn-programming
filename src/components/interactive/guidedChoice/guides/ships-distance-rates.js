/** Guided: two ships distance rate. */

export default {
  title: 'Two ships — distance rate',
  lead: 'D² = (32−16t)² + (12t)²; differentiate for dD/dt.',
  steps: [
    {
      ask: 'After differentiating, dD/dt equals…',
      choices: [
        {label: '(400t − 512)/D', ok: true},
        {label: '400t − 512', ok: false},
        {label: 'D', ok: false},
      ],
      caption: 'From 2D D′ = 2(400t−512).',
    },
    {
      ask: 'At t=1 they are…',
      choices: [
        {label: 'Approaching (dD/dt < 0)', ok: true},
        {label: 'Separating', ok: false},
        {label: 'Stationary', ok: false},
      ],
      caption: 'dD/dt = −5.6 at t=1.',
    },
    {
      ask: 'They cease approaching when dD/dt = 0, i.e.…',
      choices: [
        {label: 't = 512/400 = 1.28 h', ok: true},
        {label: 't = 0', ok: false},
        {label: 't = 2 only', ok: false},
      ],
      caption: 'Nearest when the relative radial speed vanishes.',
    },
  ],
};

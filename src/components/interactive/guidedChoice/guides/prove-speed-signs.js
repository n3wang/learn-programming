/** Guided: prove speed increases iff v and a same sign. */

export default {
  title: 'Proof — speed and signs of v, a',
  lead: 'S = |v|; differentiate on {v>0} and {v<0}.',
  steps: [
    {
      ask: 'When v > 0, speed S equals…',
      choices: [
        {label: 'v, so dS/dt = a', ok: true},
        {label: '−v, so dS/dt = −a', ok: false},
        {label: 'a', ok: false},
      ],
      caption: 'Positive branch of absolute value.',
    },
    {
      ask: 'When v < 0, S = −v, so dS/dt equals…',
      choices: [
        {label: '−a', ok: true},
        {label: 'a', ok: false},
        {label: '0', ok: false},
      ],
      caption: 'Chain rule on −v.',
    },
    {
      ask: 'Therefore S is increasing when…',
      choices: [
        {
          label: 'v and a have the same sign (both >0 or both <0)',
          ok: true,
        },
        {label: 'a = 0 only', ok: false},
        {label: 'v = 0 only', ok: false},
      ],
      caption: 'Same sign ⇒ dS/dt > 0; opposite ⇒ dS/dt < 0.',
    },
  ],
};

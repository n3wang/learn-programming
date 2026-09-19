/** Guided: arcsin x + arccos x = π/2. */

export default {
  title: 'Proof — arcsin + arccos = π/2',
  lead: 'Derivative zero ⇒ constant; evaluate at 0.',
  steps: [
    {
      ask: 'Dₓ(arcsin x + arccos x) equals…',
      choices: [
        {label: '0', ok: true},
        {label: '2/√(1−x²)', ok: false},
        {label: '1', ok: false},
      ],
      caption: 'arcsin′ and arccos′ cancel.',
    },
    {
      ask: 'A function with derivative 0 on (−1,1) is…',
      choices: [
        {label: 'Constant (by the mean-value / Ch.13 argument)', ok: true},
        {label: 'Necessarily zero', ok: false},
        {label: 'Necessarily π/2 at every point without checking', ok: false},
      ],
      caption: 'Still need one evaluation to name the constant.',
    },
    {
      ask: 'arcsin 0 + arccos 0 equals…',
      choices: [
        {label: 'π/2', ok: true},
        {label: '0', ok: false},
        {label: 'π', ok: false},
      ],
      caption: 'So the constant is π/2.',
    },
  ],
};

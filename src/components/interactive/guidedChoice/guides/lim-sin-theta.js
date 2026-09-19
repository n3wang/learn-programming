/** Guided: lim θ→0 sinθ/θ = 1 and (1−cosθ)/θ = 0. */

export default {
  title: 'Key trig limits',
  lead: 'The two limits that unlock Dₓ(sin) and Dₓ(cos).',
  steps: [
    {
      ask: 'lim θ→0 (sin θ)/θ equals…',
      choices: [
        {label: '1', ok: true},
        {label: '0', ok: false},
        {label: '∞', ok: false},
      ],
      caption: 'Standard geometric squeeze / area argument (radians).',
    },
    {
      ask: 'From (sin θ)/θ → 1 we rewrite (1−cos θ)/θ as…',
      choices: [
        {
          label: '(sin θ)/θ · sin θ/(1+cos θ)',
          ok: true,
        },
        {label: 'sin θ · cos θ', ok: false},
        {label: 'θ/(1−cos θ)', ok: false},
      ],
      caption: 'Multiply by (1+cos θ)/(1+cos θ); use 1−cos²=sin².',
    },
    {
      ask: 'Therefore lim θ→0 (1−cos θ)/θ equals…',
      choices: [
        {label: '0', ok: true},
        {label: '1', ok: false},
        {label: '½', ok: false},
      ],
      caption: '1 · (sin 0)/(1+cos 0) = 0/(1+1) = 0.',
    },
  ],
};

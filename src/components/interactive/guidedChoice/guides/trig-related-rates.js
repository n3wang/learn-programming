/** Guided: related rates with cot / csc (pilot sighting). */

export default {
  title: 'Related rates — sighting angle',
  lead: 'x = h cot θ ⇒ dx/dt = −h csc²θ · dθ/dt.',
  steps: [
    {
      ask: 'With altitude 2 and ground distance x ahead, x relates to sighting angle θ by…',
      choices: [
        {label: 'x = 2 cot θ', ok: true},
        {label: 'x = 2 tan θ', ok: false},
        {label: 'x = 2 sin θ', ok: false},
      ],
      caption: 'Adjacent/opposite in the right triangle (Fig. 17-12).',
    },
    {
      ask: 'Differentiating x = 2 cot θ in t gives…',
      choices: [
        {
          label: 'dx/dt = −2 csc²θ · dθ/dt',
          ok: true,
        },
        {label: 'dx/dt = 2 sec²θ · dθ/dt', ok: false},
        {label: 'dx/dt = −2 sin θ', ok: false},
      ],
      caption: 'D(cot)=−csc²; Chain Rule in t.',
    },
    {
      ask: 'If dx/dt = −240 and θ=30° (csc 30°=2), then dθ/dt equals…',
      choices: [
        {label: '30 rad/h', ok: true},
        {label: '240 rad/h', ok: false},
        {label: '15 deg/s', ok: false},
      ],
      caption: '−240 = −2·4·dθ/dt ⇒ dθ/dt = 30 rad/h.',
    },
  ],
};

/** Guided: free-fall formulas under constant gravity. */

export default {
  title: 'Free fall under gravity',
  lead: 'With upward +, a = −32 ft/s² ⇒ v and s formulas.',
  steps: [
    {
      ask: 'If a = dv/dt = −32 (constant), then…',
      choices: [
        {label: 'v = v₀ − 32t', ok: true},
        {label: 'v = −32t only (always)', ok: false},
        {label: 'v = v₀ + 32t', ok: false},
      ],
      caption: 'Integrate; match v(0)=v₀.',
    },
    {
      ask: 'Integrating v = ds/dt then gives…',
      choices: [
        {label: 's = s₀ + v₀ t − 16 t²', ok: true},
        {label: 's = −16 t² only', ok: false},
        {label: 's = s₀ + 32 t', ok: false},
      ],
      caption: '−32t integrates to −16t².',
    },
    {
      ask: 'Acceleration is negative because…',
      choices: [
        {
          label: 'Upward is positive, so gravity decreases velocity',
          ok: true,
        },
        {label: 'Speed always decreases', ok: false},
        {label: 'Objects never go up', ok: false},
      ],
      caption: 'Thrown upward: v shrinks, crosses 0, then becomes negative.',
    },
  ],
};

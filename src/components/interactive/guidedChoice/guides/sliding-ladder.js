/** Guided: sliding ladder calculation. */

export default {
  title: 'Sliding ladder',
  lead: '25 ft ladder; dx/dt = 3; find dy/dt at x = 7.',
  steps: [
    {
      ask: 'The geometric relation is…',
      choices: [
        {label: 'x² + y² = 625', ok: true},
        {label: 'x + y = 25', ok: false},
        {label: 'xy = 25', ok: false},
      ],
      caption: 'Pythagorean theorem.',
    },
    {
      ask: 'Differentiating in t gives…',
      choices: [
        {label: 'x dx/dt + y dy/dt = 0', ok: true},
        {label: '2x + 2y = 0', ok: false},
        {label: 'dx/dt + dy/dt = 25', ok: false},
      ],
      caption: 'Chain Rule on each square.',
    },
    {
      ask: 'At x = 7 (so y = 24) with dx/dt = 3, dy/dt equals…',
      choices: [
        {label: '−7/8 ft/s (sliding down)', ok: true},
        {label: '+7/8 ft/s', ok: false},
        {label: '−3 ft/s', ok: false},
      ],
      caption: 'dy/dt = −(x/y) dx/dt = −(7/24)·3 = −7/8.',
    },
  ],
};

/** Guided: analyze s(t) for v, a, mono, turns. */

export default {
  title: 'Analyze rectilinear s(t)',
  lead: 'v = s′, a = v′; read increasing/decreasing and turns from signs.',
  steps: [
    {
      ask: 's is increasing precisely when…',
      choices: [
        {label: 'v > 0', ok: true},
        {label: 'a > 0', ok: false},
        {label: 'v = 0', ok: false},
      ],
      caption: 'Same as f increasing when f′ > 0.',
    },
    {
      ask: 'v is increasing precisely when…',
      choices: [
        {label: 'a > 0', ok: true},
        {label: 'v > 0', ok: false},
        {label: 's > 0', ok: false},
      ],
      caption: 'a = dv/dt.',
    },
    {
      ask: 'Direction of motion changes when…',
      choices: [
        {
          label: 'v = 0 and s has a relative extremum (a ≠ 0 helps confirm a turn)',
          ok: true,
        },
        {label: 'a = 0 always', ok: false},
        {label: 'v ≠ 0', ok: false},
      ],
      caption: 'A double root of v may not reverse direction (e.g. touches).',
    },
  ],
};

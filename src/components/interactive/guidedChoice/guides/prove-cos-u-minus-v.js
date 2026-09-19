/** Guided proof: cos(u−v) via law of cosines on the unit circle. */

export default {
  title: 'Proof — cos(u − v)',
  lead: 'Chord length between unit points at angles u and v.',
  steps: [
    {
      ask: 'Points B=(cos u, sin u) and C=(cos v, sin v) on the unit circle. The central angle BOC is…',
      choices: [
        {label: '|u − v| (in the case 0 ≤ v < u < v+π)', ok: true},
        {label: 'u + v always', ok: false},
        {label: 'π/2', ok: false},
      ],
      caption: 'Figure 16-14 setup.',
    },
    {
      ask: 'Law of cosines on △BOC with sides 1,1 gives…',
      choices: [
        {label: 'BC² = 2 − 2 cos(u − v)', ok: true},
        {label: 'BC² = 2 + 2 cos(u − v)', ok: false},
        {label: 'BC = cos(u − v)', ok: false},
      ],
      caption: 'c² = 1 + 1 − 2 cos(angle).',
    },
    {
      ask: 'Expanding BC² = (cos u − cos v)² + (sin u − sin v)² and simplifying yields…',
      choices: [
        {label: 'cos(u − v) = cos u cos v + sin u sin v', ok: true},
        {label: 'cos(u − v) = cos u cos v − sin u sin v', ok: false},
        {label: 'sin(u − v) = 1', ok: false},
      ],
      caption: 'Pythagorean terms cancel to 2 − 2(cos u cos v + sin u sin v).',
    },
  ],
};

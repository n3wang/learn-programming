/** Guided: double-angle and half-angle. */

export default {
  title: 'Double- and half-angle formulas',
  lead: 'Specialize addition formulas, then solve for half-angle squares.',
  steps: [
    {
      ask: 'Setting v = u in the cosine addition formula gives…',
      choices: [
        {label: 'cos 2u = cos²u − sin²u (and then the 2cos²−1 / 1−2sin² forms)', ok: true},
        {label: 'cos 2u = 2 sin u cos u', ok: false},
        {label: 'cos 2u = 1', ok: false},
      ],
      caption: 'Pythagorean identity rewrites the other two cosine double-angle forms.',
    },
    {
      ask: 'sin 2u equals…',
      choices: [
        {label: '2 sin u cos u', ok: true},
        {label: 'cos²u − sin²u', ok: false},
        {label: '(1 − cos u)/2', ok: false},
      ],
      caption: 'Set v = u in sin(u+v).',
    },
    {
      ask: 'From cos u = 2 cos²(u/2) − 1 one solves…',
      choices: [
        {label: 'cos²(u/2) = (1 + cos u)/2  (and similarly sin²(u/2) = (1 − cos u)/2)', ok: true},
        {label: 'cos(u/2) = cos u / 2', ok: false},
        {label: 'sin(u/2) = sin u', ok: false},
      ],
      caption: 'Half-angle identities (squared forms).',
    },
  ],
};

/** Guided: dy/dx from differentials (implicit). */

export default {
  title: 'dy/dx via differentials',
  lead: 'Take d(…) of both sides; collect dy and dx; form dy/dx.',
  steps: [
    {
      ask: 'From xy + x − 2y = 5, after differentiating…',
      choices: [
        {label: '(x−2) dy + (y+1) dx = 0', ok: true},
        {label: 'xy′ + 1 = 0', ok: false},
        {label: 'dx − 2 dy = 0 only', ok: false},
      ],
      caption: 'Product rule on xy; constants vanish.',
    },
    {
      ask: 'Hence dy/dx equals…',
      choices: [
        {label: '−(y+1)/(x−2)', ok: true},
        {label: '(y+1)/(x−2)', ok: false},
        {label: 'y/x', ok: false},
      ],
      caption: 'Solve for the ratio dy/dx.',
    },
  ],
};

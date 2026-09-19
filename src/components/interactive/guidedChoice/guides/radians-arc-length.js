/** Guided: radians vs degrees and arc length. */

export default {
  title: 'Radians and arc length',
  lead: 'One radian is the central angle that cuts off arc length 1 on the unit circle.',
  steps: [
    {
      ask: 'On the unit circle, the central angle that subtends an arc of length 1 measures…',
      choices: [
        {label: '1 radian', ok: true},
        {label: '1 degree', ok: false},
        {label: 'π radians', ok: false},
      ],
      caption: 'Definition of the radian.',
    },
    {
      ask: 'The conversion formulas are…',
      choices: [
        {label: '1 rad = 180/π degrees, and 1° = π/180 radians', ok: true},
        {label: '1 rad = π/180 degrees', ok: false},
        {label: 'Degrees and radians are identical', ok: false},
      ],
      caption: 'Full turn: 360° = 2π rad.',
    },
    {
      ask: 'On a circle of radius r, if the central angle is θ radians, the arc length is…',
      choices: [
        {label: 's = rθ', ok: true},
        {label: 's = θ/r', ok: false},
        {label: 's = 2πr always', ok: false},
      ],
      caption: 'θ/2π = s/(2πr) ⇒ s = rθ.',
    },
  ],
};

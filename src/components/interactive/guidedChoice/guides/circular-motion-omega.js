/** Guided: circular motion ω and α. */

export default {
  title: 'Circular motion — ω and α',
  lead: 'θ = f(t); ω = dθ/dt; α = dω/dt.',
  steps: [
    {
      ask: 'Angular velocity ω is…',
      choices: [
        {label: 'dθ/dt (radians per unit time)', ok: true},
        {label: 'ds/dt along a straight line', ok: false},
        {label: 'Always 2π', ok: false},
      ],
      caption: 'θ is the central angle in radians.',
    },
    {
      ask: 'Angular acceleration α is…',
      choices: [
        {label: 'dω/dt = d²θ/dt²', ok: true},
        {label: 'dθ/dt', ok: false},
        {label: 'r cos θ', ok: false},
      ],
      caption: 'Rate of change of angular velocity.',
    },
    {
      ask: 'Cartesian coordinates on a circle of radius r are…',
      choices: [
        {label: 'x = r cos θ, y = r sin θ', ok: true},
        {label: 'x = θ, y = r', ok: false},
        {label: 'x = r θ, y = 0', ok: false},
      ],
      caption: 'Same as polar/rectangular from Ch. 16.',
    },
  ],
};

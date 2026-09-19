/** Guided: velocity and acceleration from s(t). */

export default {
  title: 'Rectilinear motion — v and a',
  lead: 'v = ds/dt; speed = |v|; a = dv/dt = d²s/dt².',
  steps: [
    {
      ask: 'Instantaneous velocity is…',
      choices: [
        {label: 'v = lim (Δs/Δt) = ds/dt = f′(t)', ok: true},
        {label: 'Always positive', ok: false},
        {label: 'The same as speed', ok: false},
      ],
      caption: 'Signed rate of change of position.',
    },
    {
      ask: 'If v < 0 on an interval, the object is…',
      choices: [
        {label: 'Moving toward decreasing s', ok: true},
        {label: 'Standing still', ok: false},
        {label: 'Speeding up always', ok: false},
      ],
      caption: 'Sign of v = direction along the line.',
    },
    {
      ask: 'A change of direction requires…',
      choices: [
        {
          label: 'v = 0 at a relative extremum of s (not every critical point)',
          ok: true,
        },
        {label: 'a = 0', ok: false},
        {label: 'v ≠ 0', ok: false},
      ],
      caption: 's = t³ at 0 has v=0 but no turn.',
    },
  ],
};

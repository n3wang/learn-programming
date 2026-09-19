/** Guided: conical funnel / similar triangles. */

export default {
  title: 'Conical funnel related rates',
  lead: 'Similar triangles → express V in one variable → dV/dt.',
  steps: [
    {
      ask: 'For a funnel with R=4, H=8, water radius r and height h satisfy…',
      choices: [
        {label: 'r = h/2', ok: true},
        {label: 'r = 2h', ok: false},
        {label: 'r = h', ok: false},
      ],
      caption: 'r/4 = h/8.',
    },
    {
      ask: 'Then V = (1/3)πr²h becomes…',
      choices: [
        {label: 'V = (1/12)π h³', ok: true},
        {label: 'V = (1/3)π h³', ok: false},
        {label: 'V = 4πh', ok: false},
      ],
      caption: 'Substitute r = h/2.',
    },
    {
      ask: 'If dV/dt = −1 and h = 6, dh/dt equals…',
      choices: [
        {label: '−4/(π·36) = −1/(9π)', ok: true},
        {label: '−1', ok: false},
        {label: '+1/(9π)', ok: false},
      ],
      caption: 'dV/dt = (1/4)πh² dh/dt.',
    },
  ],
};

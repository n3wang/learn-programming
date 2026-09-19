/** Guided: balloon / sphere related rates. */

export default {
  title: 'Sphere — volume and surface rates',
  lead: 'V = (4/3)πr³ and S = 4πr²; link dV/dt to dS/dt.',
  steps: [
    {
      ask: 'From V = (4/3)πr³, dV/dt equals…',
      choices: [
        {label: '4πr² dr/dt', ok: true},
        {label: '4πr dr/dt', ok: false},
        {label: '4/3 πr²', ok: false},
      ],
      caption: 'Chain Rule.',
    },
    {
      ask: 'If dV/dt = −2 and r = 12, then dr/dt equals…',
      choices: [
        {label: '−1/(2π · 144)', ok: true},
        {label: '−2', ok: false},
        {label: '+1/(2πr²)', ok: false},
      ],
      caption: '−2 = 4πr² dr/dt.',
    },
    {
      ask: 'Then dS/dt at r=12 equals…',
      choices: [
        {label: '−1/3 ft²/min (shrinking)', ok: true},
        {label: '+1/3', ok: false},
        {label: '−2', ok: false},
      ],
      caption: 'dS/dt = 8πr dr/dt = −4/r.',
    },
  ],
};

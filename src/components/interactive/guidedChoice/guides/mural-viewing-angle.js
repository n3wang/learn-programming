/** Guided: mural viewing-angle maximization. */

export default {
  title: 'Mural — maximize subtended angle',
  lead: 'θ = arctan(12x/(x²+108)); set θ′ = 0.',
  steps: [
    {
      ask: 'With mural from 6 ft to 18 ft above eye level, tan θ equals…',
      choices: [
        {
          label: '(18/x − 6/x) / (1 + (18/x)(6/x)) = 12x/(x²+108)',
          ok: true,
        },
        {label: '12/x only', ok: false},
        {label: '18/x − 6/x', ok: false},
      ],
      caption: 'tan(u−v) with u=θ+φ, v=φ.',
    },
    {
      ask: 'θ = arctan(12x/(x²+108)); critical points from θ′=0 occur when…',
      choices: [
        {label: '−x² + 108 = 0 ⇒ x = 6√3', ok: true},
        {label: 'x = 0', ok: false},
        {label: 'x = 12', ok: false},
      ],
      caption: 'Numerator of θ′ has factor (−x²+108).',
    },
    {
      ask: 'The first-derivative test says this critical number is a…',
      choices: [
        {label: 'Relative maximum (~10.4 ft from the wall)', ok: true},
        {label: 'Relative minimum', ok: false},
        {label: 'Inflection only', ok: false},
      ],
      caption: 'Most favorable viewing distance.',
    },
  ],
};

/** Guided: second derivative test. */

export default {
  title: 'Second derivative test',
  lead: 'When f′(c)=0 and f″(c) exists and is nonzero, read max vs min from the sign of f″(c).',
  steps: [
    {
      ask: 'If f′(c)=0 and f″(c)<0, then at c…',
      choices: [
        {label: 'f has a relative maximum (graph is concave down)', ok: true},
        {label: 'f has a relative minimum', ok: false},
        {label: 'The test is inconclusive', ok: false},
      ],
      caption: 'Negative second derivative ⇒ local peak.',
    },
    {
      ask: 'If f′(c)=0 and f″(c)>0, then…',
      choices: [
        {label: 'f has a relative minimum', ok: true},
        {label: 'f has a relative maximum', ok: false},
        {label: 'f′ is undefined', ok: false},
      ],
      caption: 'Positive second derivative ⇒ local valley.',
    },
    {
      ask: 'If f″(c)=0 (as for x⁴, −x⁴, and x³ at 0)…',
      choices: [
        {label: 'The second-derivative test gives no information — try the first-derivative test', ok: true},
        {label: 'There is always a maximum', ok: false},
        {label: 'c is not critical', ok: false},
      ],
      caption: 'All three behaviors are possible when f″(c)=0.',
    },
  ],
};

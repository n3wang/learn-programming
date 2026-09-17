/** Guided: inflection points vs f″=0. */

export default {
  title: 'Inflection points',
  lead: 'Concavity must change; f″=0 is necessary (when continuous) but not sufficient.',
  steps: [
    {
      ask: 'An inflection point is where…',
      choices: [
        {label: 'Concavity changes (up on one side, down on the other)', ok: true},
        {label: 'f′=0 always', ok: false},
        {label: 'f has a relative max', ok: false},
      ],
      caption: 'Cup becomes cap (or vice versa) across the point.',
    },
    {
      ask: 'If f″ is continuous near x₀ and there is an inflection at x₀, then…',
      choices: [
        {label: 'f″(x₀)=0 (Theorem 15.2)', ok: true},
        {label: 'f″(x₀)>0', ok: false},
        {label: 'f″ cannot exist', ok: false},
      ],
      caption: 'A continuous function that changes sign must hit zero.',
    },
    {
      ask: 'For f(x)=x⁴, f″(0)=0. Is there an inflection at 0?',
      choices: [
        {label: 'No — f″≥0 everywhere, so concavity never changes', ok: true},
        {label: 'Yes, because f″(0)=0', ok: false},
        {label: 'Yes, because f′(0)=0', ok: false},
      ],
      caption: 'f″=0 is not enough; check the sign change.',
    },
  ],
};

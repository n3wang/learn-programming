/** Guided: curve-sketching checklist order. */

export default {
  title: 'Curve-sketching checklist',
  lead: 'A practical order: derivatives → extrema → mono → concavity → asymptotes → intercepts → special points.',
  steps: [
    {
      ask: 'After computing y′ (and y″ if handy), next you typically…',
      choices: [
        {label: 'Find critical numbers and classify relative extrema', ok: true},
        {label: 'Only look for oblique asymptotes', ok: false},
        {label: 'Ignore y′ and jump to intercepts', ok: false},
      ],
      caption: 'Critical numbers drive max/min and mono intervals.',
    },
    {
      ask: 'To locate candidate inflection points you…',
      choices: [
        {
          label: 'Solve y″=0 (or where y″ undefined) and check a sign change of y″',
          ok: true,
        },
        {label: 'Only solve y′=0', ok: false},
        {label: 'Require y″>0 everywhere', ok: false},
      ],
      caption: 'Sign change is the definition; y″=0 alone is not enough.',
    },
    {
      ask: 'A cusp (like at 0 on y=√|x|) is where…',
      choices: [
        {
          label: 'y′→+∞ from both sides or y′→−∞ from both sides',
          ok: true,
        },
        {label: 'y′ approaches different finite limits from left and right (that is a corner)', ok: false},
        {label: 'There is always a horizontal asymptote', ok: false},
      ],
      caption: 'Corners: one-sided derivatives disagree finitely (e.g. |x| at 0).',
    },
  ],
};

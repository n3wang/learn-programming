/** Guided: tabular absolute extrema on [a,b]. */

export default {
  title: 'Absolute max/min on a closed interval',
  lead: 'Extreme Value Theorem + candidates = endpoints ∪ interior critical numbers.',
  steps: [
    {
      ask: 'On a closed interval [a,b], continuous f must…',
      choices: [
        {label: 'Attain absolute max and min values (Extreme Value Theorem)', ok: true},
        {label: 'Have f′=0 everywhere', ok: false},
        {label: 'Be a polynomial', ok: false},
      ],
      caption: 'Existence is guaranteed; the table finds where.',
    },
    {
      ask: 'The candidate list is…',
      choices: [
        {label: 'Endpoints a,b together with critical numbers of f in (a,b)', ok: true},
        {label: 'Only points where f″=0', ok: false},
        {label: 'Only rational roots', ok: false},
      ],
      caption: 'Interior extrema of a differentiable f occur where f′=0.',
    },
    {
      ask: 'How do you finish?',
      choices: [
        {label: 'Evaluate f at every candidate; largest value = abs max, smallest = abs min', ok: true},
        {label: 'Pick the midpoint only', ok: false},
        {label: 'Ignore the endpoints', ok: false},
      ],
      caption: 'Book example: on [0,2], candidates 0,1,2 → max 4 at 2, min 1 at 1.',
    },
  ],
};

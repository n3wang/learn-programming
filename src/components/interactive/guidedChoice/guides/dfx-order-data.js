/** Guided: cleaning order data into unconstrained demand. */

export default {
  title: 'Clean the order book',
  lead: 'Decide how each order record affects demand.',
  steps: [
    {
      ask: 'A customer placed the same order three times during a shortage.',
      choices: [
        {label: 'Count it once — remove duplicates', ok: true},
        {label: 'Count all three', ok: false},
        {label: 'Count none', ok: false},
      ],
      caption: 'Keep an open-order backlog and confirm expected dates.',
    },
    {
      ask: 'An order was cancelled because delivery would be 5 weeks late.',
      choices: [
        {label: 'Keep it as demand at the requested date; log reason “delay too long”', ok: true},
        {label: 'Delete it', ok: false},
        {label: 'Move it to the cancellation date', ok: false},
      ],
      caption: 'It was real demand that supply failed to meet.',
    },
    {
      ask: 'A customer wanted item A, accepted item B instead.',
      choices: [
        {label: 'Credit the demand to A; B’s sale was a substitution', ok: true},
        {label: 'Credit it to B', ok: false},
        {label: 'Ignore it', ok: false},
      ],
      caption: 'Let the system propose substitutes and log the original request.',
    },
  ],
};

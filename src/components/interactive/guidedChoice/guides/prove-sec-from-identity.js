/** Guided: alternate proof of sec′ via differentiating tan²+1=sec². */

export default {
  title: 'Proof — sec′ from tan²+1=sec²',
  lead: 'Differentiate both sides of (17.9) with the Chain Rule.',
  steps: [
    {
      ask: 'Differentiating tan²x + 1 = sec²x gives…',
      choices: [
        {
          label: '2 tan x · sec²x = 2 sec x · Dₓ(sec x)',
          ok: true,
        },
        {label: '2 tan x = 2 sec x', ok: false},
        {label: 'sec²x = tan x', ok: false},
      ],
      caption: 'Chain on each side; D(tan)=sec².',
    },
    {
      ask: 'Canceling 2 sec x (where sec≠0) yields…',
      choices: [
        {label: 'Dₓ(sec x) = tan x sec x', ok: true},
        {label: 'Dₓ(sec x) = sec²x', ok: false},
        {label: 'Dₓ(sec x) = −csc²x', ok: false},
      ],
      caption: 'Same formula as the reciprocal-rule proof.',
    },
  ],
};

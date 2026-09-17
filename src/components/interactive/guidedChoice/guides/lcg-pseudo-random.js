/** Linear congruent generator — pick the recurrence and normalization. */

export default {
  title: 'Pseudorandom sequences',
  lead:
    'A computer is deterministic. Pick the LCG update and the $[0,1)$ map among lookalikes.',
  steps: [
    {
      ask: 'The linear congruent generator advances the integer state by…',
      choices: [
        {
          label: '$\\displaystyle r_{i+1}=(a r_i+c)\\bmod M$',
          ok: true,
        },
        {
          label: '$\\displaystyle r_{i+1}=a^{r_i}\\bmod c$',
          ok: false,
        },
        {
          label: '$\\displaystyle r_{i+1}=\\sin(r_i)$',
          ok: false,
        },
      ],
      caption:
        'Knowing enough prior $r$ values determines the next one exactly — hence “pseudo.”',
    },
    {
      ask: 'A common map onto the unit interval is…',
      choices: [
        {
          label: '$\\displaystyle x_i=\\dfrac{r_i}{M}\\in[0,1)$',
          ok: true,
        },
        {
          label: '$\\displaystyle x_i=r_i\\,M$ (unbounded)',
          ok: false,
        },
        {
          label: '$\\displaystyle x_i=M/r_i$',
          ok: false,
        },
      ],
      caption:
        'Once any integer repeats, the whole cycle repeats. Large $M$ only hides the period.',
    },
    {
      ask: 'A successive-pair scatter that shows a clear lattice means you should treat the stream as…',
      choices: [
        {
          label:
            '$\\displaystyle (r_i,r_{i+1})$ correlated $\\Rightarrow$ reject for serious Monte Carlo',
          ok: true,
        },
        {
          label:
            '$\\displaystyle (r_i,r_{i+1})$ correlated $\\Rightarrow$ always safe to use',
          ok: false,
        },
        {
          label:
            '$\\displaystyle (r_i,r_{i+1})$ lattice $\\Rightarrow$ divide by $M$ twice to fix it',
          ok: false,
        },
      ],
      caption:
        'Your visual cortex is a cheap correlation detector. Prefer a vetted library generator, then still plot.',
    },
  ],
};

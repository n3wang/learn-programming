/** Pseudorandom vs truly random; why LCG scatterplots matter. */

export default {
  title: 'Pseudorandom sequences',
  lead: 'A computer is deterministic, so its “random” stream is a long cycle of pseudorandom numbers. What should you check before trusting it?',
  steps: [
    {
      caption: 'Uniform means every value in an interval is equally likely. Random means successive draws are uncorrelated. You can have either property without the other.',
    },
    {
      ask: 'The linear congruent update $r_{i+1}=(a r_i+c)\\bmod M$ is called pseudorandom because…',
      choices: [
        {label: 'knowing enough prior $r$ values determines the next one exactly', ok: true},
        {label: 'it only produces irrational numbers', ok: false},
        {label: 'the sequence never repeats', ok: false},
      ],
      caption: 'Once an integer repeats, the whole cycle repeats. Large $M$ only hides the period.',
    },
    {
      ask: 'A successive-pair plot $(r_i,r_{i+1})$ shows a clear lattice. You should…',
      choices: [
        {label: 'refuse the generator for serious Monte Carlo work', ok: true},
        {label: 'connect the points with lines to hide the pattern', ok: false},
        {label: 'divide by $M$ twice to fix it', ok: false},
      ],
      caption: 'Your visual cortex is a cheap correlation detector. Lattice ⇒ correlations ⇒ not for production.',
    },
  ],
};

/** Recurrence vs factorial, and |term/sum| as a stop rule. */

export default {
  title: 'Summing sine',
  lead: 'Compute $\\sin x$ from its Taylor series to a relative error of $10^{-8}$, without looking up $\\sin x$.',
  steps: [
    {
      caption: 'The infinite sum is exact mathematics. A computer needs a finite $N$ and a rule for when $N$ is enough.',
    },
    {
      ask: 'A workable stop rule that does not peek at a table is…',
      choices: [
        {label: 'halt when $|t_n / S_n|$ is below the tolerance (last term $\\approx$ leftover)', ok: true},
        {label: 'halt when the sum equals `math.sin(x)`', ok: false},
        {label: 'always use $N=5$, independent of $x$', ok: false},
      ],
      caption: 'If round-off is not yet in charge, the next unused term is a decent proxy for the truncation error.',
    },
    {
      ask: 'The next term should be built by…',
      choices: [
        {label: '$t_n = -x^{2}/((2n-1)(2n-2))\\, t_{n-1}$ (one multiply per step)', ok: true},
        {label: 'computing $x^{2n-1}$ and $(2n-1)!$ separately, then dividing', ok: false},
        {label: 'calling `math.factorial` for every $n$', ok: false},
      ],
      caption: 'Powers and factorials overflow individually and are expensive. The ratio of neighbouring terms is a short multiply.',
    },
  ],
};

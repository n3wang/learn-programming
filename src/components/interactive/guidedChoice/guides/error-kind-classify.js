/** Classify which numerical-error family a story belongs to. */

export default {
  title: 'Which error?',
  lead: 'A simulation of $\\sin x$ keeps $N=3$ terms at $x=8$, on a machine with 4 decimal digits, overnight.',
  steps: [
    {
      caption: 'The truncated sine series at $x=8$ with only three terms is nowhere near $\\sin 8$.',
    },
    {
      ask: 'That leftover tail is mainly…',
      choices: [
        {label: 'approximation (algorithmic) error', ok: true},
        {label: 'round-off from 4-digit storage', ok: false},
        {label: 'a random hardware glitch', ok: false},
      ],
      caption: 'The mathematics was replaced by a short sum. That is algorithmic error — and here $N \\not\\gg x$, so the tail is huge.',
      panel: '$\\mathcal{E}(8,3)$ dominates long before 4-digit round-off matters.',
    },
    {
      ask: 'The same code then does $2(1/3)-2/3$ a million times on 4-digit floats. The growing bias is…',
      choices: [
        {label: 'round-off error accumulating with step count', ok: true},
        {label: 'approximation error from a truncated series', ok: false},
        {label: 'cosmic-ray bit flips', ok: false},
      ],
      caption: 'Each step is a rounding artifact of a short mantissa. Repeating it turns a $10^{-4}$ residual into something you cannot ignore.',
    },
    {
      ask: 'The overnight job disagrees with a second run of the identical binary. That points to…',
      choices: [
        {label: 'random error (uncontrolled events over long wall-clock time)', ok: true},
        {label: 'the Taylor remainder, which is deterministic', ok: false},
        {label: 'always-the-same 4-digit rounding', ok: false},
      ],
      caption: 'Truncation and round-off are reproducible on the same inputs. A second run that differs is the signature of rare, uncontrolled events whose chance grows with running time.',
    },
  ],
};

/** Guided: free-fall peak and impact. */

export default {
  title: 'Free-fall peak and impact',
  lead: 'Peak when v=0; impact when s returns to ground.',
  steps: [
    {
      ask: 'Maximum height occurs when…',
      choices: [
        {label: 'v = 0 (and a < 0 confirms a max)', ok: true},
        {label: 'a = 0', ok: false},
        {label: 's = 0', ok: false},
      ],
      caption: 'Turnaround at the top.',
    },
    {
      ask: 'For s = 112t − 16t², peak time is…',
      choices: [
        {label: 't = 112/32 = 3.5 s', ok: true},
        {label: 't = 112', ok: false},
        {label: 't = 16', ok: false},
      ],
      caption: 'v = 112 − 32t = 0.',
    },
    {
      ask: 'A rock dropped from height H with v₀=0 hits when…',
      choices: [
        {label: 'H − 16t² = 0 ⇒ t = √(H/16) (t≥0)', ok: true},
        {label: 'Always t = H', ok: false},
        {label: 'v = +32t', ok: false},
      ],
      caption: 's = H − 16t² with upward +.',
    },
  ],
};

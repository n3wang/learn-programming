/** Guided: gold leasing and forward pricing. */

export default {
  title: 'Price the gold forward',
  lead: 'Spot 1,300; cash rate 2%; lease rate 0.25%; 182 days.',
  steps: [
    {
      ask: 'Forward price?',
      choices: [
        {label: '≈ 1,311.50', ok: true},
        {label: '≈ 1,314.80', ok: false},
        {label: '1,300 — forwards equal spot', ok: false},
      ],
      caption: '1,300 + 13.14 deposit interest − 1.64 lease cost.',
    },
    {
      ask: 'Quoted as a swap (GOFO) rate?',
      choices: [
        {label: '≈ 1.75% p.a. (cash − lease)', ok: true},
        {label: '2.25%', ok: false},
        {label: '0.25%', ok: false},
      ],
      caption: '(1,311.50/1,300 − 1) × 360/182 ≈ 1.75%.',
    },
    {
      ask: 'Cash rate 3%, swap rate 3.4%. Implied lease rate — and what does it signal?',
      choices: [
        {label: '−0.4%: heavy demand to borrow USD against gold', ok: true},
        {label: '+6.4%: gold is scarce', ok: false},
        {label: '+0.4%: normal market', ok: false},
      ],
      caption: 'Lease = cash − swap; negative implies a USD funding premium, like the FX basis.',
    },
  ],
};

/** Guided: amplitude, period, frequency of A sin(bx). */

export default {
  title: 'Amplitude, period, frequency',
  lead: 'How constants reshape sin and cos waves.',
  steps: [
    {
      ask: 'For y = A sin(bx) with b>0, the period is…',
      choices: [
        {label: '2π/b', ok: true},
        {label: '2π b', ok: false},
        {label: '|A|', ok: false},
      ],
      caption: 'One full cycle when bx advances by 2π.',
    },
    {
      ask: 'The frequency (waves per length 2π) equals…',
      choices: [
        {label: 'b', ok: true},
        {label: '2π/b', ok: false},
        {label: '|A|', ok: false},
      ],
      caption: 'pf = 2π ⇒ f = 2π/p = b.',
    },
    {
      ask: 'The amplitude (max |y|) is…',
      choices: [
        {label: '|A|', ok: true},
        {label: 'b', ok: false},
        {label: '2π', ok: false},
      ],
      caption: 'Vertical stretch by |A|; period unchanged by A.',
    },
  ],
};

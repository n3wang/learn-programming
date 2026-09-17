/** Guided: concavity from the second derivative. */

export default {
  title: 'Concavity from f″',
  lead: 'Read cup vs cap from the sign of the second derivative (Theorem 15.1).',
  steps: [
    {
      ask: 'If $f\'\'(x)>0$ on $(a,b)$, the graph on that interval is…',
      choices: [
        {label: 'Concave upward (cup — lies above its tangents)', ok: true},
        {label: 'Concave downward (cap)', ok: false},
        {label: 'Always decreasing', ok: false},
      ],
      caption: 'Positive $f\'\'$ means $f\'$ is increasing — slopes steepen upward.',
    },
    {
      ask: 'If $f\'\'(x)<0$ on $(a,b)$, the graph is…',
      choices: [
        {label: 'Concave downward (cap — lies below its tangents)', ok: true},
        {label: 'Concave upward', ok: false},
        {label: 'A straight line', ok: false},
      ],
      caption: 'Negative $f\'\'$ ⇒ slopes decrease — a local “hill” shape.',
    },
    {
      ask: 'For the upper semicircle $y=\\sqrt{1-x^{2}}$, one finds $y\'\'<0$. Conclusion?',
      choices: [
        {label: 'The arc is concave downward everywhere it is defined (as expected for a circle cap)', ok: true},
        {label: 'It must be concave upward', ok: false},
        {label: '$y\'\'$ cannot be negative for a circle', ok: false},
      ],
      caption: 'Matches the geometry of the upper unit circle.',
    },
  ],
};

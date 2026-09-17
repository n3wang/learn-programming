/** Guided: even/odd and graph symmetry. */

export default {
  title: 'Even and odd functions',
  lead: 'Parity of f is exactly symmetry of its graph.',
  steps: [
    {
      ask: 'f is even means f(−x)=f(x). The graph is symmetric with respect to…',
      choices: [
        {label: 'The y-axis', ok: true},
        {label: 'The x-axis', ok: false},
        {label: 'The origin only', ok: false},
      ],
      caption: '(x,y) on the graph ⇒ (−x,y) on the graph.',
    },
    {
      ask: 'f is odd means f(−x)=−f(x). The graph is symmetric with respect to…',
      choices: [
        {label: 'The origin', ok: true},
        {label: 'The y-axis', ok: false},
        {label: 'The line y=x', ok: false},
      ],
      caption: '(x,y) ⇒ (−x,−y).',
    },
    {
      ask: 'Graphs of a one-to-one f and its inverse f⁻¹ are symmetric with respect to…',
      choices: [
        {label: 'The line y=x (Theorem 15.3)', ok: true},
        {label: 'The y-axis', ok: false},
        {label: 'The origin', ok: false},
      ],
      caption: '(a,b) on y=f(x) ↔ (b,a) on y=f⁻¹(x).',
    },
  ],
};

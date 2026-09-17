/** Guided proof: graph symmetry ⇒ even/odd. */

export default {
  title: 'Proof — symmetry implies even/odd',
  lead: 'y-axis symmetry ⇒ even; origin symmetry ⇒ odd.',
  steps: [
    {
      ask: 'Assume the graph is symmetric in the y-axis and $(x,f(x))$ lies on it. Then also on the graph is…',
      choices: [
        {label: '$(-x,f(x))$', ok: true},
        {label: '$(-x,-f(x))$', ok: false},
        {label: '$(x,-f(x))$', ok: false},
      ],
      caption: 'Reflection in the y-axis keeps the y-coordinate.',
    },
    {
      ask: 'Therefore $f(-x)=\\ldots$, so $f$ is…',
      choices: [
        {label: '$f(-x)=f(x)$ — even', ok: true},
        {label: '$f(-x)=-f(x)$ — odd', ok: false},
        {label: 'Neither', ok: false},
      ],
      caption: 'That is the definition of an even function.',
    },
    {
      ask: 'If instead the graph is symmetric in the origin, $(x,f(x))$ forces…',
      choices: [
        {label: '$(-x,-f(x))$ on the graph ⇒ $f(-x)=-f(x)$ (odd)', ok: true},
        {label: '$(-x,f(x))$ only', ok: false},
        {label: '$f$ constant', ok: false},
      ],
      caption: 'Origin symmetry flips both signs.',
    },
  ],
};

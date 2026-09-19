/** Guided: differential df = f′(x) dx. */

export default {
  title: 'The differential',
  lead: 'df = f′(x) Δx; since dx = Δx we write df = f′(x) dx.',
  steps: [
    {
      ask: 'By definition, df equals…',
      choices: [
        {label: 'f′(x) Δx', ok: true},
        {label: 'f(x+Δx) − f(x)', ok: false},
        {label: 'f′(x)/Δx', ok: false},
      ],
      caption: 'Δy is the true change; df is the tangent-rise approximation.',
    },
    {
      ask: 'For f(x)=x we have dx = …',
      choices: [
        {label: 'Δx', ok: true},
        {label: '0', ok: false},
        {label: '1', ok: false},
      ],
      caption: 'That identity justifies writing dy/dx for the derivative.',
    },
    {
      ask: 'd(uv) expands as…',
      choices: [
        {label: 'u dv + v du', ok: true},
        {label: 'du · dv', ok: false},
        {label: 'u/v du', ok: false},
      ],
      caption: 'Same product rule as for derivatives.',
    },
  ],
};

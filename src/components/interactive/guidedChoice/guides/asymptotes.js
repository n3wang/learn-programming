/** Guided: vertical and horizontal asymptotes. */

export default {
  title: 'Asymptotes',
  lead: 'Vertical lines where f blows up; horizontal lines approached as x→±∞.',
  steps: [
    {
      ask: 'x=x₀ is a vertical asymptote when…',
      choices: [
        {
          label: 'f(x)→±∞ as x→x₀ from at least one side',
          ok: true,
        },
        {label: 'f(x₀)=0', ok: false},
        {label: 'f′(x₀)=0', ok: false},
      ],
      caption: 'For g/h continuous: typically h(x₀)=0 and g(x₀)≠0.',
    },
    {
      ask: 'y=y₀ is a horizontal asymptote when…',
      choices: [
        {label: 'lim_{x→+∞} f(x)=y₀ or lim_{x→−∞} f(x)=y₀', ok: true},
        {label: 'f(y₀)=0', ok: false},
        {label: 'f″(y₀)=0', ok: false},
      ],
      caption: 'The graph levels off far left and/or far right.',
    },
    {
      ask: 'For f(x)=(x+4)/(x−3), the horizontal asymptote is…',
      choices: [
        {label: 'y=1 (degrees match; leading coeff ratio)', ok: true},
        {label: 'y=0', ok: false},
        {label: 'x=1', ok: false},
      ],
      caption: 'Vertical asymptote at x=3; horizontal at y=1.',
    },
  ],
};

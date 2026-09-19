/** Guided: find dy for composite / quotient / trig. */

export default {
  title: 'Computing dy',
  lead: 'Differentiate formally, then multiply by dx (or write d(…)).',
  steps: [
    {
      ask: 'For y = (2x³+5)^{3/2}, the chain factor from the outside power is…',
      choices: [
        {label: '(3/2)(2x³+5)^{1/2}', ok: true},
        {label: '3(2x³+5)^{1/2}', ok: false},
        {label: '(2x³+5)^{3/2}', ok: false},
      ],
      caption: 'Then multiply by d(2x³+5) = 6x² dx.',
    },
    {
      ask: 'For y = cos²(2x)+sin(3x), after simplifying, dy/dx equals…',
      choices: [
        {label: '−2 sin(4x) + 3 cos(3x)', ok: true},
        {label: '−4 sin(2x) only', ok: false},
        {label: '2 cos(2x) + 3 cos(3x)', ok: false},
      ],
      caption: 'Use 2 sin θ cos θ = sin(2θ) with θ = 2x.',
    },
  ],
};

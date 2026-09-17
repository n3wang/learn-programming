/** Guided proof: relative extremum ⇒ f′=0 (Thm 13.1). */

export default {
  title: 'Proof — Theorem 13.1 (relative max ⇒ f′=0)',
  lead: 'Walk the one-sided difference-quotient argument for a relative maximum.',
  steps: [
    {
      ask: 'Near a relative maximum, for small nonzero Δx we have…',
      choices: [
        {
          label: '$f(x_0+\\Delta x)\\le f(x_0)$, so the numerator $f(x_0+\\Delta x)-f(x_0)\\le 0$',
          ok: true,
        },
        {
          label: '$f(x_0+\\Delta x)>f(x_0)$ always',
          ok: false,
        },
        {
          label: '$f\'(x_0)$ cannot exist',
          ok: false,
        },
      ],
      caption: 'Local max means nearby values are no larger.',
    },
    {
      ask: 'When Δx<0, dividing a ≤0 numerator by a negative Δx makes the difference quotient…',
      choices: [
        {label: '$\\ge 0$, so the left-hand limit of the quotient is $\\ge 0$', ok: true},
        {label: 'Always negative', ok: false},
        {label: 'Undefined forever', ok: false},
      ],
      caption: 'Negative over negative is nonnegative.',
    },
    {
      ask: 'When Δx>0, the same numerator over positive Δx makes the quotient…',
      choices: [
        {label: '$\\le 0$, so the right-hand limit is $\\le 0$', ok: true},
        {label: 'Forced to be $+\\infty$', ok: false},
        {label: 'Equal to $f(x_0)$', ok: false},
      ],
      caption: 'Left limit $\\ge 0$ and right limit $\\le 0$ force $f\'(x_0)=0$.',
    },
  ],
};

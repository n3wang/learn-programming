/** Closed specular orbit when φ/π is rational — pick the equation. */

export default {
  title: 'Closing a specular orbit',
  lead:
    'Circular mirror, step $2\\phi$ each bounce. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'Each bounce advances the hit angle by…',
      choices: [
        {label: '$\\theta_{\\mathrm{new}}=\\theta_{\\mathrm{old}}+2\\phi$', ok: true},
        {label: '$\\theta_{\\mathrm{new}}=\\theta_{\\mathrm{old}}+\\phi$', ok: false},
        {label: '$\\theta_{\\mathrm{new}}=\\theta_{\\mathrm{old}}+2\\pi$', ok: false},
      ],
      caption: 'Angles on a circle are mod $2\\pi$.',
    },
    {
      ask: 'After $m$ bounces the advance is $2m\\phi$. The path closes when…',
      choices: [
        {
          label: '$2m\\phi=2\\pi n$ for integers $m,n$',
          ok: true,
        },
        {
          label: '$2m\\phi=\\pi n$ for integers $m,n$',
          ok: false,
        },
        {
          label: '$m\\phi=2\\pi$ only (fixed $n=1$)',
          ok: false,
        },
      ],
      caption: 'Divide by $2\\pi$: equivalent to a rational multiple of $\\pi$.',
    },
    {
      ask: 'That closing condition is the same as…',
      choices: [
        {
          label: '$\\displaystyle\\frac{\\phi}{\\pi}=\\frac{n}{m}$ (rational)',
          ok: true,
        },
        {
          label: '$\\displaystyle\\frac{\\phi}{\\pi}=\\frac{m}{n}$ with $m\\phi$ irrational',
          ok: false,
        },
        {
          label: '$\\phi=\\pi$ only',
          ok: false,
        },
      ],
      caption:
        'Irrational $\\phi/\\pi$ densely fills chords. Four-decimal rounding each bounce injects angle error that grows with step count.',
    },
  ],
};
/** Correlation c(τ), C(ω), and A→|S|² — pick the equation. */

export default {
  title: 'Autocorrelation and power',
  lead:
    'Measured $y=s+n$. Walk the correlation → power-spectrum argument; pick the matching equation each step.',
  steps: [
    {
      ask: 'With means subtracted, the correlation of $y$ with $x$ at lag $\\tau$ is…',
      choices: [
        {
          label:
            '$\\displaystyle c(\\tau)=\\int_{-\\infty}^{+\\infty} y(t)\\,x(t+\\tau)\\,\\mathrm{d}t$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle c(\\tau)=\\int_{-\\infty}^{+\\infty} y(t)\\,x(t-\\tau)\\,\\mathrm{d}t$ only (sign of lag flipped forever)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle c(\\tau)=\\int_{-\\infty}^{+\\infty} y(t)\\,x(\\tau)\\,\\mathrm{d}t$ (no $t$ shift)',
          ok: false,
        },
      ],
      caption:
        'Large $|c|$ means the shapes line up. Next — the Fourier-space cousin of that integral.',
    },
    {
      ask: 'Correlation theorem: the transform of $c(\\tau)$ is proportional to…',
      choices: [
        {
          label: '$\\displaystyle C(\\omega)=\\sqrt{2\\pi}\\,Y(\\omega)\\,X(\\omega)$',
          ok: true,
        },
        {
          label: '$\\displaystyle C(\\omega)=\\sqrt{2\\pi}\\,\\bigl(Y(\\omega)+X(\\omega)\\bigr)$',
          ok: false,
        },
        {
          label: '$\\displaystyle C(\\omega)=Y(\\omega)/X(\\omega)$',
          ok: false,
        },
      ],
      caption:
        'Product of transforms ↔ correlation in time (cousin of the convolution theorem).',
    },
    {
      ask: 'Autocorrelate $y$ onto itself, then Fourier-transform. For pure signal $S$, which identity holds?',
      choices: [
        {
          label: '$\\displaystyle A(\\omega)=\\sqrt{2\\pi}\\,|S(\\omega)|^{2}$',
          ok: true,
        },
        {
          label: '$\\displaystyle A(\\omega)=\\sqrt{2\\pi}\\,S(\\omega)$ (no modulus)',
          ok: false,
        },
        {
          label: '$\\displaystyle A(\\omega)=|S(\\omega)|$ (no square, no $\\sqrt{2\\pi}$)',
          ok: false,
        },
      ],
      caption:
        'Uncorrelated noise drops from $A(\\tau)$: cross terms $s\\!\\cdot\\!n$ and $n\\!\\cdot\\!n$ at lag average toward zero. Use $A$ for $|S|^{2}$; use a low-pass filter for a cleaned time trace.',
    },
  ],
};

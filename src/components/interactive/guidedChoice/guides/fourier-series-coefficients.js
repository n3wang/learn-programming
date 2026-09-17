/** Fourier series: form, aₙ/bₙ integrals, sawtooth bₙ — pick the equation. */

export default {
  title: 'Fourier series coefficients',
  lead:
    'A period-$T$ signal has $\\omega=2\\pi/T$. At each step pick the matching equation (lookalikes included).',
  steps: [
    {
      ask: 'The real Fourier series for a period-$T$ signal $y(t)$ is…',
      choices: [
        {
          label:
            '$\\displaystyle y(t)=\\dfrac{a_0}{2}+\\sum_{n=1}^{\\infty}\\bigl(a_n\\cos n\\omega t+b_n\\sin n\\omega t\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y(t)=\\sum_{n=1}^{\\infty}\\bigl(a_n\\cos n\\omega t+b_n\\sin n\\omega t\\bigr)$ (no $a_0$)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle y(t)=\\dfrac{a_0}{2}+\\sum_{n=1}^{\\infty}a_n\\cos n\\omega t$ (no sines)',
          ok: false,
        },
      ],
      caption:
        'Power at bin $n$ scales as $a_n^{2}+b_n^{2}$. Next — isolate $(a_n,b_n)$ by orthogonality.',
    },
    {
      ask: 'Orthogonality over one period isolates the coefficients. Which projection is correct?',
      choices: [
        {
          label:
            '$\\displaystyle\\begin{pmatrix}a_n\\\\b_n\\end{pmatrix}=\\dfrac{2}{T}\\int_0^{T}\\begin{pmatrix}\\cos n\\omega t\\\\\\sin n\\omega t\\end{pmatrix}y(t)\\,\\mathrm{d}t$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\begin{pmatrix}a_n\\\\b_n\\end{pmatrix}=\\dfrac{1}{T}\\int_0^{T}\\begin{pmatrix}\\cos n\\omega t\\\\\\sin n\\omega t\\end{pmatrix}y(t)\\,\\mathrm{d}t$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\begin{pmatrix}a_n\\\\b_n\\end{pmatrix}=\\dfrac{2}{T}\\int_0^{T}\\begin{pmatrix}\\sin n\\omega t\\\\\\cos n\\omega t\\end{pmatrix}y(t)\\,\\mathrm{d}t$',
          ok: false,
        },
      ],
      caption:
        'Same least-squares idea as Chapter 6: the truncated series is the best trigonometric fit of that order.',
    },
    {
      ask: 'For the odd sawtooth $y(t)=t/(T/2)$ on $(-T/2,T/2)$, the sine coefficients are…',
      choices: [
        {
          label: '$\\displaystyle b_n=\\dfrac{2}{n\\pi}(-1)^{n+1}$',
          ok: true,
        },
        {
          label: '$\\displaystyle b_n=\\dfrac{2}{n\\pi}(-1)^{n}$',
          ok: false,
        },
        {
          label: '$\\displaystyle b_n=\\dfrac{1}{n\\pi}$ (no alternating sign)',
          ok: false,
        },
      ],
      caption:
        'Odd $\\times$ even integrand kills all $a_n$. At jumps, partial sums converge to the midpoint; nearby they overshoot (Gibbs).',
    },
  ],
};

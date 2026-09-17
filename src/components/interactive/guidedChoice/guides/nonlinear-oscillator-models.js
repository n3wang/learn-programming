/** Nonlinear oscillator force models — Newton law, soft F, power-law F. */

export default {
  title: 'Nonlinear oscillator models',
  lead:
    'Write Newton’s law, then read $F=-dV/dx$ for soft and power-law wells. Pick each equation.',
  steps: [
    {
      ask: 'Newton’s second law for one coordinate with spring force and optional drive is…',
      choices: [
        {
          label: '$\\displaystyle F_k+F_{\\mathrm{ext}}=m\\,\\ddot x$',
          ok: true,
        },
        {
          label: '$\\displaystyle F_k=m\\,\\dot x$ (first order only)',
          ok: false,
        },
        {
          label: '$\\displaystyle F_{\\mathrm{ext}}=kx$ with no mass',
          ok: false,
        },
      ],
      caption:
        'Here $F_k=-\\partial V/\\partial x$. External drive may be a hand, a motor, or zero.',
    },
    {
      ask: 'From the soft well $V\\approx\\tfrac12 k x^{2}(1-\\tfrac23\\alpha x)$, the restoring force is…',
      choices: [
        {
          label: '$\\displaystyle F=-kx(1-\\alpha x)$',
          ok: true,
        },
        {
          label: '$\\displaystyle F=+kx(1+\\alpha x)$',
          ok: false,
        },
        {
          label: '$\\displaystyle F=-k$ (independent of $x$)',
          ok: false,
        },
      ],
      caption:
        'For small $|x|$ recover $-kx$. If $x>1/\\alpha$, the factor $(1-\\alpha x)$ flips — unbound risk.',
    },
    {
      ask: 'For $V=k|x|^{p}/p$ with even $p$, the restoring force (odd power of $x$) is…',
      choices: [
        {
          label: '$\\displaystyle F=-k\\,x^{p-1}$',
          ok: true,
        },
        {
          label: '$\\displaystyle F=+k|x|^{p}$',
          ok: false,
        },
        {
          label: '$\\displaystyle F=-kx$ for every $p$',
          ok: false,
        },
      ],
      caption:
        'Only $p=2$ is harmonic (isochronous). Other even $p$: still periodic in a bound 1D well, but period depends on amplitude.',
    },
  ],
};

/** Viscous damping ODE and f₁ extension — equation picks. */

export default {
  title: 'Friction, damping, and driven $f_1$',
  lead:
    'Add viscous drag and maybe a drive. Pick the ODE and the dynamic-form acceleration equation.',
  steps: [
    {
      ask: 'The linear oscillator with viscous friction and external drive obeys…',
      choices: [
        {
          label:
            '$\\displaystyle m\\ddot x+b\\dot x+kx=F_{\\mathrm{ext}}(t)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle m\\ddot x-b\\dot x=kx$ (negative damping, undriven)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle b\\dot x=F_{\\mathrm{ext}}$ with no $m$ or $k$',
          ok: false,
        },
      ],
      caption:
        'Free regimes compare $b$ to $2m\\omega_0$ with $\\omega_0=\\sqrt{k/m}$: under / critical / over damped.',
    },
    {
      ask: 'Critical damping sits at…',
      choices: [
        {
          label: '$\\displaystyle b=2m\\omega_0$',
          ok: true,
        },
        {
          label: '$\\displaystyle b=m\\omega_0$',
          ok: false,
        },
        {
          label: '$\\displaystyle b=\\omega_0^{2}/m$',
          ok: false,
        },
      ],
      caption:
        'For $m=1$, $\\omega_0=1$, critical drag is $b=2$. Beat frequency under a near-resonant drive: $|\\omega-\\omega_0|/(2\\pi)$.',
    },
    {
      ask: 'In dynamic form, viscous drag and a harmonic drive extend the acceleration component to…',
      choices: [
        {
          label:
            '$\\displaystyle f_1=\\dfrac{-kx-bv+F_0\\cos(\\omega t)}{m}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle f_1=v$ only (drag ignored)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle f_1=\\dfrac{+bv-kx}{m}$ (drag sign flipped, no drive)',
          ok: false,
        },
      ],
      caption:
        'Still $f_0=v$. Nonlinear restoring forces warp the resonance curve once linear friction/drive is under control.',
    },
  ],
};

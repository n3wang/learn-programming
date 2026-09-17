/** Relative energy error as an ODE accuracy diagnostic — equation picks. */

export default {
  title: 'Energy precision for oscillators',
  lead:
    'A closed harmonic orbit should conserve $E$. Pick the diagnostic formulas among lookalikes.',
  steps: [
    {
      ask: 'For a harmonic oscillator the mechanical energy is…',
      choices: [
        {
          label:
            '$\\displaystyle E=\\tfrac12 m v^{2}+\\tfrac12 k x^{2}$',
          ok: true,
        },
        {
          label: '$\\displaystyle E=m v+k x$',
          ok: false,
        },
        {
          label: '$\\displaystyle E=\\tfrac12 m x^{2}-\\tfrac12 k v^{2}$',
          ok: false,
        },
      ],
      caption:
        'Record $E_0$ from the initial state. After integrating one period (or many), compare $E$ to $E_0$.',
    },
    {
      ask: 'The relative energy error used as a digits score is…',
      choices: [
        {
          label:
            '$\\displaystyle\\varepsilon_E=\\left|\\dfrac{E-E_0}{E_0}\\right|$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\varepsilon_E=E+E_0$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\varepsilon_E=\\mathrm{sign}(E-E_0)$ only',
          ok: false,
        },
      ],
      caption:
        'Tiny $\\varepsilon_E$ means the stepper is faithful on this scale (phase lag can still hide).',
    },
    {
      ask: 'A convenient matching-digits estimate is…',
      choices: [
        {
          label:
            '$\\displaystyle n_{\\mathrm{digits}}\\simeq-\\log_{10}\\varepsilon_E$',
          ok: true,
        },
        {
          label: '$\\displaystyle n_{\\mathrm{digits}}\\simeq+\\log_{10}\\varepsilon_E$',
          ok: false,
        },
        {
          label: '$\\displaystyle n_{\\mathrm{digits}}\\simeq\\varepsilon_E$',
          ok: false,
        },
      ],
      caption:
        'If $\\varepsilon_E\\sim 10^{-8}$, then $-\\log_{10}$ is about $8$. RK4 usually beats Euler at the same $h$.',
    },
  ],
};

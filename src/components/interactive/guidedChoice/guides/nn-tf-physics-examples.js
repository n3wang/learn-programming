/** Mass excess Δ, binding B, GradientTape ∂ℒ/∂x — pick the equation. */

export default {
  title: 'Physics checks for TF / sklearn',
  lead:
    'Nuclear and cosmology toys check that the ML stack’s arithmetic matches known formulas. At each step pick the matching equation among lookalikes.',
  steps: [
    {
      ask: 'Mass excess $\\Delta$ (MeV/$c^{2}$) from atomic mass $M$ in u and mass number $A$ is…',
      choices: [
        {
          label:
            '$\\displaystyle \\Delta=(M-A)\\times 931.494028\\,\\mathrm{MeV}/c^{2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\Delta=(A-M)\\times 931.494028\\,\\mathrm{MeV}/c^{2}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\Delta=(M-A)\\times 931.494028\\,\\mathrm{u}$ (no MeV conversion)',
          ok: false,
        },
      ],
      caption:
        'For $^1\\mathrm{H}$ with $M=1.007827032$, $\\Delta\\approx 7.2908\\,\\mathrm{MeV}/c^{2}$. Next — binding energy.',
    },
    {
      ask: 'Nuclear binding energy $B$ (rest energy locked in the mass defect) is…',
      choices: [
        {
          label:
            '$\\displaystyle B=\\bigl[Z\\,m({}^{1}\\mathrm{H})+N\\,m_{\\mathrm{n}}-M_{\\mathrm{nuc}}\\bigr]c^{2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle B=\\bigl[M_{\\mathrm{nuc}}-Z\\,m({}^{1}\\mathrm{H})-N\\,m_{\\mathrm{n}}\\bigr]c^{2}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle B=(M-A)\\times 931.494028$ (that is mass excess $\\Delta$, not $B$)',
          ok: false,
        },
      ],
      caption:
        'Plots usually show $B/A$ vs $A$. A sklearn poly fit to seven noisy points is pedagogy, not nuclear theory.',
    },
    {
      ask: 'With $z=mx+b$ and $\\mathcal{L}=(y-z)^{2}$, the GradientTape-style derivative $\\partial\\mathcal{L}/\\partial x$ is…',
      choices: [
        {
          label: '$\\displaystyle \\dfrac{\\partial\\mathcal{L}}{\\partial x}=2(y-z)(-m)$',
          ok: true,
        },
        {
          label: '$\\displaystyle \\dfrac{\\partial\\mathcal{L}}{\\partial x}=2(y-z)(+m)$',
          ok: false,
        },
        {
          label: '$\\displaystyle \\dfrac{\\partial\\mathcal{L}}{\\partial x}=2(y-z)$ (drop the chain through $z$)',
          ok: false,
        },
      ],
      caption:
        'Check: $m=1.5$, $b=2.2$, $x=0.5$, $y=1.8$ → $\\partial\\mathcal{L}/\\partial x=3.45$. Hubble training is the same MSE + SGD story on $v\\approx mr+b$.',
    },
  ],
};

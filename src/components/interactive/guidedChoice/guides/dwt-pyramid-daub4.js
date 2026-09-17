/** Dyadic DWT indices, reconstruction, Daub4 taps — pick the equation. */

export default {
  title: 'DWT pyramid and Daub4',
  lead:
    'With $N$ samples keep $N$ coeffs on a dyadic grid. Pick the matching formulas.',
  steps: [
    {
      ask: 'Dyadic DWT evaluates the CWT only on which scale/translate lattice?',
      choices: [
        {
          label:
            '$\\displaystyle s=2^{j},\\quad \\tau=k\\,2^{j}\\quad\\Rightarrow\\quad \\psi_{j,k}(t)=\\dfrac{\\Psi(t/2^{j}-k)}{\\sqrt{2^{j}}}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle s=j,\\quad \\tau=k\\quad\\Rightarrow\\quad \\psi_{j,k}(t)=\\Psi(t-k)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle s=2^{-j},\\quad \\tau=k\\quad\\text{(continuous }\\tau\\text{ only)}$',
          ok: false,
        },
      ],
      caption:
        'Implement via L/H filters + ↓2 (Mallat pyramid), not slow CWT integrals. Store details; recurse on the smooth half.',
    },
    {
      ask: 'For an orthonormal family, reconstruction at the samples is…',
      choices: [
        {
          label: '$\\displaystyle y(t)=\\sum_{j,k} Y_{j,k}\\,\\psi_{j,k}(t)$',
          ok: true,
        },
        {
          label: '$\\displaystyle y(t)=\\prod_{j,k} Y_{j,k}\\,\\psi_{j,k}(t)$',
          ok: false,
        },
        {
          label: '$\\displaystyle y(t)=Y_{0,0}$ only (DC bin)',
          ok: false,
        },
      ],
      caption:
        'Synthesis reverses the pyramid: upsample, transpose filters, merge.',
    },
    {
      ask: 'Daub4 lowpass taps from orthogonality + vanishing moments. Which set?',
      choices: [
        {
          label:
            '$\\displaystyle c_0=\\dfrac{1+\\sqrt3}{4\\sqrt2},\\; c_1=\\dfrac{3+\\sqrt3}{4\\sqrt2},\\; c_2=\\dfrac{3-\\sqrt3}{4\\sqrt2},\\; c_3=\\dfrac{1-\\sqrt3}{4\\sqrt2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle c_0=c_1=c_2=c_3=\\tfrac14$ (boxcar)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle c_0=\\dfrac{1-\\sqrt3}{4\\sqrt2},\\; c_1=\\dfrac{3-\\sqrt3}{4\\sqrt2},\\; c_2=\\dfrac{3+\\sqrt3}{4\\sqrt2},\\; c_3=\\dfrac{1+\\sqrt3}{4\\sqrt2}$ (order reversed)',
          ok: false,
        },
      ],
      caption:
        'Highpass $H=(c_3,-c_2,c_1,-c_0)$. Impulse in coeff space → time-domain Daub4 shape at that scale.',
    },
  ],
};

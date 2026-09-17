/** QFT definition and QFT₄ — pick the equation. */

export default {
  title: 'Quantum Fourier transform',
  lead:
    'QFT is the DFT on amplitudes. Pick the definition and the $N=4$ matrix structure.',
  steps: [
    {
      ask: 'With $Z_N=e^{-2\\pi i/N}$ and $N=2^{n}$, the QFT on amplitudes is…',
      choices: [
        {
          label:
            '$\\displaystyle |Y\\rangle=\\mathrm{QFT}_N|y\\rangle=\\dfrac{1}{\\sqrt N}\\sum_{k,l=0}^{N-1} y_l\\,Z_N^{-kl}|k\\rangle$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle |Y\\rangle=\\dfrac{1}{\\sqrt{2\\pi}}\\sum_{k,l} y_l\\,Z_N^{-kl}|k\\rangle$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle |Y\\rangle=\\sum_{k} y_k|k\\rangle$ (identity, no Fourier)',
          ok: false,
        },
      ],
      caption:
        'No extra $\\sqrt{2\\pi}$ factors (unlike Chapter 9’s continuous FT). Qiskit indexes from $0$.',
    },
    {
      ask: 'For $N=4$, $Z\\equiv Z_4=-i$, and $\\mathrm{QFT}_4$ begins…',
      choices: [
        {
          label:
            '$\\displaystyle \\mathrm{QFT}_4=\\dfrac12\\begin{bmatrix}1&1&1&1\\\\1&Z^{-1}&Z^{-2}&Z^{-3}\\\\1&Z^{-2}&1&Z^{-2}\\\\1&Z^{-3}&Z^{-2}&Z^{-1}\\end{bmatrix}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\mathrm{QFT}_4=\\dfrac12\\begin{bmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\mathrm{QFT}_4=\\begin{bmatrix}1&1&1&1\\\\1&1&1&1\\\\1&1&1&1\\\\1&1&1&1\\end{bmatrix}$ (unnormalized all-ones)',
          ok: false,
        },
      ],
      caption:
        'Factor into H, controlled $P(\\pi/2)$, and SWAP. Basis: $|2\\rangle=|10\\rangle$ in Qiskit labeling.',
    },
  ],
};

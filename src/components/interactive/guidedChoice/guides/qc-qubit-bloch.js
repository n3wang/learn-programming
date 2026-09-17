/** Bloch sphere and tensor product — pick the equation. */

export default {
  title: 'Qubits and Bloch sphere',
  lead:
    'A qubit is a normalized superposition. Pick the Bloch parametrization and the Kronecker product.',
  steps: [
    {
      ask: 'Pure-state Bloch form with angles $(\\theta,\\phi)$ is…',
      choices: [
        {
          label:
            '$\\displaystyle |\\psi\\rangle=\\cos\\dfrac{\\theta}{2}|0\\rangle+e^{i\\phi}\\sin\\dfrac{\\theta}{2}|1\\rangle$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle |\\psi\\rangle=\\cos\\theta\\,|0\\rangle+e^{i\\phi}\\sin\\theta\\,|1\\rangle$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle |\\psi\\rangle=\\sin\\dfrac{\\theta}{2}|0\\rangle+e^{i\\phi}\\cos\\dfrac{\\theta}{2}|1\\rangle$',
          ok: false,
        },
      ],
      caption:
        '$\\theta=0$ → north pole $|0\\rangle$; $\\theta=\\pi$ → south pole $|1\\rangle$. Normalization: $|u|^{2}+|v|^{2}=1$.',
    },
    {
      ask: 'The Kronecker product $[a,b]^{T}\\otimes[c,d]^{T}$ is…',
      choices: [
        {
          label: '$\\displaystyle \\begin{bmatrix}ac\\\\ad\\\\bc\\\\bd\\end{bmatrix}$',
          ok: true,
        },
        {
          label: '$\\displaystyle \\begin{bmatrix}a+c\\\\b+d\\end{bmatrix}$',
          ok: false,
        },
        {
          label: '$\\displaystyle \\begin{bmatrix}a&c\\\\b&d\\end{bmatrix}$ (as a $2\\times 2$ matrix only)',
          ok: false,
        },
      ],
      caption:
        'Two qubits → $\\mathbb{C}^{4}$ with basis $|00\\rangle,|01\\rangle,|10\\rangle,|11\\rangle$. $n$ qubits live in $\\mathbb{C}^{2^{n}}$.',
    },
  ],
};

/** Separability wz=xy and Bell state — pick the equation. */

export default {
  title: 'Entanglement and Bell states',
  lead:
    'Product states are separable; Bell states are not. Pick the matching tests and examples.',
  steps: [
    {
      ask: 'For $|\\Psi\\rangle=[w,x,y,z]^{T}$ in the computational basis, separability holds iff…',
      choices: [
        {
          label: '$\\displaystyle wz=xy$',
          ok: true,
        },
        {
          label: '$\\displaystyle w+x=y+z$',
          ok: false,
        },
        {
          label: '$\\displaystyle wz=1$ always',
          ok: false,
        },
      ],
      caption:
        'Product states satisfy this identically. Next — a maximally entangled counterexample.',
    },
    {
      ask: 'The Bell state $|\\beta_{00}\\rangle$ is…',
      choices: [
        {
          label:
            '$\\displaystyle |\\beta_{00}\\rangle=\\dfrac{1}{\\sqrt{2}}\\bigl(|00\\rangle+|11\\rangle\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle |\\beta_{00}\\rangle=\\dfrac{1}{\\sqrt{2}}\\bigl(|01\\rangle+|10\\rangle\\bigr)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle |\\beta_{00}\\rangle=|00\\rangle$ (product state)',
          ok: false,
        },
      ],
      caption:
        'Amplitudes $[1,0,0,1]/\\sqrt{2}$ give $|wz-xy|=1/2\\neq 0$ → entangled. Pauli $X|0\\rangle=|1\\rangle$.',
    },
  ],
};

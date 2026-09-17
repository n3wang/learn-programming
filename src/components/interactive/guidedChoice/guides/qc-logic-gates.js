/** Classical warm-up + H then CNOT → Bell — equation picks. */

export default {
  title: 'Logic and quantum gates',
  lead:
    'Classical circuits wire AND/XOR; quantum gates are unitaries. Pick the Hadamard action and the Bell recipe among lookalikes.',
  steps: [
    {
      ask: 'The Hadamard on computational basis states is…',
      choices: [
        {
          label:
            '$\\displaystyle H|0\\rangle=\\dfrac{|0\\rangle+|1\\rangle}{\\sqrt2},\\quad H|1\\rangle=\\dfrac{|0\\rangle-|1\\rangle}{\\sqrt2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle H|0\\rangle=|1\\rangle,\\quad H|1\\rangle=|0\\rangle$ (bit flip only)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle H|0\\rangle=\\dfrac{|0\\rangle-|1\\rangle}{\\sqrt2},\\quad H|1\\rangle=\\dfrac{|0\\rangle+|1\\rangle}{\\sqrt2}$',
          ok: false,
        },
      ],
      caption:
        'CNOT with control $=1$ flips the target: $\\mathrm{CNOT}|10\\rangle=|11\\rangle$. Next — entangle.',
    },
    {
      ask: 'Starting from $|00\\rangle$, apply $H$ on the first qubit then CNOT. The state is…',
      choices: [
        {
          label:
            '$\\displaystyle H|0\\rangle|0\\rangle=\\tfrac1{\\sqrt2}(|0\\rangle+|1\\rangle)|0\\rangle,\\quad \\mathrm{CNOT}\\,\\mapsto\\,\\tfrac1{\\sqrt2}(|00\\rangle+|11\\rangle)=|\\beta_{00}\\rangle$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle H|0\\rangle|0\\rangle=\\tfrac1{\\sqrt2}(|0\\rangle+|1\\rangle)|0\\rangle,\\quad \\mathrm{CNOT}\\,\\mapsto\\,\\tfrac1{\\sqrt2}(|01\\rangle+|10\\rangle)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\mathrm{CNOT}\\,H|00\\rangle=|00\\rangle$ (product state unchanged)',
          ok: false,
        },
      ],
      caption:
        'That is the Bell state $|\\beta_{00}\\rangle$. CZ only phases $|11\\rangle$; Toffoli flips the third qubit when both controls are 1.',
    },
  ],
};

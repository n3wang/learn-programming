/** Cirq circuits: H, measure, SWAP, CNOT, Toffoli, half-adder. */

export default {
  title: 'Cirq circuits and adders',
  lead:
    'Local Cirq builds circuits from H, X, CNOT, SWAP, Toffoli. H²=I. Half-adder = Toffoli (carry) then CNOT (sum). Graded locks use pure Python.',
  steps: [
    {
      caption:
        'H|0⟩ → equal amps; two H restore |0⟩; X then H → |−⟩. Measure XZH with many shots ≈ 50/50.',
    },
    {
      ask: 'Half-adder on q0,q1 with carry line q2: which gate writes the carry?',
      choices: [
        {label: 'Toffoli (both controls → flip q2)', ok: true},
        {label: 'Hadamard only', ok: false},
        {label: 'Z on q0 alone', ok: false},
      ],
      caption: 'Then CNOT(q0,q1) writes the XOR sum into q1.',
    },
  ],
};

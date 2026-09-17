/** Qiskit / IBM Composer Bell + endianness. */

export default {
  title: 'Qiskit Bell and IBM order',
  lead:
    'Same H→CX Bell as Composer. IBM often writes |qₙ₋₁…q₀⟩ with q0 on the right. Simulator is ideal; hardware is noisy.',
  steps: [
    {
      caption:
        'QuantumCircuit(2); h(0); cx(0,1) → |β₀₀⟩. Statevector city plot: Im(ρ)≈0 for ideal Bell.',
    },
    {
      ask: 'In IBM bitstring notation, which qubit is the rightmost bit?',
      choices: [
        {label: 'q[0]', ok: true},
        {label: 'always q[n−1]', ok: false},
        {label: 'the classical register only', ok: false},
      ],
      caption: 'Transpile before hardware; never commit API tokens.',
    },
  ],
};

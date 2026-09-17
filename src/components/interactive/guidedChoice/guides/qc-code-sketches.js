/** QC code sketches: dipole H, QFT, Grover, Shor — structure only. */

export default {
  title: 'QC code sketches',
  lead:
    'Local notebooks: NumPy dipole eig, Qiskit QFT₄/ₙ, Grover oracle+diffuser (use √N not √n), Shor amod15+QPE. No textbook dumps; no tokens in git.',
  steps: [
    {
      caption:
        'Match Operator(qft4) to the analytic matrix. Grover R = ceil(π√16/4) for four qubits.',
    },
    {
      ask: 'A Grover driver with 4 qubits should put which value under the square root?',
      choices: [
        {label: 'N = 16 = 2⁴', ok: true},
        {label: 'n = 4 (qubit count)', ok: false},
        {label: 'always 1', ok: false},
      ],
      caption: 'Shor: random a → QPE → Fraction → gcd factors of 15.',
    },
  ],
};

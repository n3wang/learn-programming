/** NN code sketches: sigmoid neuron, 2–2–1, train, k-means, Keras — structure only. */

export default {
  title: 'NN code sketches',
  lead:
    'Local notebooks: Neuron → shallow 2–2–1 → MSE backprop loop → k-means / Keras Dense. Keep the math; swap display layers. No textbook path dumps.',
  steps: [
    {
      caption:
        'Sigmoid neuron $y=\\sigma(\\mathbf w\\cdot\\mathbf x+b)$; stack two hidden + one output for a 2–2–1 forward pass. Train: forward → $\\partial\\mathcal{L}$ chain → $w\\leftarrow w-\\eta\\partial\\mathcal{L}/\\partial w$.',
    },
    {
      ask: 'A trustworthy first validation of the sketch stack is…',
      choices: [
        {
          label: 'hand-check neuron / 2–2–1 locks, then one MSE backprop step before k-means or Keras',
          ok: true,
        },
        {label: 'only call OpenCV with no arithmetic checks', ok: false},
        {label: 'commit API tokens and dataset paths in git', ok: false},
      ],
      caption:
        'k-means: assign → update means on $(index, mass)$. Keras: one-unit Dense + Adam MSE. Graded locks live in 11.1b–11.9b; this page is the map.',
    },
  ],
};

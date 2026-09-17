/** Biological vs artificial neural nets. */

export default {
  title: 'Biological and artificial nets',
  lead:
    'Brains integrate dendritic pulses and fire all-or-nothing axon spikes. Artificial nets replace that with weighted sums, biases, and activations — then learn by updating parameters.',
  steps: [
    {
      caption:
        'Dendrites → soma integration → threshold → action potential along the axon. Cortical processing is layered and highly parallel.',
    },
    {
      ask: 'An artificial network “learns” primarily by…',
      choices: [
        {label: 'iteratively changing weights and biases from prediction error', ok: true},
        {label: 'rewriting every decision rule by hand each time', ok: false},
        {label: 'deleting the output layer', ok: false},
      ],
      caption:
        'McCulloch–Pitts / Perceptron history: trainable neuron models long predate modern hardware. Next: code a single node and a shallow net.',
    },
  ],
};

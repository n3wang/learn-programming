/** Keras Dense layers and fit loop. */

export default {
  title: 'Keras Dense API',
  lead:
    'Keras stacks layers. A Dense layer is fully connected; units sets the output size. compile chooses Loss/optimizer; fit runs epochs.',
  steps: [
    {
      caption:
        'Dense(units=1, input_shape=[1]) is linear regression $y=wx+b$ — the Hubble toy again, with a training Loss curve.',
    },
    {
      ask: 'activation="relu" on a Dense unit computes…',
      choices: [
        {label: 'max(0, z) after the affine map', ok: true},
        {label: 'an FFT of the weights', ok: false},
        {label: 'k-means with k=units', ok: false},
      ],
      caption:
        'Regularizers/constraints are optional. Run real tf.keras locally; sandbox locks the arithmetic.',
    },
  ],
};

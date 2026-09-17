/** Explore public ML / physics datasets. */

export default {
  title: 'Explore ML repositories',
  lead:
    'Public HEP / materials / vision datasets let you practice the chapter tools on real tables and images.',
  steps: [
    {
      caption:
        'Start with a baseline (linear, k-means, RGB ratio) and a hold-out metric before scaling to deep Keras models.',
    },
    {
      ask: 'A good first step on a new competition dataset is…',
      choices: [
        {label: 'understand features/labels and score a simple baseline', ok: true},
        {label: 'train a 100-layer net with no plots', ok: false},
        {label: 'delete the test split immediately', ok: false},
      ],
      caption:
        'Portals: DeepLearnPhysics, MLPhysics, Kaggle TrackML, CERN IML, Papers with Code physics lists.',
    },
  ],
};

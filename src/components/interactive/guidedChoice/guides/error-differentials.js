/** Guided: error estimates via differentials. */

export default {
  title: 'Error estimates with differentials',
  lead: 'Δy ≈ f′(x) Δx turns measurement error into output error.',
  steps: [
    {
      ask: 'Plate radius 5→5.06: |dA| for A=πr² equals…',
      choices: [
        {label: '0.6π ≈ 1.88 in²', ok: true},
        {label: '0.06π', ok: false},
        {label: 'π', ok: false},
      ],
      caption: 'dA = 2πr dr = 2π·5·0.06.',
    },
    {
      ask: 'Equator flight 2 mi up: extra distance ≈ …',
      choices: [
        {label: '2π·2 ≈ 12.6 mi', ok: true},
        {label: '2 mi', ok: false},
        {label: '4π²', ok: false},
      ],
      caption: 'dC = 2π dR with dR = 2.',
    },
    {
      ask: 'pV=20, p=5±0.02 ⇒ V ≈ …',
      choices: [
        {label: '4 ± 0.016', ok: true},
        {label: '4 ± 0.02', ok: false},
        {label: '5 ± 0.016', ok: false},
      ],
      caption: 'dV = −(V/p) dp = −(4/5)(0.02).',
    },
  ],
};

/** Guided: percent change via differentials. */

export default {
  title: 'Cube volume — 1% side increase',
  lead: 'ΔV ≈ V′(x) Δx with Δx = 0.01x.',
  steps: [
    {
      ask: 'If the side grows by 1%, then Δx equals…',
      choices: [
        {label: '0.01x', ok: true},
        {label: '0.01', ok: false},
        {label: 'x + 1', ok: false},
      ],
      caption: 'One percent of the current side.',
    },
    {
      ask: 'With V = x³, dV ≈ …',
      choices: [
        {label: '3x² · (0.01x) = 0.03 x³', ok: true},
        {label: 'x³ · 0.01', ok: false},
        {label: '3x²', ok: false},
      ],
      caption: 'Relative change ≈ 3% — classic power rule scaling.',
    },
  ],
};

/** Guided: matching coal to its use and benchmark. */

export default {
  title: 'Match the coal',
  lead: 'Pick the right coal type or benchmark for each buyer.',
  steps: [
    {
      ask: 'A steel mill needs feed for its coke ovens.',
      choices: [
        {label: 'Metallurgical (coking) bituminous coal — at a premium', ok: true},
        {label: 'Lignite', ok: false},
        {label: 'Thermal coal, which is identical', ok: false},
      ],
      caption: 'Coke → blast furnace → pig iron.',
    },
    {
      ask: 'A power station next to a brown-coal mine.',
      choices: [
        {label: 'Lignite — low energy, high moisture, burned locally', ok: true},
        {label: 'Anthracite shipped from abroad', ok: false},
        {label: 'Coking coal', ok: false},
      ],
      caption: 'Too little energy per tonne to ship far.',
    },
    {
      ask: 'A German utility importing seaborne steam coal wants an index for its swaps.',
      choices: [
        {label: 'API2 — CIF ARA', ok: true},
        {label: 'GlobalCoal NEWC', ok: false},
        {label: 'Powder River Basin', ok: false},
      ],
      caption: 'API2 is the Atlantic import benchmark.',
    },
    {
      ask: 'A Japanese utility buying Australian coal.',
      choices: [
        {label: 'GlobalCoal NEWC — the Pacific benchmark', ok: true},
        {label: 'API2', ok: false},
        {label: 'Central Appalachia', ok: false},
      ],
      caption: 'Match the index to the trade flow to cut basis risk.',
    },
  ],
};

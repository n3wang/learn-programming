/** Guided: asymmetric costs belong in inventory policy. */

export default {
  title: 'Where do costs belong?',
  lead: 'Shortages cost far more than overstock for an item.',
  steps: [
    {
      ask: 'Should the forecast KPI penalise under-forecasts twice as much?',
      choices: [
        {label: 'No — it would push forecasts up and create bias', ok: true},
        {label: 'Yes — it reflects costs', ok: false},
        {label: 'Only for A items', ok: false},
      ],
      caption: 'Keep the forecast unbiased.',
    },
    {
      ask: 'Where should the higher shortage cost be reflected?',
      choices: [
        {label: 'A higher service-level target and safety stock', ok: true},
        {label: 'A higher demand forecast', ok: false},
        {label: 'A lower MAE target', ok: false},
      ],
      caption: 'Inventory policy handles risk.',
    },
    {
      ask: 'What happens when other teams learn the forecast is inflated?',
      choices: [
        {label: 'They lose trust and second-guess or build their own forecasts', ok: true},
        {label: 'Nothing', ok: false},
        {label: 'Accuracy improves', ok: false},
      ],
      caption: 'Biased forecasts create chaos over time.',
    },
  ],
};

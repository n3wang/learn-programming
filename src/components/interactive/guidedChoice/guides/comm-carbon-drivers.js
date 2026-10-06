/** Guided: what moves the carbon price. */

export default {
  title: 'What moves the carbon price?',
  lead: 'Decide the likely effect on EU allowance (EUA) prices.',
  steps: [
    {
      ask: 'A recession cuts industrial output across Europe.',
      choices: [
        {label: 'EUAs fall — fewer emissions against a fixed cap', ok: true},
        {label: 'EUAs rise', ok: false},
        {label: 'No effect — supply adjusts instantly', ok: false},
      ],
      caption: 'This is what happened after 2008, leaving a 2.1 billion surplus.',
    },
    {
      ask: 'Gas prices spike during a cold winter.',
      choices: [
        {label: 'EUAs rise — generators switch to coal and need more allowances', ok: true},
        {label: 'EUAs fall', ok: false},
        {label: 'Only gas prices move', ok: false},
      ],
      caption: 'Carbon correlates positively with gas.',
    },
    {
      ask: 'Regulators tighten the cap and strengthen the Market Stability Reserve.',
      choices: [
        {label: 'EUAs rise — less supply against the same demand', ok: true},
        {label: 'EUAs fall', ok: false},
        {label: 'No effect', ok: false},
      ],
      caption: 'Supply is a political decision.',
    },
    {
      ask: 'Cheap abatement technology becomes widely available.',
      choices: [
        {label: 'EUAs fall — firms cut emissions instead of buying allowances', ok: true},
        {label: 'EUAs rise', ok: false},
        {label: 'Abatement and allowances are unrelated', ok: false},
      ],
      caption: 'The abatement cost anchors the price — and can cut innovators’ returns.',
    },
  ],
};

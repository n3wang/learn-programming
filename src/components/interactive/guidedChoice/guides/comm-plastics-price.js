/** Guided: plastics price drivers. */

export default {
  title: 'Read the plastics market',
  lead: 'Decide the likely effect on polymer prices.',
  steps: [
    {
      ask: 'Crude oil rises 30%.',
      choices: [
        {label: 'Polymer prices rise — naphtha feedstock costs more', ok: true},
        {label: 'Polymer prices fall', ok: false},
        {label: 'No link', ok: false},
      ],
      caption: 'Feedstock is the largest cost.',
    },
    {
      ask: 'A hurricane shuts US Gulf Coast plants.',
      choices: [
        {label: 'Regional prices rise; imports fill the gap', ok: true},
        {label: 'Prices fall', ok: false},
        {label: 'Only crude is affected', ok: false},
      ],
      caption: 'Supply disruption tightens the market.',
    },
    {
      ask: 'Recycling collection and sorting improve.',
      choices: [
        {label: 'More recycled supply — downward pressure on virgin polymer', ok: true},
        {label: 'Higher virgin demand', ok: false},
        {label: 'No effect', ok: false},
      ],
      caption: 'Recycled resin substitutes for virgin.',
    },
    {
      ask: 'The US dollar strengthens.',
      choices: [
        {label: 'Dollar-priced polymer gets dearer for non-US buyers, damping demand', ok: true},
        {label: 'Polymer gets cheaper for everyone', ok: false},
        {label: 'No effect', ok: false},
      ],
      caption: 'Same as other USD-priced commodities.',
    },
  ],
};

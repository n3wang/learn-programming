/** Guided: from hydrocarbon to plastic product. */

export default {
  title: 'From hydrocarbon to product',
  lead: 'Follow ethylene from feedstock to a bottle.',
  steps: [
    {
      ask: 'A US cracker has access to cheap shale gas. Which feedstock?',
      choices: [
        {label: 'Ethane — high ethylene yield at low cost', ok: true},
        {label: 'Naphtha — it is always cheaper', ok: false},
        {label: 'Coal tar', ok: false},
      ],
      caption: 'Ethane cracking: lots of ethylene, few co-products.',
    },
    {
      ask: 'How does ethylene become polyethylene?',
      choices: [
        {label: 'Polymerisation with a catalyst opens the double bond and links monomers', ok: true},
        {label: 'Distillation', ok: false},
        {label: 'Vulcanisation with sulfur', ok: false},
      ],
      caption: '[C₂H₄]ₙ.',
    },
    {
      ask: 'Which process turns pellets into a bottle?',
      choices: [
        {label: 'Blow moulding', ok: true},
        {label: 'Extrusion', ok: false},
        {label: 'Steam cracking', ok: false},
      ],
      caption: 'Extrusion makes pipes and film; injection makes pots and caps.',
    },
    {
      ask: 'Can the bottle be remelted and reshaped?',
      choices: [
        {label: 'Yes — PE and PET are thermoplastics', ok: true},
        {label: 'No — all plastics are thermosets', ok: false},
        {label: 'Only if vulcanised', ok: false},
      ],
      caption: 'Thermosets (epoxies, phenolics) cure irreversibly.',
    },
  ],
};

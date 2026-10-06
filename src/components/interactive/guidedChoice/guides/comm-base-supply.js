/** Guided: base metals production facts. */

export default {
  title: 'From ore to metal',
  lead: 'Apply base metals production rules.',
  steps: [
    {
      ask: 'A smelter needs alumina for 50,000 t of aluminium. How much bauxite must be mined?',
      choices: [
        {label: '200,000 t (4:2:1 rule)', ok: true},
        {label: '50,000 t', ok: false},
        {label: '100,000 t', ok: false},
      ],
      caption: '4 t bauxite → 2 t alumina → 1 t aluminium.',
    },
    {
      ask: 'A steelmaker has cheap scrap and electricity, but no coal.',
      choices: [
        {label: 'Electric arc furnace route', ok: true},
        {label: 'Basic oxygen furnace route', ok: false},
        {label: 'Smelt bauxite', ok: false},
      ],
      caption: 'EAF uses ~710 kg scrap per tonne; BOF needs ore and coal.',
    },
    {
      ask: 'Copper prices double for years. What happens to reported copper reserves?',
      choices: [
        {label: 'They tend to rise as resources become economic', ok: true},
        {label: 'They fall to zero', ok: false},
        {label: 'Nothing — reserves are fixed geology', ok: false},
      ],
      caption: 'Reserves are economic estimates.',
    },
  ],
};

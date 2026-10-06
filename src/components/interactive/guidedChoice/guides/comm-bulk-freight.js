/** Guided: choosing ships and charters. */

export default {
  title: 'Charter the right ship',
  lead: 'Decide vessel class and charter type.',
  steps: [
    {
      ask: 'Move 170,000 t of iron ore from Brazil to China.',
      choices: [
        {label: 'Capesize (or a VLOC) — too big for the canals, goes round the Cape', ok: true},
        {label: 'Handysize', ok: false},
        {label: 'Product tanker', ok: false},
      ],
      caption: 'About 60% of Capesizes carry iron ore.',
    },
    {
      ask: 'A miner wants to know the exact cost of one trip, with the owner handling fuel and ports.',
      choices: [
        {label: 'Voyage charter, priced in USD per tonne', ok: true},
        {label: 'Time charter, USD per day', ok: false},
        {label: 'Worldscale FFA', ok: false},
      ],
      caption: 'The taxi model.',
    },
    {
      ask: 'An operator wants a ship for six months to run its own schedule.',
      choices: [
        {label: 'Time charter — pays daily hire plus fuel and port costs', ok: true},
        {label: 'Voyage charter', ok: false},
        {label: 'Buy a ULCC', ok: false},
      ],
      caption: 'The rental-car model.',
    },
    {
      ask: 'How do you compare a TC quote with a VC quote on the same route?',
      choices: [
        {label: '(Round-trip days × hire + fuel + ports) ÷ tonnes, then compare per tonne', ok: true},
        {label: 'Compare the headline numbers directly', ok: false},
        {label: 'Divide the TC rate by 365', ok: false},
      ],
      caption: 'Put both on a USD/t basis.',
    },
  ],
};

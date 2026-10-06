/** Guided: sizing a power contract. */

export default {
  title: 'Size a power contract',
  lead: 'A 20 MW winter peak contract: 12 hours a day, 5 days a week, 26 weeks, at GBP 14/MWh.',
  steps: [
    {
      ask: 'Is 20 MW an amount of energy?',
      choices: [
        {label: 'No — MW is a rate; energy is MW × hours (MWh)', ok: true},
        {label: 'Yes — 20 MW is 20 units of energy', ok: false},
        {label: 'It is a price', ok: false},
      ],
      caption: 'Trade in MW, settle in MWh.',
    },
    {
      ask: 'Total contract volume?',
      choices: [
        {label: '20 × 12 × 5 × 26 = 31,200 MWh', ok: true},
        {label: '20 × 24 × 7 × 26 = 87,360 MWh', ok: false},
        {label: '20 × 26 = 520 MWh', ok: false},
      ],
      caption: 'Only the peak hours count.',
    },
    {
      ask: 'Contract value?',
      choices: [
        {label: '31,200 × 14 = GBP 436,800', ok: true},
        {label: '20 × 14 = GBP 280', ok: false},
        {label: '31,200 / 14 = GBP 2,229', ok: false},
      ],
      caption: 'Volume × price.',
    },
    {
      ask: 'Demand is 500 MW; the stack is nuclear 360, renewable 120, gas 350 (USD 110). Which plant sets the price?',
      choices: [
        {label: 'Gas — the last 20 MW come from gas, so price ≈ USD 110', ok: true},
        {label: 'Nuclear — it is the largest', ok: false},
        {label: 'Diesel — it is the most expensive', ok: false},
      ],
      caption: 'The marginal plant sets the price.',
    },
  ],
};

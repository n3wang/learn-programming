/** Guided: Brent complex instruments. */

export default {
  title: 'Navigate the Brent complex',
  lead: 'Pick the instrument.',
  steps: [
    {
      ask: 'A cargo with a known 3-day loading window starting in two weeks.',
      choices: [
        {label: 'Dated Brent', ok: true},
        {label: 'Brent forward for a later month', ok: false},
        {label: 'ICE Brent future', ok: false},
      ],
      caption: 'Dated covers cargoes 10 days to about a month ahead.',
    },
    {
      ask: 'You want to lock in the price of a cargo priced on Dated Brent in week 4, using liquid instruments.',
      choices: [
        {label: 'Buy the week-4 CFD and go long the third-month Brent forward', ok: true},
        {label: 'Buy a WTI future', ok: false},
        {label: 'Sell a CFD only', ok: false},
      ],
      caption: 'Forward Dated = CFD + third-month forward.',
    },
    {
      ask: 'A refiner holds long futures and wants to buy a physical cargo from a producer at a futures-linked price.',
      choices: [
        {label: 'Exchange for physicals (EFP)', ok: true},
        {label: 'Calendar spread option', ok: false},
        {label: 'Margin swap', ok: false},
      ],
      caption: 'Swap the futures for physical at a negotiated differential.',
    },
  ],
};

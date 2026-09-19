/** Guided: who does what in the trade architecture. */

export default {
  title: 'Trade institutions at a glance',
  lead: 'Match the body to the job exporters actually feel.',
  steps: [
    {
      ask: 'UCP rules for documentary credits are published by…',
      choices: [
        {label: 'ICC (International Chamber of Commerce)', ok: true},
        {label: 'IATA only', ok: false},
        {label: 'Local city hall', ok: false},
      ],
      caption: 'ICC also publishes Incoterms® and hosts major commercial arbitration.',
    },
    {
      ask: 'The CISG (Vienna sales convention) was prepared under…',
      choices: [
        {label: 'UNCITRAL', ok: true},
        {label: 'FIATA', ok: false},
        {label: 'IRU', ok: false},
      ],
      caption: 'UNCITRAL = UN private-law work on trade instruments.',
    },
    {
      ask: 'WTO chiefly shapes…',
      choices: [
        {label: 'Government-to-government trade rules (tariffs, services, TRIPS, disputes)', ok: true},
        {label: 'Your private L/C wording line-by-line', ok: false},
        {label: 'Truck TIR carnets day-to-day', ok: false},
      ],
      caption: 'Private deals still use ICC/UNCITRAL tools; WTO sets the public framework.',
    },
  ],
};

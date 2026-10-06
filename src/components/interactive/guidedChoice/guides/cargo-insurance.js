/** Guided: cargo insurance decisions. */

export default {
  title: 'Insure the cargo',
  lead: 'Decide who insures what, and how.',
  steps: [
    {
      ask: 'An FOB seller on open account is paid only after arrival. It should insure…',
      choices: [
        {label: 'Its contingency interest for the whole transit', ok: true},
        {label: 'Only up to loading on board', ok: false},
        {label: 'Nothing — risk passed at loading', ok: false},
      ],
      caption: 'If goods are lost at sea, the buyer may simply not pay.',
    },
    {
      ask: 'A CIF buyer expects a 25% margin on high-value electronics. It should ask the contract for…',
      choices: [
        {label: '(A) cover plus War/SRCC at around 120–130% of value', ok: true},
        {label: 'Whatever minimum (C) cover the seller chooses', ok: false},
        {label: 'No insurance', ok: false},
      ],
      caption: 'CIF only guarantees (C) at 110% unless the contract says more.',
    },
    {
      ask: 'A regular exporter ships 40 consignments a month. Most efficient cover?',
      choices: [
        {label: 'Open cover with per-shipment certificates', ok: true},
        {label: 'A separate negotiated policy for every shipment', ok: false},
        {label: 'Rely on carrier liability', ok: false},
      ],
      caption: 'Check that the credit accepts certificates, not only policies.',
    },
  ],
};

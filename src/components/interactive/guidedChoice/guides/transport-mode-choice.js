/** Guided: choosing a transport mode and Incoterm. */

export default {
  title: 'Choose the transport mode',
  lead: 'Pick the best option for each shipment.',
  steps: [
    {
      ask: 'Fresh tuna from Japan to a European restaurant group.',
      choices: [
        {label: 'Air freight under FCA airport terminal or CPT/CIP', ok: true},
        {label: 'Sea freight FOB', ok: false},
        {label: 'Rail via Siberia', ok: false},
      ],
      caption: 'Perishables need speed; use container/air Incoterms, not FOB.',
    },
    {
      ask: '60,000 tonnes of iron ore from Brazil to China.',
      choices: [
        {label: 'Chartered bulk vessel (voyage charter)', ok: true},
        {label: 'Air freight', ok: false},
        {label: 'LCL containers', ok: false},
      ],
      caption: 'Bulk commodities move by chartered tonnage.',
    },
    {
      ask: 'Machinery stuffed into a 40 ft container at the seller’s factory.',
      choices: [
        {label: 'FCA seller’s premises (or CPT/CIP) — not FOB', ok: true},
        {label: 'FOB port of loading, insured only to the inland depot', ok: false},
        {label: 'FAS', ok: false},
      ],
      caption: 'Risk should pass at hand-over to the carrier, not on board.',
    },
  ],
};

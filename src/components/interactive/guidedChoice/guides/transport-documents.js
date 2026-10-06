/** Guided: pick the right transport document. */

export default {
  title: 'Which transport document?',
  lead: 'Match the document to the need.',
  steps: [
    {
      ask: 'An oil cargo will be resold twice while at sea; a bank finances it.',
      choices: [
        {label: 'Negotiable order bill of lading', ok: true},
        {label: 'Sea waybill', ok: false},
        {label: 'Air waybill', ok: false},
      ],
      caption: 'Only a negotiable B/L transfers control by endorsement.',
    },
    {
      ask: 'Regular shipments to a subsidiary on a 2-day ferry route; payment is intercompany.',
      choices: [
        {label: 'Sea waybill — no original needed at destination', ok: true},
        {label: 'Order B/L sent by courier', ok: false},
        {label: 'Charter party', ok: false},
      ],
      caption: 'Fast release where nobody needs title in transit.',
    },
    {
      ask: 'Door-to-door: truck to port, ship, truck to buyer, all under one contract.',
      choices: [
        {label: 'Multimodal transport document', ok: true},
        {label: 'Port-to-port marine B/L only', ok: false},
        {label: 'Road consignment note only', ok: false},
      ],
      caption: 'Covers all legs, often evidencing receipt at an inland point.',
    },
  ],
};

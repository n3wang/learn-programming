/** Guided: choosing a payment method for the situation. */

export default {
  title: 'Pick the payment method',
  lead: 'Match the payment term to the trust level and bargaining power.',
  steps: [
    {
      ask: 'First shipment to an unknown buyer in a distant, unstable market. Exporter wants maximum safety but advance payment is refused.',
      choices: [
        {label: 'Confirmed documentary credit', ok: true},
        {label: 'Open account, net 90', ok: false},
        {label: 'D/A collection', ok: false},
      ],
      caption: 'A local confirming bank removes both buyer and country payment risk.',
    },
    {
      ask: 'Ten-year relationship with a creditworthy neighbour-country buyer; both want low cost.',
      choices: [
        {label: 'Open account, ideally with credit insurance', ok: true},
        {label: 'Confirmed L/C on every order', ok: false},
        {label: 'Full payment in advance', ok: false},
      ],
      caption: 'Trust makes cheap, simple methods rational; insure the tail risk.',
    },
    {
      ask: 'Buyer insists on open account; exporter wants security without L/C paperwork.',
      choices: [
        {label: 'Open account backed by the buyer’s standby credit or demand guarantee', ok: true},
        {label: 'Clean collection', ok: false},
        {label: 'Ship and hope', ok: false},
      ],
      caption: 'The standby is only drawn if the buyer fails to pay.',
    },
  ],
};

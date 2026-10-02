/** Guided: which bank does what under a documentary credit. */

export default {
  title: 'Who is on the hook?',
  lead: 'Identify each bank’s commitment under a documentary credit.',
  steps: [
    {
      ask: 'The exporter fears the buyer’s country may block payments. Which addition protects it best?',
      choices: [
        {label: 'Confirmation by a bank in the exporter’s country', ok: true},
        {label: 'Advice by a local bank without confirmation', ok: false},
        {label: 'A longer expiry date', ok: false},
      ],
      caption: 'A confirming bank pays without recourse, whatever happens to the issuer.',
    },
    {
      ask: 'A bank negotiates a usance draft and advances funds; the issuing bank then fails to reimburse. Unless it confirmed, the negotiating bank usually…',
      choices: [
        {label: 'Recovers the advance from the exporter (with recourse)', ok: true},
        {label: 'Absorbs the loss permanently', ok: false},
        {label: 'Claims from the carrier', ok: false},
      ],
      caption: 'Negotiation is usually with recourse; confirmation is not.',
    },
    {
      ask: 'An advising bank’s duty is mainly to…',
      choices: [
        {label: 'Check apparent authenticity and pass on the terms accurately', ok: true},
        {label: 'Guarantee payment', ok: false},
        {label: 'Inspect the goods', ok: false},
      ],
      caption: 'Advising alone carries no payment risk.',
    },
  ],
};

/** Guided: pick the right guarantee for the risk. */

export default {
  title: 'Which guarantee?',
  lead: 'Match each risk the beneficiary worries about to the instrument that covers it.',
  steps: [
    {
      ask: 'A ministry fears the winning bidder will refuse to sign the contract.',
      choices: [
        {label: 'Bid (tender) guarantee, ~2–5%', ok: true},
        {label: 'Maintenance guarantee', ok: false},
        {label: 'Payment guarantee', ok: false},
      ],
      caption: 'Released once the winner signs.',
    },
    {
      ask: 'An importer pays 25% up front and fears the exporter will never ship.',
      choices: [
        {label: 'Advance payment (repayment) guarantee', ok: true},
        {label: 'Retention guarantee', ok: false},
        {label: 'Bid guarantee', ok: false},
      ],
      caption: 'Often reduces as deliveries are made.',
    },
    {
      ask: 'An exporter sells on open account and wants protection if the importer does not pay.',
      choices: [
        {label: 'Payment guarantee or standby from the importer’s bank', ok: true},
        {label: 'Performance guarantee from the exporter’s bank', ok: false},
        {label: 'Warranty guarantee', ok: false},
      ],
      caption: 'Drawn only if the importer fails to pay its invoices.',
    },
  ],
};

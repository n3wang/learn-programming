/** Guided: ICC model fallback provisions when Specific Conditions are blank. */

export default {
  title: 'Blank boxes, default rules',
  lead: 'The Specific Conditions were only partly filled in. What applies?',
  steps: [
    {
      ask: 'No payment method chosen. The default is…',
      choices: [
        {label: 'Open account by bank transfer, 30 days from invoice', ok: true},
        {label: 'Confirmed documentary credit', ok: false},
        {label: 'Cash in advance', ok: false},
      ],
      caption: 'Open account is the seller-risky default — choose security deliberately.',
    },
    {
      ask: 'Retention of title selected; buyer goes bankrupt before paying. The seller…',
      choices: [
        {label: 'May reclaim the goods if the clause is valid under the applicable national law', ok: true},
        {label: 'Owns all the buyer’s inventory', ok: false},
        {label: 'Has no rights because the CISG governs title', ok: false},
      ],
      caption: 'Title is national law; some countries require registration.',
    },
    {
      ask: 'A port strike blocks shipment for seven months. Under the default force majeure clause…',
      choices: [
        {label: 'Either party may terminate (impediment lasted over six months)', ok: true},
        {label: 'The seller owes full damages regardless', ok: false},
        {label: 'The contract continues forever', ok: false},
      ],
      caption: 'Draft your own list of likely impediments if the default is too blunt.',
    },
  ],
};

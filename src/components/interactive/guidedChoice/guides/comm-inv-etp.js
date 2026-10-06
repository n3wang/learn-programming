/** Guided: choosing an exchange traded product. */

export default {
  title: 'Choose the ETP',
  lead: 'Match each investor to a product and its key risk.',
  steps: [
    {
      ask: 'An investor wants gold exposure with no bank credit risk and no futures roll.',
      choices: [
        {label: 'A physically backed gold ETC — fee taken as a shrinking gold entitlement', ok: true},
        {label: 'An unsecured ETN', ok: false},
        {label: 'A 2× leveraged ETF', ok: false},
      ],
      caption: 'Allocated metal held by a custodian for a trustee.',
    },
    {
      ask: 'A trader wants twice the daily move in a gold futures index.',
      choices: [
        {label: 'A 2× daily leveraged ETF — but returns are path-dependent over time', ok: true},
        {label: 'A physical ETC', ok: false},
        {label: 'A capital-protected note', ok: false},
      ],
      caption: '+10% then −10% leaves the 2× product at 0.96, not 0.98.',
    },
    {
      ask: 'An ETN tracks the index perfectly. What else can make it lose value?',
      choices: [
        {label: 'An issuer downgrade or default — it is unsecured debt', ok: true},
        {label: 'Nothing', ok: false},
        {label: 'Rising gold prices', ok: false},
      ],
      caption: 'No bankruptcy-remote SPV and no collateral.',
    },
    {
      ask: 'A synthetic ETF’s swap counterparty can’t hedge after a market dislocation. What may happen?',
      choices: [
        {label: 'The swap may be terminated and the product wound up', ok: true},
        {label: 'Investors get a bonus', ok: false},
        {label: 'Leverage doubles', ok: false},
      ],
      caption: 'As with several oil ETPs in 2020.',
    },
  ],
};

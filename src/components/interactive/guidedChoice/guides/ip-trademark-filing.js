/** Guided: filing trademarks abroad. */

export default {
  title: 'Protect the brand abroad',
  lead: 'Choose the filing route and timing.',
  steps: [
    {
      ask: 'An exporter plans to sell in 12 countries, most of them Madrid members. Most efficient route?',
      choices: [
        {label: 'One Madrid international application designating them', ok: true},
        {label: 'Rely on the home registration', ok: false},
        {label: 'Wait until sales start, then file', ok: false},
      ],
      caption: 'One application, one fee schedule, one renewal date.',
    },
    {
      ask: 'The home mark was filed 4 months ago. Can foreign filings still claim its date?',
      choices: [
        {label: 'Yes — Paris priority for trademarks runs 6 months', ok: true},
        {label: 'No — priority is only for patents', ok: false},
        {label: 'Yes — priority runs 12 months for trademarks', ok: false},
      ],
      caption: 'Patents get 12 months; trademarks and designs get 6.',
    },
    {
      ask: 'A local distributor offers to register your brand in its own name “to save you the trouble”. You should…',
      choices: [
        {label: 'Register it yourself, and confirm your ownership in the distribution contract', ok: true},
        {label: 'Accept — it is cheaper', ok: false},
        {label: 'Ignore registration entirely', ok: false},
      ],
      caption: 'A distributor-owned mark can block you after the relationship ends.',
    },
  ],
};

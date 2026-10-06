/** Guided: counterfeits, cybersquatting and parallel imports. */

export default {
  title: 'Enforce your rights',
  lead: 'Pick the tool that fits each infringement.',
  steps: [
    {
      ask: 'Someone registered yourbrand-shop.com and sells fakes on it.',
      choices: [
        {label: 'UDRP complaint (e.g. at WIPO) plus takedown of the listings', ok: true},
        {label: 'A PCT application', ok: false},
        {label: 'Nothing — domains are first come, first served', ok: false},
      ],
      caption: 'Similarity, no legitimate interest, and bad faith.',
    },
    {
      ask: 'Containers of counterfeit goods keep arriving at a port.',
      choices: [
        {label: 'Record the trademark with customs so officers can detain shipments', ok: true},
        {label: 'Rely on the buyer to complain', ok: false},
        {label: 'Lower your prices', ok: false},
      ],
      caption: 'Customs can only act on registered, recorded rights.',
    },
    {
      ask: 'Genuine goods you sold cheaply abroad are re-imported into the EU from outside the EEA.',
      choices: [
        {label: 'Trademark rights can usually block them — the EU applies regional exhaustion', ok: true},
        {label: 'They are counterfeits', ok: false},
        {label: 'Nothing can be done anywhere', ok: false},
      ],
      caption: 'Under international exhaustion, they would generally be allowed.',
    },
  ],
};

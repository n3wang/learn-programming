/** Guided: data protection and trade policy for e-commerce. */

export default {
  title: 'Data and policy check',
  lead: 'Match each problem to the rule or forum that addresses it.',
  steps: [
    {
      ask: 'A multinational wants one approved framework for moving staff and customer data among its group companies worldwide.',
      choices: [
        {label: 'Binding Corporate Rules', ok: true},
        {label: 'eTerms', ok: false},
        {label: 'The ATA Carnet', ok: false},
      ],
      caption: 'BCRs are approved by EU data-protection authorities.',
    },
    {
      ask: 'A government proposes customs duties on downloaded software. Which WTO practice is at stake?',
      choices: [
        {label: 'The moratorium on duties on electronic transmissions', ok: true},
        {label: 'The TRIPS patent term', ok: false},
        {label: 'The Harmonized System', ok: false},
      ],
      caption: 'Members have renewed the moratorium since 1998.',
    },
    {
      ask: 'Where do governments, business and civil society hold annual UN dialogue on internet governance?',
      choices: [
        {label: 'The Internet Governance Forum (IGF)', ok: true},
        {label: 'The ICC Court of Arbitration', ok: false},
        {label: 'The World Customs Organization', ok: false},
      ],
      caption: 'The IGF grew out of the WSIS summits.',
    },
  ],
};

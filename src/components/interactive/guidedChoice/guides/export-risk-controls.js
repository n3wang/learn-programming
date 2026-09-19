/** Guided: pick the right risk control. */

export default {
  title: 'Risk → control matching',
  lead: 'Culture gaps, quality surprises, and transit loss each need a different tool.',
  steps: [
    {
      ask: 'Ambiguous emails about “OK — ship as agreed” are best fixed by…',
      choices: [
        {label: 'Precise specs, photos/samples with written acceptance criteria, and clear GTC', ok: true},
        {label: 'Skipping the contract', ok: false},
        {label: 'Paying cash with no paperwork', ok: false},
      ],
      caption: 'Informal shorthand travels badly across cultures and languages.',
    },
    {
      ask: 'Importer fears wrong quality before payment under a credit…',
      choices: [
        {label: 'Require a recognized pre-shipment inspection certificate as a credit document', ok: true},
        {label: 'Delete the insurance requirement', ok: false},
        {label: 'Use only verbal samples', ok: false},
      ],
      caption: 'Banks check papers; inspection links papers to goods.',
    },
    {
      ask: 'Cargo may be damaged or pilfered in transit. First-line controls include…',
      choices: [
        {label: 'Adequate cargo insurance + B/L / carriage terms + packing instructions', ok: true},
        {label: 'A longer company slogan', ok: false},
        {label: 'Ignoring the bill of lading', ok: false},
      ],
      caption: 'Allocate risk with Incoterms®, then insure what you actually bear.',
    },
  ],
};

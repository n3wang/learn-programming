/** Guided: pick any-mode vs maritime Incoterms®. */

export default {
  title: 'Any-mode vs sea Incoterms®',
  lead: 'Match the transport story to the right rule family.',
  steps: [
    {
      ask: 'Container handed to a carrier at an inland terminal — best default family?',
      choices: [
        {label: 'Any-mode rules such as FCA / CPT / CIP', ok: true},
        {label: 'FAS / FOB / CFR / CIF by habit', ok: false},
        {label: 'Ignore named places entirely', ok: false},
      ],
      caption: 'Maritime rules assume port-side / on-board delivery stories.',
    },
    {
      ask: 'Bulk commodity loaded over the ship’s side for a port-to-port string sale…',
      choices: [
        {label: 'Sea/inland waterway rules (e.g. FOB, CFR, CIF) can fit', ok: true},
        {label: 'Only EXW is allowed', ok: false},
        {label: 'Only DDP is allowed', ok: false},
      ],
      caption: 'FAS/FOB/CFR/CIF were built for that maritime pattern.',
    },
    {
      ask: 'Seller quotes “CIF airport” for air cargo. Risk?',
      choices: [
        {label: 'Documentary / contractual mismatch — prefer CIP (any-mode)', ok: true},
        {label: 'Required by WTO', ok: false},
        {label: 'Always safer than naming any Incoterm', ok: false},
      ],
      caption: 'CFR/CIF expect a maritime-style transport document story.',
    },
  ],
};

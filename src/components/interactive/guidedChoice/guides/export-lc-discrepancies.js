/** Guided: L/C presentation and discrepancies. */

export default {
  title: 'L/C presentation & discrepancies',
  lead: 'Banks pay on conforming documents — small errors matter.',
  steps: [
    {
      ask: 'Who is the “beneficiary” of a documentary credit?',
      choices: [
        {label: 'The exporter entitled to present documents for payment', ok: true},
        {label: 'The ocean carrier only', ok: false},
        {label: 'The WTO secretariat', ok: false},
      ],
      caption: 'Importer = applicant; exporter = beneficiary.',
    },
    {
      ask: 'A confirmation of a credit means…',
      choices: [
        {label: 'A second bank adds its own irrevocable undertaking to pay if conditions are met', ok: true},
        {label: 'Customs has cleared the goods', ok: false},
        {label: 'The invoice was emailed', ok: false},
      ],
      caption: 'Confirmation is optional, fee-based, and often local to the exporter.',
    },
    {
      ask: 'A misspelled goods description on the commercial invoice under an L/C is typically…',
      choices: [
        {label: 'A discrepancy that can delay or block payment until fixed or waived', ok: true},
        {label: 'Ignored if the ship has sailed', ok: false},
        {label: 'Automatically cured by the packing list', ok: false},
      ],
      caption: 'Facial conformity is the bank’s job; first presentations often fail.',
    },
  ],
};

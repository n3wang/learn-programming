/** Guided: choosing security for a commodity loan. */

export default {
  title: 'Secure the commodity loan',
  lead: 'Pick the right document or structure for each situation.',
  steps: [
    {
      ask: 'Coffee is on a ship mid-Atlantic and the bank wants control of it.',
      choices: [
        {label: 'Hold the original bill of lading — it is a document of title', ok: true},
        {label: 'Take a trust receipt', ok: false},
        {label: 'Nothing can be done until it lands', ok: false},
      ],
      caption: 'Whoever holds the bill controls delivery.',
    },
    {
      ask: 'The borrower needs the pledged goods released to sell them to a roaster.',
      choices: [
        {label: 'Release against a trust receipt — goods and proceeds held in trust for the bank', ok: true},
        {label: 'Release with no paperwork', ok: false},
        {label: 'Issue a letter of credit', ok: false},
      ],
      caption: 'Keeps the bank’s claim on the sale proceeds.',
    },
    {
      ask: 'A buyer and seller on different continents distrust each other.',
      choices: [
        {label: 'Letter of credit — the buyer’s bank pays against compliant documents', ok: true},
        {label: 'Warehouse receipt', ok: false},
        {label: 'Open account with 90-day terms', ok: false},
      ],
      caption: 'Banks deal in documents, not goods.',
    },
    {
      ask: 'A borrower offers a warehouse receipt from an unfamiliar jurisdiction.',
      choices: [
        {label: 'Get specialist legal advice on negotiability and check the warehouse', ok: true},
        {label: 'Assume it is negotiable title', ok: false},
        {label: 'Accept a photocopy', ok: false},
      ],
      caption: 'No global standard — and double-pledging frauds are real.',
    },
  ],
};

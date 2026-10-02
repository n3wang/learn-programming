/** Guided: applying for and reviewing a documentary credit. */

export default {
  title: 'Draft and review the credit',
  lead: 'Buyer applies for the credit; seller reviews it on arrival.',
  steps: [
    {
      ask: 'The buyer wants to be sure goods meet spec. In the application it should…',
      choices: [
        {label: 'Require an independent inspection certificate as a document', ok: true},
        {label: 'Write “goods must be perfect” with no document', ok: false},
        {label: 'Attach the 40-page technical spec to the credit', ok: false},
      ],
      caption: 'Non-documentary conditions are ignored; attachments breed discrepancies.',
    },
    {
      ask: 'Goods will move in containers by road and sea. The credit asks for a marine on-board B/L from an inland depot. The seller should…',
      choices: [
        {label: 'Ask for an amendment to accept a multimodal transport document', ok: true},
        {label: 'Ship anyway and hope the bank accepts', ok: false},
        {label: 'Ignore it — banks never check transport documents', ok: false},
      ],
      caption: 'Do not accept terms you physically cannot meet.',
    },
    {
      ask: 'The buyer agrees the amendment by phone. Before shipping, the seller should…',
      choices: [
        {label: 'Confirm the formal amendment has been advised through the banks', ok: true},
        {label: 'Rely on the phone call', ok: false},
        {label: 'Edit the credit text itself', ok: false},
      ],
      caption: 'Only an amendment issued through the banks changes the credit.',
    },
  ],
};

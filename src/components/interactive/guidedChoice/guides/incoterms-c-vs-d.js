/** Guided: C-terms vs D-terms when cargo is lost. */

export default {
  title: 'C-terms vs D-terms',
  lead: 'Who is at risk if goods disappear after leaving the seller’s country?',
  steps: [
    {
      ask: 'Under CIF, after goods are loaded on board in good order…',
      choices: [
        {label: 'Transit risk is generally the buyer’s; seller already delivered', ok: true},
        {label: 'Seller must replace lost goods under the Incoterm alone', ok: false},
        {label: 'Risk stays with the seller until the quay at discharge', ok: false},
      ],
      caption: 'CIF is a shipment contract; insurance is the buyer’s main recovery path.',
    },
    {
      ask: 'Under DAP/DDP, if goods are destroyed in international transit…',
      choices: [
        {label: 'Seller may still be in breach of the delivery obligation', ok: true},
        {label: 'Buyer always pays the full price with no remedies', ok: false},
        {label: 'Incoterms® transfer title automatically to the carrier', ok: false},
      ],
      caption: 'D-terms are arrival contracts — seller risk runs to destination delivery.',
    },
    {
      ask: 'The named destination in a C-term mainly marks…',
      choices: [
        {label: 'How far the seller pays freight (and under CIF/CIP, insurance stretch)', ok: true},
        {label: 'Where title always passes under every national law', ok: false},
        {label: 'Where risk always ends for C-terms', ok: false},
      ],
      caption: 'C-terms have two critical points: risk at shipment, costs toward destination.',
    },
  ],
};

/** Guided: landed cost and DDP decisions for cross-border web shops. */

export default {
  title: 'Price the parcel',
  lead: 'Decide who pays duties and taxes, and how to show it.',
  steps: [
    {
      ask: 'Buyers in a new market keep refusing parcels when the courier asks for duties. Best fix?',
      choices: [
        {label: 'Sell DDP with an all-in landed price at checkout', ok: true},
        {label: 'Hide the duty warning in the terms', ok: false},
        {label: 'Undervalue the invoice so duty is lower', ok: false},
      ],
      caption: 'Doorstep surprises cause refusals; undervaluation is customs fraud.',
    },
    {
      ask: 'An EU-bound consignment is worth EUR 90. How can the seller avoid VAT being collected from the buyer at the door?',
      choices: [
        {label: 'Register for IOSS and charge VAT at checkout', ok: true},
        {label: 'Nothing is needed — goods under EUR 150 are VAT-free', ok: false},
        {label: 'Mark the parcel as a gift', ok: false},
      ],
      caption: 'Since July 2021 VAT is due on all EU imports.',
    },
    {
      ask: 'Duty is charged on the CIF value. Which items go into the duty base?',
      choices: [
        {label: 'Goods + international shipping + insurance', ok: true},
        {label: 'Goods only', ok: false},
        {label: 'Goods + VAT', ok: false},
      ],
      caption: 'VAT is usually computed after duty, on a base that includes the duty.',
    },
  ],
};

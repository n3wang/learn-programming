/** Guided: choosing a collaboration model. */

export default {
  title: 'Pick the collaboration model',
  lead: 'Match each situation to the right set-up.',
  steps: [
    {
      ask: 'A supplier wants to place a risky new product in stores without the retailer taking stock risk.',
      choices: [
        {label: 'Consignment — supplier owns and manages the stock', ok: true},
        {label: 'VMI', ok: false},
        {label: 'Buying third-party data', ok: false},
      ],
      caption: 'The supplier carries the financial risk.',
    },
    {
      ask: 'A retailer owns its stock but wants the supplier to handle replenishment using shared POS data.',
      choices: [
        {label: 'Vendor-managed inventory (VMI)', ok: true},
        {label: 'Consignment', ok: false},
        {label: 'No information', ok: false},
      ],
      caption: 'Customer owns; supplier manages.',
    },
    {
      ask: 'Two large partners want joint plans covering promotions, pricing, and stock targets.',
      choices: [
        {label: 'CPFR', ok: true},
        {label: 'Buying information', ok: false},
        {label: 'Order batching', ok: false},
      ],
      caption: 'The most advanced — and demanding — level of collaboration.',
    },
  ],
};

/** Guided: London gold market conventions. */

export default {
  title: 'London gold conventions',
  lead: 'Apply the wholesale market rules.',
  steps: [
    {
      ask: 'A refiner offers a 380 oz bar of 996 fineness with serial number, assay stamp, and year. Good Delivery?',
      choices: [
        {label: 'Yes — 350–430 oz and at least 995', ok: true},
        {label: 'No — bars must be exactly 400 oz', ok: false},
        {label: 'No — fineness must be 999.9', ok: false},
      ],
      caption: 'Most bars are near 400 oz, but 350–430 is allowed.',
    },
    {
      ask: 'A pension fund wants to own specific bars in case the custodian fails.',
      choices: [
        {label: 'Allocated account', ok: true},
        {label: 'Unallocated account', ok: false},
        {label: 'Deferred margin account', ok: false},
      ],
      caption: 'Allocated = segregated title; unallocated = unsecured claim.',
    },
    {
      ask: 'An auction round shows bids 60,000 oz and asks 95,000 oz.',
      choices: [
        {label: 'Lower the price and run another round', ok: true},
        {label: 'Set the price', ok: false},
        {label: 'Raise the price', ok: false},
      ],
      caption: 'Excess selling of 35,000 oz exceeds the 10,000 oz tolerance.',
    },
  ],
};

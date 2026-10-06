/** Guided: demand vs surety instruments and unfair calls. */

export default {
  title: 'Demand or surety?',
  lead: 'A contractor negotiates security for a large overseas project.',
  steps: [
    {
      ask: 'The employer insists on a performance bond “payable on first written demand”. This is…',
      choices: [
        {label: 'A demand instrument — independent of the contract', ok: true},
        {label: 'A surety bond — default must be proven', ok: false},
        {label: 'A commercial letter of credit', ok: false},
      ],
      caption: 'The payment trigger, not the title, decides.',
    },
    {
      ask: 'The contractor fears an unfair call. A realistic way to limit the damage is…',
      choices: [
        {label: 'Keep the demand amount small and add a larger conditional bond', ok: true},
        {label: 'Ask the bank to ignore demands it dislikes', ok: false},
        {label: 'Make the demand guarantee 50% of the price', ok: false},
      ],
      caption: 'Unfair-calling insurance and counter-guarantees can also help.',
    },
    {
      ask: 'Near expiry the employer writes “extend or pay”. Without clear fraud, the contractor…',
      choices: [
        {label: 'Usually has to agree to extend', ok: true},
        {label: 'Can let the guarantee lapse safely', ok: false},
        {label: 'Can cancel it unilaterally', ok: false},
      ],
      caption: 'Refusing typically means the bank pays.',
    },
  ],
};

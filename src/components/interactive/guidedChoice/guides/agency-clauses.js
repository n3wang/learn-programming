/** Guided: key clauses of an ICC-style agency contract. */

export default {
  title: 'Agency clause check',
  lead: 'Apply the ICC Model Commercial Agency approach.',
  steps: [
    {
      ask: 'The principal gives the customer a 2% cash discount after invoicing. Does the agent’s commission fall?',
      choices: [
        {label: 'No — commission is on the net invoice; later principal discounts do not reduce it', ok: true},
        {label: 'Yes, by 2%', ok: false},
        {label: 'Commission is cancelled', ok: false},
      ],
      caption: 'Discounts the agent itself grants do reduce the base.',
    },
    {
      ask: 'The agent registers the principal’s trademark in its own name locally. Under the ICC model this is…',
      choices: [
        {label: 'Prohibited', ok: true},
        {label: 'Required to protect the brand', ok: false},
        {label: 'Allowed after five years', ok: false},
      ],
      caption: 'The agent must also stop using the marks after termination.',
    },
    {
      ask: 'The agent agrees to cover customers’ bad debts. To balance it, the parties usually…',
      choices: [
        {label: 'Sign a del credere annex, raise commission, and/or cap the agent’s share', ok: true},
        {label: 'Leave it unwritten', ok: false},
        {label: 'Make the agent liable for 100% with no extra pay', ok: false},
      ],
      caption: 'Many laws limit del credere exposure.',
    },
  ],
};

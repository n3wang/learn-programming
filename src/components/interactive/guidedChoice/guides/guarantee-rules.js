/** Guided: choose URDG, URCB, or ISP98. */

export default {
  title: 'Which ICC rules?',
  lead: 'Pick the rule set that fits each instrument.',
  steps: [
    {
      ask: 'A bank issues a performance guarantee payable on demand with a statement of breach.',
      choices: [
        {label: 'URDG 758', ok: true},
        {label: 'URC 522', ok: false},
        {label: 'Incoterms® 2020', ok: false},
      ],
      caption: 'URDG is the market standard for demand guarantees.',
    },
    {
      ask: 'An insurer issues a bond payable only on a certificate of default from an independent engineer.',
      choices: [
        {label: 'URCB 524 (contract bonds)', ok: true},
        {label: 'UCP 600', ok: false},
        {label: 'ISP98', ok: false},
      ],
      caption: 'URCB suits conditional surety bonds.',
    },
    {
      ask: 'A bank issues a standby with monthly drawings over three years.',
      choices: [
        {label: 'ISP98 — avoids UCP rules on missed instalments and force majeure', ok: true},
        {label: 'UCP 600 without changes', ok: false},
        {label: 'URCG 325', ok: false},
      ],
      caption: 'Write “Subject to ISP98” in the standby.',
    },
  ],
};

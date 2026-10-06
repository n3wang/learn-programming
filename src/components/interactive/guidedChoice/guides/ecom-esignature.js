/** Guided: electronic contracts, documents and signatures. */

export default {
  title: 'Make it binding electronically',
  lead: 'Pick the right legal tool for an electronic deal.',
  steps: [
    {
      ask: 'A buyer argues an email order is invalid because a treaty requires contracts “in writing”. Which instrument helps most?',
      choices: [
        {label: 'UNCITRAL Electronic Communications Convention', ok: true},
        {label: 'The Madrid Protocol', ok: false},
        {label: 'URC 522', ok: false},
      ],
      caption: 'It lets electronic communications satisfy writing requirements.',
    },
    {
      ask: 'A trader wants an electronic bill of lading that can be transferred like paper. What must exist?',
      choices: [
        {label: 'A legal basis such as MLETR-based law plus a platform that ensures one controllable record', ok: true},
        {label: 'Any PDF scan emailed to the buyer', ok: false},
        {label: 'A typed signature', ok: false},
      ],
      caption: 'Transferability needs “control” of a unique record, not just a copy.',
    },
    {
      ask: 'You need proof that a contract was not altered after signing. Choose…',
      choices: [
        {label: 'A cryptographic digital signature', ok: true},
        {label: 'A typed name in an email', ok: false},
        {label: 'A scanned handwritten signature image', ok: false},
      ],
      caption: 'Digital signatures bind identity and integrity.',
    },
  ],
};

/** Guided: choosing among ICC non-arbitration services. */

export default {
  title: 'Pick the right ICC service',
  lead: 'Match each situation to DOCDEX, mediation, a dispute board, or an expert.',
  steps: [
    {
      ask: 'A bank rejected documents under a UCP credit and the parties disagree whether they complied.',
      choices: [
        {label: 'DOCDEX — fast, document-based expert decision', ok: true},
        {label: 'A dispute adjudication board', ok: false},
        {label: 'A mini-trial with executives', ok: false},
      ],
      caption: 'DOCDEX targets UCP, URC, URR, and URDG disputes.',
    },
    {
      ask: 'A three-year plant construction project needs disputes settled as they arise without stopping work.',
      choices: [
        {label: 'A standing dispute board set up at the start', ok: true},
        {label: 'Wait and arbitrate everything at the end', ok: false},
        {label: 'DOCDEX', ok: false},
      ],
      caption: 'Board members follow the project and act quickly.',
    },
    {
      ask: 'Before signing, a buyer wants an independent view on whether a machine design can reach rated capacity.',
      choices: [
        {label: 'Ask ICC to propose an expert', ok: true},
        {label: 'File a Request for Arbitration', ok: false},
        {label: 'Appoint an emergency arbitrator', ok: false},
      ],
      caption: 'Expert services work inside or outside a dispute.',
    },
  ],
};

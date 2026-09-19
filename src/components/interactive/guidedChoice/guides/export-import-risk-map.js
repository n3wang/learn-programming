/** Guided: map export–import risks to mitigations. */

export default {
  title: 'Export–import risk map',
  lead: 'Match each cross-border risk to a common control.',
  steps: [
    {
      ask: 'Greater distance and hand-offs raise which risk most directly?',
      choices: [
        {label: 'Transport damage / loss / theft', ok: true},
        {label: 'Domestic payroll tax', ok: false},
        {label: 'Local retail shelving fees', ok: false},
      ],
      caption: 'Carriers, B/Ls, and cargo insurance are the first line of defense.',
    },
    {
      ask: 'Hard-to-check foreign creditworthiness pushes exporters toward…',
      choices: [
        {label: 'Irrevocable documentary credits (and similar security)', ok: true},
        {label: 'Verbal handshake only', ok: false},
        {label: 'Skipping invoices', ok: false},
      ],
      caption: 'Banks examine documents; they do not guarantee goods quality.',
    },
    {
      ask: 'In a documentary sale, failing the paper pack can mean…',
      choices: [
        {label: 'Payment delay or refusal even if goods look fine', ok: true},
        {label: 'Automatic customs clearance', ok: false},
        {label: 'No effect if the container arrived', ok: false},
      ],
      caption: 'Buyers (and banks) may reject documents separately from rejecting goods.',
    },
  ],
};

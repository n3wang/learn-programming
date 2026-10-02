/** Guided: when arbitration's features help or hurt. */

export default {
  title: 'Arbitration: strengths and limits',
  lead: 'Weigh arbitration against litigation for specific concerns.',
  steps: [
    {
      ask: 'A company fears unfounded allegations becoming public. Which arbitration feature helps?',
      choices: [
        {label: 'Confidentiality — private hearings, no public record', ok: true},
        {label: 'Unlimited appeals', ok: false},
        {label: 'Mandatory local courts', ok: false},
      ],
      caption: 'Open court proceedings are public; arbitration usually is not.',
    },
    {
      ask: 'A counsel worries arbitration is too informal for a complex case. Best response?',
      choices: [
        {label: 'Agree procedural structure up front — transcripts, written records, document rules', ok: true},
        {label: 'Arbitration cannot be structured at all', ok: false},
        {label: 'Switch to expert opinion, which is binding', ok: false},
      ],
      caption: 'Arbitration is flexible — parties can buy the rigour they need.',
    },
    {
      ask: 'The tribunal makes an error on the merits. The losing party can usually…',
      choices: [
        {label: 'Challenge the award only on narrow grounds — no full appeal', ok: true},
        {label: 'Appeal to a higher court on the merits as of right', ok: false},
        {label: 'Ignore the award', ok: false},
      ],
      caption: 'Finality saves time and money but removes the safety net of appeal.',
    },
  ],
};

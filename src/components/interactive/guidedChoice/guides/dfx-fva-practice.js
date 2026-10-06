/** Guided: FVA best practices. */

export default {
  title: 'FVA in practice',
  lead: 'Apply lessons from research on judgmental adjustments.',
  steps: [
    {
      ask: 'Planners spend hours making ±1% edits.',
      choices: [
        {label: 'Stop — small tweaks rarely add value', ok: true},
        {label: 'Encourage more', ok: false},
        {label: 'Only allow +1% edits', ok: false},
      ],
      caption: 'They sit within the error margin.',
    },
    {
      ask: 'Upward edits mostly reduce accuracy; downward edits mostly help.',
      choices: [
        {label: 'Track them separately and share the evidence', ok: true},
        {label: 'Ignore it', ok: false},
        {label: 'Ban downward edits', ok: false},
      ],
      caption: 'Exposes optimism bias.',
    },
    {
      ask: 'Management wants bonuses tied to an accuracy target.',
      choices: [
        {label: 'Use benchmark-based targets to discuss and improve, not to reward and punish', ok: true},
        {label: 'Set an arbitrary 90% target with bonuses', ok: false},
        {label: 'Let teams choose their own lag and exclusions', ok: false},
      ],
      caption: 'Pressure invites metric hacking.',
    },
  ],
};

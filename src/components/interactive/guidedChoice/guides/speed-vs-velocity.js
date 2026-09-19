/** Guided: speed |v| vs velocity — when speed increases. */

export default {
  title: 'When is speed increasing?',
  lead: 'Speed |v| rises when v and a have the same sign.',
  steps: [
    {
      ask: 'If v < 0 and a > 0, then v is increasing (toward 0), so speed |v| is…',
      choices: [
        {label: 'Decreasing', ok: true},
        {label: 'Increasing', ok: false},
        {label: 'Constant', ok: false},
      ],
      caption: 'Negative velocity becoming less negative → slower.',
    },
    {
      ask: 'If v < 0 and a < 0, speed is…',
      choices: [
        {label: 'Increasing (more negative ⇒ larger |v|)', ok: true},
        {label: 'Decreasing', ok: false},
        {label: 'Undefined', ok: false},
      ],
      caption: 'Same-sign v and a ⇒ speeding up.',
    },
    {
      ask: 'If v > 0 and a > 0, speed is…',
      choices: [
        {label: 'Increasing', ok: true},
        {label: 'Decreasing', ok: false},
        {label: 'Zero', ok: false},
      ],
      caption: 'Classic “speeding up while going right.”',
    },
  ],
};

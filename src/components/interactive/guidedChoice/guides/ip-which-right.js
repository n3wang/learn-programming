/** Guided: matching assets to IP rights. */

export default {
  title: 'Which right protects it?',
  lead: 'Match each asset to the best form of protection.',
  steps: [
    {
      ask: 'A new, non-obvious mechanism inside a pump.',
      choices: [
        {label: 'Patent', ok: true},
        {label: 'Copyright', ok: false},
        {label: 'Trademark', ok: false},
      ],
      caption: 'File before showing it publicly to keep novelty.',
    },
    {
      ask: 'The distinctive shape and look of a chair.',
      choices: [
        {label: 'Industrial design', ok: true},
        {label: 'Trade secret', ok: false},
        {label: 'Domain name', ok: false},
      ],
      caption: 'Registered EU designs last up to 25 years.',
    },
    {
      ask: 'A recipe that cannot be reverse-engineered from the product.',
      choices: [
        {label: 'Trade secret, with NDAs and access controls', ok: true},
        {label: 'Patent — it must be published anyway', ok: false},
        {label: 'Copyright', ok: false},
      ],
      caption: 'Secrecy can last indefinitely; a patent expires after 20 years and discloses it.',
    },
  ],
};

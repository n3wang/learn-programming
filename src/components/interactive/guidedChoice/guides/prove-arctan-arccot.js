/** Guided: arctan x + arccot x = π/2. */

export default {
  title: 'Proof — arctan + arccot = π/2',
  lead: 'Same strategy as arcsin + arccos.',
  steps: [
    {
      ask: 'Dₓ(arctan x + arccot x) equals…',
      choices: [
        {label: '0', ok: true},
        {label: '2/(1+x²)', ok: false},
        {label: '1', ok: false},
      ],
      caption: '1/(1+x²) − 1/(1+x²) = 0.',
    },
    {
      ask: 'Evaluate at x = 0 to name the constant…',
      choices: [
        {label: 'arctan 0 + arccot 0 = 0 + π/2 = π/2', ok: true},
        {label: 'Equals 0', ok: false},
        {label: 'Equals π', ok: false},
      ],
      caption: 'arccot 0 = π/2 on (0,π).',
    },
  ],
};

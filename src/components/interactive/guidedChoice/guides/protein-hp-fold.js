/** HP self-avoiding walk energy E = -ε f — equation picks. */

export default {
  title: 'HP protein folding energy',
  lead:
    'A self-avoiding lattice walk drops H and P monomers. Pick the energy formulas among lookalikes.',
  steps: [
    {
      ask: 'The toy HP energy is written as…',
      choices: [
        {
          label: '$\\displaystyle E=-\\varepsilon f$',
          ok: true,
        },
        {
          label: '$\\displaystyle E=+\\varepsilon f$',
          ok: false,
        },
        {
          label: '$\\displaystyle E=\\varepsilon N$ (chain length only)',
          ok: false,
        },
      ],
      caption:
        'The walk may only step to empty neighbor sites; it stops when the tip is boxed in.',
    },
    {
      ask: 'The contact count $f$ that lowers energy is…',
      choices: [
        {
          label:
            '$\\displaystyle f=\\#\\{\\text{nonbonded H–H lattice neighbors}\\}$',
          ok: true,
        },
        {
          label: '$\\displaystyle f=N$ (every monomer counts once)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle f=\\#\\{\\text{P monomers}\\}$ only',
          ok: false,
        },
      ],
      caption:
        'Backbone-adjacent H–H links do not count — only topological H–H contacts.',
    },
    {
      ask: 'Natural candidate folds for a fixed HP sequence therefore satisfy…',
      choices: [
        {
          label: '$\\displaystyle \\max f\\quad\\Leftrightarrow\\quad\\min E$',
          ok: true,
        },
        {
          label: '$\\displaystyle \\min f\\quad\\Leftrightarrow\\quad\\min E$',
          ok: false,
        },
        {
          label: '$\\displaystyle f\\equiv 0$ for every compact fold',
          ok: false,
        },
      ],
      caption:
        'The toy model is crude, but compact H cores are the right qualitative target.',
    },
  ],
};

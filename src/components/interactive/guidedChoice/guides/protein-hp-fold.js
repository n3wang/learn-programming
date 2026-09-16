/** HP self-avoiding walk energy E = -ε f. */

export default {
  title: 'HP protein folding energy',
  lead: 'A self-avoiding lattice walk drops hydrophobic (H) and polar (P) monomers. Which contacts lower the energy?',
  steps: [
    {
      caption: 'The walk may only step to empty neighbor sites. It stops when the tip is boxed in. H monomers are drawn more often than P.',
    },
    {
      ask: 'With $E=-\\varepsilon f$, the count $f$ is…',
      choices: [
        {label: 'the number of non-bonded H–H neighbor pairs (P–P and H–P do not help)', ok: true},
        {label: 'the total chain length $N$', ok: false},
        {label: 'the number of P monomers only', ok: false},
      ],
      caption: 'Backbone-adjacent H–H links do not count — only “topological” H–H contacts that are neighbors on the lattice but not consecutive in the sequence.',
    },
    {
      ask: 'Natural candidate folds for a fixed HP sequence are those that…',
      choices: [
        {label: 'maximize $f$ (minimize $E$)', ok: true},
        {label: 'minimize $f$', ok: false},
        {label: 'always form a straight line', ok: false},
      ],
      caption: 'The toy model is crude, but compact H cores are the right qualitative target.',
    },
  ],
};

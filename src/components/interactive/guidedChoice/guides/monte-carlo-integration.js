/** Monte Carlo integration: stone throwing, π, and 1/√N error. */

export default {
  title: 'Monte Carlo integration',
  lead: 'No mesh, no antiderivative — only uniform samples and a membership or average.',
  steps: [
    {
      caption:
        'Pond area: throw stones uniformly into a known box. $A_{\\mathrm{pond}}\\simeq (N_{\\mathrm{pond}}/N)\\,A_{\\mathrm{box}}$.',
    },
    {
      ask: 'Unit disk in $[-1,1]^{2}$ (box area 4). The estimator for $\\pi$ is…',
      choices: [
        {label: '$4\\times$ (hits$/N$)', ok: true},
        {label: 'hits$/N$ with no factor', ok: false},
        {label: 'Simpson on the circumference', ok: false},
      ],
      caption: 'Hit fraction estimates $\\pi/4$, so multiply by 4.',
    },
    {
      ask: 'On a log–log plot of $|E|$ vs $N$, crude Monte Carlo typically shows slope…',
      choices: [
        {label: 'about $-1/2$ (error $\\sim 1/\\sqrt{N}$)', ok: true},
        {label: 'about $-4$ like Simpson', ok: false},
        {label: 'exactly zero — MC has no error', ok: false},
      ],
      caption:
        'In 1D, trap/Simpson/Gauss usually win until round-off floors the curve. High $D$ flips the comparison.',
    },
  ],
};

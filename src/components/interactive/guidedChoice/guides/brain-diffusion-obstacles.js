/** Obstructions change effective diffusion D ~ R_rms² / (2 d t). */

export default {
  title: 'Diffusion with obstacles',
  lead: 'Brain tissue is not empty space: extracellular pockets act like barriers. How should $R_{\\mathrm{rms}}$ and $D$ change?',
  steps: [
    {
      caption: 'Fifty free walks look like ordinary diffusion. Circular obstacles carve out forbidden disks — walks that stop or bounce cover less ground.',
    },
    {
      ask: 'Compared with free space, rigid obstacles that stop or deflect steps should…',
      choices: [
        {label: 'decrease $R_{\\mathrm{rms}}$ and therefore decrease the effective $D\\propto R_{\\mathrm{rms}}^{2}/(2dt)$', ok: true},
        {label: 'increase $R_{\\mathrm{rms}}$ because paths become longer', ok: false},
        {label: 'leave $D$ unchanged by Einstein’s formula', ok: false},
      ],
      caption: 'Less net spread in the same number of steps → smaller effective diffusion coefficient.',
    },
    {
      ask: 'Einstein’s estimate in $d$ dimensions is…',
      choices: [
        {label: '$D \\simeq R_{\\mathrm{rms}}^{2}/(2 d t)$ with $t$ the walk duration', ok: true},
        {label: '$D \\simeq R_{\\mathrm{rms}}/t$ only', ok: false},
        {label: '$D \\simeq N$ regardless of obstacles', ok: false},
      ],
      caption: 'Same $t$ and $d$: the fractional drop in $R_{\\mathrm{rms}}^{2}$ is the fractional drop in $D$.',
    },
  ],
};

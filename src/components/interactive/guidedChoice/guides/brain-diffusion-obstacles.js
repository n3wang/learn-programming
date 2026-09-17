/** Obstructions change effective diffusion D ~ R_rms² / (2 d t) — equation picks. */

export default {
  title: 'Diffusion with obstacles',
  lead:
    'Brain tissue is not empty space. Pick how $R_{\\mathrm{rms}}$ and $D$ change among lookalike formulas.',
  steps: [
    {
      ask: 'Einstein’s estimate of the diffusion coefficient in $d$ dimensions is…',
      choices: [
        {
          label:
            '$\\displaystyle D\\simeq\\dfrac{R_{\\mathrm{rms}}^{2}}{2 d t}$',
          ok: true,
        },
        {
          label: '$\\displaystyle D\\simeq\\dfrac{R_{\\mathrm{rms}}}{t}$',
          ok: false,
        },
        {
          label: '$\\displaystyle D\\simeq N$ (independent of $R_{\\mathrm{rms}}$)',
          ok: false,
        },
      ],
      caption:
        'Same $t$ and $d$: the fractional drop in $R_{\\mathrm{rms}}^{2}$ is the fractional drop in $D$.',
    },
    {
      ask: 'Rigid obstacles that stop or deflect steps, at fixed walk duration, should…',
      choices: [
        {
          label:
            '$\\displaystyle R_{\\mathrm{rms}}\\downarrow\\;\\Rightarrow\\; D\\propto R_{\\mathrm{rms}}^{2}\\downarrow$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle R_{\\mathrm{rms}}\\uparrow\\;\\Rightarrow\\; D\\uparrow$ (longer paths)',
          ok: false,
        },
        {
          label:
            '$\\displaystyle D\\equiv\\mathrm{const}$ even if $R_{\\mathrm{rms}}$ falls',
          ok: false,
        },
      ],
      caption:
        'Less net spread in the same number of steps → smaller effective diffusion coefficient.',
    },
    {
      ask: 'Comparing obstructed vs free walks at the same $t,d$, a useful ratio is…',
      choices: [
        {
          label:
            '$\\displaystyle\\dfrac{D_{\\mathrm{obs}}}{D_{\\mathrm{free}}}\\simeq\\dfrac{R_{\\mathrm{rms,obs}}^{2}}{R_{\\mathrm{rms,free}}^{2}}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\dfrac{D_{\\mathrm{obs}}}{D_{\\mathrm{free}}}\\simeq\\dfrac{R_{\\mathrm{rms,free}}}{R_{\\mathrm{rms,obs}}}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\dfrac{D_{\\mathrm{obs}}}{D_{\\mathrm{free}}}\\simeq N_{\\mathrm{obs}}-N_{\\mathrm{free}}$',
          ok: false,
        },
      ],
      caption:
        'Fifty free walks look like ordinary diffusion; circular obstacles carve out forbidden disks.',
    },
  ],
};

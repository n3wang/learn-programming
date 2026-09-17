/** Importance sampling ⟨f/w⟩_w and von Neumann rejection — pick the equation. */

export default {
  title: 'Importance sampling',
  lead:
    'Reweight the measure, then sample $w$ by rejection or inverse CDF. Pick the matching equation.',
  steps: [
    {
      ask: 'Rewrite $I=\\int f$ against a normalized weight $w$ as…',
      choices: [
        {
          label:
            '$\\displaystyle I=\\int w(x)\\,\\frac{f(x)}{w(x)}\\,\\mathrm{d}x=\\Biggl\\langle\\frac{f}{w}\\Biggr\\rangle_w$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle I=\\int w(x)\\,f(x)\\,\\mathrm{d}x=\\langle f\\rangle_w$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle I=\\int \\frac{w(x)}{f(x)}\\,\\mathrm{d}x=\\Biggl\\langle\\frac{w}{f}\\Biggr\\rangle$',
          ok: false,
        },
      ],
      caption: 'Average $f/w$ under samples drawn from $w$, not under uniform measure.',
    },
    {
      ask: 'Choose $w$ to flatten the ratio. Which target relation?',
      choices: [
        {
          label:
            '$\\displaystyle w(x)\\propto f(x)\\quad\\Rightarrow\\quad \\frac{f}{w}\\approx\\mathrm{const}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle w(x)\\propto \\frac{1}{f(x)}\\quad\\Rightarrow\\quad \\frac{f}{w}\\approx\\mathrm{const}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle w(x)\\propto f(x)^{2}\\quad\\Rightarrow\\quad f/w=f$',
          ok: false,
        },
      ],
      caption: 'Uniform sampling is the special case $w=\\mathrm{const}$.',
    },
    {
      ask: 'von Neumann throws a point in a box of height $w_0$. Which sampling formula?',
      choices: [
        {
          label: '$(x,W)=(U,\\,w_0 V)$ with independent uniforms $U,V$',
          ok: true,
        },
        {
          label: '$(x,W)=(U,\\,V/w_0)$ with independent uniforms $U,V$',
          ok: false,
        },
        {
          label: '$(x,W)=(w_0 U,\\,V)$',
          ok: false,
        },
      ],
      caption: 'Accept the abscissa when the throw lands under the curve.',
    },
    {
      ask: 'Accept the throw when…',
      choices: [
        {label: '$W\\le w(x)$', ok: true},
        {label: '$W\\ge w(x)$', ok: false},
        {label: '$W\\le w_0$ always (never reject)', ok: false},
      ],
      caption:
        'Accepted abscissae follow $w$. Acceptance rate = area under $w$ over box area.',
    },
    {
      ask: 'For $w(x)=2(1-x)$ on $[0,1]$, the inverse-CDF map $u\\mapsto x$ is…',
      choices: [
        {label: '$\\displaystyle x=1-\\sqrt{1-u}$', ok: true},
        {label: '$\\displaystyle x=1-\\sqrt{u}$', ok: false},
        {label: '$\\displaystyle x=\\sqrt{1-u}$', ok: false},
      ],
      caption:
        'Then estimate $(1/N)\\sum e^{-x}/w(x)$. Metropolis (Ch 17) is the later route when a tight box is awkward.',
    },
  ],
};

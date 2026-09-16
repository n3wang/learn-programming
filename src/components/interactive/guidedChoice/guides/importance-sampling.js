/** Importance sampling and von Neumann rejection. */

export default {
  title: 'Importance sampling',
  lead: 'Sample from a weight w≈f and average the flattened ratio f/w.',
  steps: [
    {
      caption:
        'Rewrite $I=\\int w\\,(f/w)=\\langle f/w\\rangle$ with $x\\sim w$. Choose $w\\propto f$ so $f/w$ is nearly constant and variance drops.',
    },
    {
      ask: 'von Neumann rejection keeps a throw $(x,W)=(U,w_0 V)$ when…',
      choices: [
        {label: '$W\\le w(x)$ (point under the curve inside the box)', ok: true},
        {label: '$W>w_0$ always', ok: false},
        {label: 'only if $f(x)=0$', ok: false},
      ],
      caption:
        'Accepted abscissae follow $w$. Acceptance rate = area under $w$ over box area. Metropolis (Ch 17) is the later route when a tight box is awkward.',
    },
    {
      ask: 'For $w(x)=2(1-x)$ on $[0,1]$, the inverse-CDF map is…',
      choices: [
        {label: '$x=1-\\sqrt{1-u}$', ok: true},
        {label: '$x=u^{2}$', ok: false},
        {label: '$x=2u-1$', ok: false},
      ],
      caption:
        'Then estimate $(1/N)\\sum e^{-x}/w(x)$. Labs also count accept/reject under $w(x)=2x$ with $w_0=2$.',
    },
  ],
};

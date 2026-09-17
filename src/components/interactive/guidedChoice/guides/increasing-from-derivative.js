/** Guided beats: sign of f′ ⇒ monotone. */

export default {
  title: 'Increasing and decreasing from f′',
  lead: 'Connect the sign of the derivative to whether the graph goes up or down.',
  steps: [
    {
      ask: '“$f$ is increasing on an interval” means…',
      choices: [
        {
          label: '$u<v$ in the interval $\\Rightarrow$ $f(u)<f(v)$',
          ok: true,
        },
        {
          label: '$f\'(x)=0$ at every point',
          ok: false,
        },
        {
          label: '$f$ has a relative maximum somewhere',
          ok: false,
        },
      ],
      caption: 'Strict inequality for every ordered pair in the interval.',
    },
    {
      ask: 'If $f\'>0$ on an interval, MVT between $u<v$ gives…',
      choices: [
        {
          label: '$f(v)-f(u)=f\'(c)(v-u)>0$, so $f(v)>f(u)$',
          ok: true,
        },
        {
          label: '$f(v)-f(u)<0$ always',
          ok: false,
        },
        {
          label: '$f$ must be constant',
          ok: false,
        },
      ],
      caption: 'Positive instantaneous rates force a positive net change.',
    },
    {
      ask: 'Likewise, $f\'<0$ on an interval implies…',
      choices: [
        {
          label: '$f$ is decreasing there',
          ok: true,
        },
        {
          label: '$f$ is increasing there',
          ok: false,
        },
        {
          label: 'Rolle’s theorem fails',
          ok: false,
        },
      ],
      caption: 'Theorem 13.7 is the workhorse for sketching and optimization setups.',
    },
  ],
};

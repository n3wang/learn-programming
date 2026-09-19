/** Guided proof: Dₓ(sin x) = cos x from (17.1)–(17.2). */

export default {
  title: 'Proof — Dₓ(sin x) = cos x',
  lead: 'Difference quotient + addition formula + key limits.',
  steps: [
    {
      ask: 'With y = sin x, Δy = sin(x+Δx) − sin x expands to…',
      choices: [
        {
          label: 'cos x · sin Δx + sin x · (cos Δx − 1)',
          ok: true,
        },
        {label: 'sin x · sin Δx only', ok: false},
        {label: 'cos(x+Δx) − cos x', ok: false},
      ],
      caption: 'sin(x+Δx) = sin x cos Δx + cos x sin Δx.',
    },
    {
      ask: 'Δy/Δx splits as…',
      choices: [
        {
          label: 'cos x · (sin Δx)/Δx + sin x · (cos Δx − 1)/Δx',
          ok: true,
        },
        {label: 'sin x · (sin Δx)/Δx only', ok: false},
        {label: 'sec² x', ok: false},
      ],
      caption: 'Factor cos x and sin x out of the two terms.',
    },
    {
      ask: 'lim Δx→0 (sin Δx)/Δx and lim (cos Δx − 1)/Δx equal…',
      choices: [
        {label: '1 and 0', ok: true},
        {label: '0 and 1', ok: false},
        {label: '1 and 1', ok: false},
      ],
      caption: '(17.1) and (17.2) with θ = Δx (note cos−1 = −(1−cos)).',
    },
    {
      ask: 'Therefore dy/dx equals…',
      choices: [
        {label: 'cos x', ok: true},
        {label: '−sin x', ok: false},
        {label: 'sec² x', ok: false},
      ],
      caption: '(cos x)(1) + (sin x)(0) = cos x.',
    },
  ],
};

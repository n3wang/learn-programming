/** Square-well matching: pick each identity in the even/odd residual chain. */

export default {
  title: 'Square-well matching equations',
  lead: 'Build the residual $g(E)=0$ one equation at a time — pick among lookalikes.',
  steps: [
    {
      ask: 'Inside the well, with book units, the wave number related to binding is…',
      choices: [
        {label: '$\\kappa=\\sqrt{V_0-E}$', ok: true},
        {label: '$\\kappa=\\sqrt{E-V_0}$', ok: false},
        {label: '$\\kappa=V_0-E$', ok: false},
      ],
      caption: 'Bound energies sit below $V_0$; $\\kappa$ is real and positive.',
    },
    {
      ask: 'Even-parity matching at the wall is often written…',
      choices: [
        {
          label: '$\\sqrt{V_0-E}\\,\\tan\\sqrt{V_0-E}=\\sqrt{E}$',
          ok: true,
        },
        {
          label: '$\\sqrt{V_0-E}\\,\\cot\\sqrt{V_0-E}=\\sqrt{E}$',
          ok: false,
        },
        {
          label: '$\\sqrt{E}\\,\\tan\\sqrt{V_0-E}=\\sqrt{V_0-E}$ (swapped sides only — wrong)',
          ok: false,
        },
      ],
      caption: 'Odd states use $\\cot$ instead of $\\tan$.',
    },
    {
      ask: 'An even residual that avoids some $\\tan$ poles is…',
      choices: [
        {
          label: '$g(E)=\\sqrt{E}\\,\\cot\\sqrt{V_0-E}-\\sqrt{V_0-E}$',
          ok: true,
        },
        {
          label: '$g(E)=\\sqrt{E}\\,\\tan\\sqrt{V_0-E}-\\sqrt{V_0-E}$',
          ok: false,
        },
        {label: '$g(E)=E-V_0$', ok: false},
      ],
      caption: 'Same zeros as the $\\tan$ form (away from poles). Use $\\cot=\\cos/\\sin$.',
    },
    {
      ask: 'The odd-parity companion residual (same spirit) replaces $\\cot$ with…',
      choices: [
        {
          label: 'a $\\tan$-based matching (or $g_{\\mathrm{odd}}$ with $\\tan$)',
          ok: true,
        },
        {label: 'the identical even residual for every parity', ok: false},
        {label: '$g(E)=0$ with no trig at all', ok: false},
      ],
      caption:
        'Root finders need a sign-change bracket (e.g. $[8.0,8.8]$ for $V_0=10$ even).',
    },
  ],
};

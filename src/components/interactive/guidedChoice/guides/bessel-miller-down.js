/** Miller downward recursion for spherical Bessel. */

export default {
  title: 'Downward j_ℓ',
  lead: 'You need $j_{\\ell}(x)$ for many $\\ell$ at fixed $x$. Upward recurrence from $j_0,j_1$ looks easy — and then dies.',
  steps: [
    {
      caption: 'Both $j_{\\ell}$ and $n_{\\ell}$ obey the same three-term recurrence. Finite precision mixes a speck of $n_{\\ell}$ into every upward step.',
    },
    {
      ask: 'Why does upward recurrence fail once $j_{\\ell}$ is much smaller than $n_{\\ell}$?',
      choices: [
        {label: 'Subtractive cancellation: large − large → small, then small − small with huge relative error', ok: true},
        {label: 'IEEE double cannot store $\\sin x$', ok: false},
        {label: 'The recurrence is only valid for even $\\ell$', ok: false},
      ],
      caption: 'You are manufacturing a tiny $j_{\\ell}$ from nearly equal large numbers — classic cancellation into Neumann garbage.',
    },
    {
      ask: 'Miller’s fix is to…',
      choices: [
        {label: 'start at large $L$ with arbitrary seeds, recur downward, then rescale so $j_0=\\sin x/x$', ok: true},
        {label: 'always use upward but with quadruple precision only', ok: false},
        {label: 'replace $j_{\\ell}$ by $n_{\\ell}$ for $\\ell>2$', ok: false},
      ],
      caption: 'Downward steps add small → larger, so errors shrink. Absolute scale is fixed by the known $j_0$.',
    },
  ],
};

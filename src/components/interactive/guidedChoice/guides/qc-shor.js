/** Shor: modular U and period from phase — thin equation picks. */

export default {
  title: 'Shor factoring',
  lead:
    'Modular multiply unitary, then read the period from QPE. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'The modular-multiplication unitary (for $r$ coprime to $N$) acts as…',
      choices: [
        {
          label: '$\\displaystyle U|y\\rangle=|r\\,y\\bmod N\\rangle$',
          ok: true,
        },
        {
          label: '$\\displaystyle U|y\\rangle=|y+r\\bmod N\\rangle$',
          ok: false,
        },
        {
          label: '$\\displaystyle U|y\\rangle=|y\\rangle$ for every $y$ (identity)',
          ok: false,
        },
      ],
      caption:
        'Eigenstates $|u_S\\rangle$ carry phases $e^{2\\pi i S/T}$. QPE + inverse QFT estimate $\\phi=S/T$.',
    },
    {
      ask: 'If QPE returns $\\phi=0.25$ on a successful $N=15$ run, a natural period candidate is…',
      choices: [
        {
          label: '$\\displaystyle T=1/\\phi=4$',
          ok: true,
        },
        {
          label: '$\\displaystyle T=\\phi=0.25$',
          ok: false,
        },
        {
          label: '$\\displaystyle T=N=15$',
          ok: false,
        },
      ],
      caption:
        'Then $\\gcd(r^{T/2}\\pm 1,\\,N)$ — e.g. $r=8$, $T=4$ → factors $3$ and $5$. Retry if $T$ is odd or $r^{T/2}\\equiv-1\\pmod N$.',
    },
  ],
};

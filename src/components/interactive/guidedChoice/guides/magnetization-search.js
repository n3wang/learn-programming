/** Mean-field magnetization via root search on m = tanh(m/t) — equation picks. */

export default {
  title: 'Magnetization search',
  lead:
    'You already have $m=\\tanh(m/t)$. Turn it into a curve $m(t)$ — pick the matching equation at each step.',
  steps: [
    {
      ask: 'At fixed reduced temperature $t_i$, the root you hunt is…',
      choices: [
        {
          label: '$\\displaystyle f(m,t_i)=m-\\tanh(m/t_i)=0$',
          ok: true,
        },
        {
          label: '$\\displaystyle f(m,t_i)=m+\\tanh(m/t_i)=0$',
          ok: false,
        },
        {
          label: '$\\displaystyle f(m,t_i)=\\tanh(t_i)-m^{2}=0$',
          ok: false,
        },
      ],
      caption:
        'Same trial-and-error idea as the square-well energies: $m$ still sits on both sides.',
    },
    {
      ask: 'Besides the trivial root $m=0$, a nontrivial ordered branch $m>0$ exists when…',
      choices: [
        {
          label: '$\\displaystyle t<1\\quad\\bigl(T<T_c\\bigr)$',
          ok: true,
        },
        {
          label: '$\\displaystyle t>1\\quad\\bigl(T>T_c\\bigr)$ only',
          ok: false,
        },
        {
          label: '$\\displaystyle t=\\infty$ for every nonzero $m$',
          ok: false,
        },
      ],
      caption:
        'At $t=0.5$ the nontrivial zero sits near $m\\approx 0.9575$. For $t\\ge 1$ only $m=0$ remains.',
    },
    {
      ask: 'A practical recipe that builds the curve $m(t)$ is…',
      choices: [
        {
          label:
            '$\\displaystyle\\bigl\\{(t_i,m_i):\\; f(m_i,t_i)=0\\bigr\\}_{i}$ on a $t$-grid',
          ok: true,
        },
        {
          label: '$\\displaystyle m(t)=\\mathrm{artanh}(t)$ in closed form',
          ok: false,
        },
        {
          label: '$\\displaystyle m(t)=t$ for every temperature',
          ok: false,
        },
      ],
      caption:
        'Newton is faster with a close start; bisection is safer when you only know a sign-change bracket.',
    },
  ],
};

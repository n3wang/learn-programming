/** Sine Taylor: recursive term ratio and stop rule — pick the equation. */

export default {
  title: 'Summing sine',
  lead:
    'Finite sine series needs a recurrence and a stop. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'The finite recipe for $\\sin x$ (stop at $N$ terms) is…',
      choices: [
        {
          label:
            '$\\displaystyle\\sin x\\simeq\\sum_{n=1}^{N}\\frac{(-1)^{n-1}x^{2n-1}}{(2n-1)!}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\sin x\\simeq\\sum_{n=1}^{N}\\frac{(-1)^{n}x^{2n}}{(2n)!}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\sin x\\simeq\\sum_{n=1}^{N}\\frac{x^{2n-1}}{(2n-1)!}$ (all positive)',
          ok: false,
        },
      ],
      caption: 'Do not form each power and factorial from scratch.',
    },
    {
      ask: 'Neighbouring terms obey which one-step recurrence ($t_1=x$)?',
      choices: [
        {
          label:
            '$\\displaystyle t_n=\\frac{-x^{2}}{(2n-1)(2n-2)}\\,t_{n-1}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle t_n=\\frac{+x^{2}}{(2n-1)(2n-2)}\\,t_{n-1}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle t_n=\\frac{-x^{2}}{(2n+1)(2n)}\\,t_{n-1}$',
          ok: false,
        },
      ],
      caption: 'One multiply per step — no factorial, no giant intermediate.',
    },
    {
      ask: 'A stop rule that does not peek at a table is…',
      choices: [
        {
          label: '$\\displaystyle\\left|\\frac{t_n}{S_n}\\right|<\\varepsilon$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\left|\\frac{t_n}{S_n}\\right|>\\varepsilon$',
          ok: false,
        },
        {
          label: '$\\displaystyle|t_n-S_n|<\\varepsilon$',
          ok: false,
        },
      ],
      caption:
        'While round-off is small, the last term is a usable proxy for the leftover. Keep $\\varepsilon$ above machine precision.',
    },
  ],
};

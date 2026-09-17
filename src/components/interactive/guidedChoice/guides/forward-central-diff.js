/** Forward/central difference: pick the lookalike formula at each Taylor step. */

export default {
  title: 'Finite-difference derivation',
  lead:
    'Sentence → equation: at each step pick the formula that matches (lookalikes included).',
  steps: [
    {
      ask: 'The hostile calculus definition we must approximate is…',
      choices: [
        {
          label: "$\\dfrac{dy}{dt}=\\lim_{h\\to 0}\\dfrac{y(t+h)-y(t)}{h}$",
          ok: true,
        },
        {
          label: "$\\dfrac{dy}{dt}=\\lim_{h\\to 0}\\dfrac{y(t+h)+y(t)}{h}$",
          ok: false,
        },
        {
          label: "$\\dfrac{dy}{dt}=\\lim_{h\\to\\infty} h\\,y(t)$",
          ok: false,
        },
      ],
      caption: 'Tiny $h$ cancels the numerator into $\\varepsilon_m$ while dividing by $h$ blows up.',
    },
    {
      ask: 'Taylor one step ahead rearranges to…',
      choices: [
        {
          label:
            "$\\dfrac{y(t+h)-y(t)}{h}=y'(t)+\\dfrac{h}{2}y''(t)+O(h^{2})$",
          ok: true,
        },
        {
          label:
            "$\\dfrac{y(t+h)-y(t)}{h}=y'(t)-\\dfrac{h}{2}y''(t)$ only (exact for all $y$)",
          ok: false,
        },
        {
          label:
            "$\\dfrac{y(t+h)+y(t)}{h}=y'(t)+\\dfrac{h}{2}y''(t)$",
          ok: false,
        },
      ],
      caption: 'Drop the $O(h)$ remainder to get a usable finite-$h$ rule.',
    },
    {
      ask: 'The forward-difference formula is therefore…',
      choices: [
        {
          label: "$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{fd}}=\\dfrac{y(t+h)-y(t)}{h}$",
          ok: true,
        },
        {
          label: "$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{fd}}=\\dfrac{y(t+h)+y(t)}{2h}$",
          ok: false,
        },
        {
          label: "$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{fd}}=h\\bigl(y(t+h)-y(t)\\bigr)$",
          ok: false,
        },
      ],
      caption: 'Chord from $t$ to $t+h$. Leading truncation error typically $O(h)$.',
    },
    {
      ask: 'The central-difference formula is…',
      choices: [
        {
          label:
            "$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{cd}}=\\dfrac{y(t+h/2)-y(t-h/2)}{h}$",
          ok: true,
        },
        {
          label:
            "$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{cd}}=\\dfrac{y(t+h)-y(t)}{h}$",
          ok: false,
        },
        {
          label:
            "$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{cd}}=\\dfrac{y(t+h)+y(t-h)}{h}$",
          ok: false,
        },
      ],
      caption:
        'Even powers of $h$ cancel → leading error $O(h^{2})$. On $y=a+bt^{2}$ central is exact for every $h$.',
    },
  ],
};

/** Trapezoid and Simpson composite weights — pick the equation. */

export default {
  title: 'Trapezoid and Simpson weights',
  lead:
    'Equal panels of width $h$. Pick the matching weighted-sum formula at each step.',
  steps: [
    {
      ask: 'On one panel, the trapezoid (chord) rule is…',
      choices: [
        {
          label: '$\\displaystyle\\frac{h}{2}(f_i+f_{i+1})$',
          ok: true,
        },
        {
          label: '$\\displaystyle h(f_i+f_{i+1})$',
          ok: false,
        },
        {
          label: '$\\displaystyle\\frac{h}{2}(f_i-f_{i+1})$',
          ok: false,
        },
      ],
      caption: 'Stitch $N$ panels: interior points are shared by two panels.',
    },
    {
      ask: 'Composite trapezoid on $f_0,\\ldots,f_N$ is…',
      choices: [
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq\\frac{h}{2}\\bigl(f_0+2f_1+\\cdots+2f_{N-1}+f_N\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq h\\bigl(f_0+2f_1+\\cdots+2f_{N-1}+f_N\\bigr)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq\\frac{h}{2}\\bigl(f_0+4f_1+2f_2+\\cdots+f_N\\bigr)$',
          ok: false,
        },
      ],
      caption: 'Leading truncation for smooth $f$ is typically $O(h^{2})$.',
    },
    {
      ask: 'Composite Simpson (even $N$) is…',
      choices: [
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq\\frac{h}{3}\\bigl(f_0+4f_1+2f_2+4f_3+\\cdots+4f_{N-1}+f_N\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq\\frac{h}{2}\\bigl(f_0+4f_1+2f_2+\\cdots+f_N\\bigr)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\int_a^b f\\simeq\\frac{h}{3}\\bigl(f_0+2f_1+4f_2+\\cdots+f_N\\bigr)$',
          ok: false,
        },
      ],
      caption:
        'Repeating pattern $(1,4,2,4,\\ldots,2,4,1)$ times $h/3$. Taylor mid-panel estimate $\\Rightarrow O(h^{4})$.',
    },
  ],
};

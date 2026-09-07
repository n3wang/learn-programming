/** 5.2 先去分母 */
export default {
  title: '例',
  lead: '解方程 $\\dfrac{x + 1}{2} - \\dfrac{x - 1}{3} = 1$。',
  steps: [
    {
      caption: '解 $\\dfrac{x + 1}{2} - \\dfrac{x - 1}{3} = 1$。',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '去分母，两边乘 6', ok: true },
        { label: '先移项', ok: false },
        { label: '两边同乘 2', ok: false },
      ],
      caption: '去分母，两边乘 6，得',
      panel: '$3(x + 1) - 2(x - 1) = 6$',
    },
    {
      ask: '去括号，得：',
      choices: [
        { label: '$3x + 3 - 2x + 2 = 6$', ok: true },
        { label: '$3x + 3 - 2x - 2 = 6$', ok: false },
        { label: '$3x + 1 - 2x - 1 = 6$', ok: false },
      ],
      caption: '去括号，得',
      panel: '$3x + 3 - 2x + 2 = 6$',
    },
    {
      ask: '移项、合并同类项，得：',
      choices: [
        { label: '$x = 1$', ok: true },
        { label: '$x = 5$', ok: false },
        { label: '$x = 11$', ok: false },
      ],
      caption: '移项、合并同类项，得 $x = 1$。',
    },
  ],
};

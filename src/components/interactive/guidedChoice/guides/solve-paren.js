/** 5.2 先去括号 */
export default {
  title: '例',
  lead: '解方程 $2(x + 3) = 5x - 3$。',
  steps: [
    {
      caption: '解 $2(x + 3) = 5x - 3$。',
    },
    {
      ask: '去括号，得：',
      choices: [
        { label: '$2x + 6 = 5x - 3$', ok: true },
        { label: '$2x + 3 = 5x - 3$', ok: false },
        { label: '$2x + 6 = 5x + 3$', ok: false },
      ],
      caption: '去括号，得',
      panel: '$2x + 6 = 5x - 3$',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '移项', ok: true },
        { label: '去分母', ok: false },
        { label: '先系数化为 1', ok: false },
      ],
      caption: '移项，得',
      panel: '$6 + 3 = 5x - 2x$',
    },
    {
      ask: '合并同类项后，系数化为 1，得：',
      choices: [
        { label: '$x = 3$', ok: true },
        { label: '$x = 9$', ok: false },
        { label: '$3x = 3$', ok: false },
      ],
      caption: '合并同类项得 $9 = 3x$，所以 $x = 3$。',
    },
  ],
};

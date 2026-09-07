/** 5.2 移项与合并同类项 */
export default {
  title: '例',
  lead: '解方程 $3x - 7 = 2x + 5$。',
  steps: [
    {
      caption: '解 $3x - 7 = 2x + 5$。',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '移项', ok: true },
        { label: '去分母', ok: false },
        { label: '去括号', ok: false },
      ],
      caption: '移项，得',
      panel: '$3x - 2x = 5 + 7$',
    },
    {
      ask: '合并同类项，得：',
      choices: [
        { label: '$x = 12$', ok: true },
        { label: '$x = 2$', ok: false },
        { label: '$5x = 12$', ok: false },
      ],
      caption: '合并同类项，得 $x = 12$。',
    },
  ],
};

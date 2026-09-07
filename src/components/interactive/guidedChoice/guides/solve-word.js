/** 5.2 列方程：把中文译成等式 */
export default {
  title: '例',
  lead: '一个数的 3 倍，等于这个数与 10 的和。求这个数。',
  note: '「的 3 倍」是 $\\times 3$，「与 10 的和」是 $+ 10$，「等于」写成 $=$.',
  steps: [
    {
      caption: '设这个数为 $x$。',
    },
    {
      ask: '列得的方程是：',
      choices: [
        { label: '$3x = x + 10$', ok: true },
        { label: '$3x + 10 = x$', ok: false },
        { label: '$x + 3 = x + 10$', ok: false },
      ],
      caption: '列得',
      panel: '$3x = x + 10$',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '移项', ok: true },
        { label: '去分母', ok: false },
        { label: '去括号', ok: false },
      ],
      caption: '移项，得',
      panel: '$3x - x = 10$',
    },
    {
      ask: '合并同类项，得：',
      choices: [
        { label: '$x = 5$', ok: true },
        { label: '$x = 10$', ok: false },
        { label: '$4x = 10$', ok: false },
      ],
      caption: '合并同类项得 $2x = 10$，所以 $x = 5$。',
    },
  ],
};

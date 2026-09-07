/** 11.2 例 1 — 解不等式并在数轴上表示解集 */
export default {
  title: '例 1',
  lead: '解下列不等式，并在数轴上表示解集。',
  steps: [
    {
      caption: '（1）$3(x - 1) < x - 2$。',
    },
    {
      ask: '去括号，得：',
      choices: [
        { label: '$3x - 3 < x - 2$', ok: true },
        { label: '$3x - 1 < x - 2$', ok: false },
        { label: '$3x - 3 > x - 2$', ok: false },
      ],
      caption: '去括号，得',
      panel: '$3x - 3 < x - 2$',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '移项', ok: true },
        { label: '去括号', ok: false },
        { label: '两边同除以 3，不等号反向', ok: false },
      ],
      caption: '移项，得',
      panel: '$3x - x < -2 + 3$',
    },
    {
      ask: '合并同类项，得：',
      choices: [
        { label: '$2x < 1$', ok: true },
        { label: '$2x < 5$', ok: false },
        { label: '$4x < 1$', ok: false },
      ],
      caption: '合并同类项，得',
      panel: '$2x < 1$',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '系数化为 1，两边除以 2，方向不变', ok: true },
        { label: '两边除以 2，不等号反向', ok: false },
        { label: '移项', ok: false },
      ],
      caption: '系数化为 1，得 $x < \\dfrac{1}{2}$。数轴上是空心圆圈在 $\\dfrac{1}{2}$，射线向左。',
    },
    {
      caption: '（2）$\\dfrac{x - 5}{4} + 2 \\geqslant \\dfrac{5x + 1}{6}$。',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '去分母，两边乘 12', ok: true },
        { label: '先移项', ok: false },
        { label: '系数化为 1', ok: false },
      ],
      caption: '去分母，两边乘 12，得',
      panel: '$3(x - 5) + 24 \\geqslant 2(5x + 1)$',
    },
    {
      ask: '去括号，得：',
      choices: [
        { label: '$3x - 15 + 24 \\geqslant 10x + 2$', ok: true },
        { label: '$3x - 5 + 24 \\geqslant 10x + 1$', ok: false },
        { label: '$3x - 15 + 24 \\leqslant 10x + 2$', ok: false },
      ],
      caption: '去括号，得',
      panel: '$3x - 15 + 24 \\geqslant 10x + 2$',
    },
    {
      ask: '移项，得：',
      choices: [
        { label: '$3x - 10x \\geqslant 2 + 15 - 24$', ok: true },
        { label: '$3x - 10x \\geqslant 2 - 15 - 24$', ok: false },
        { label: '$3x + 10x \\geqslant 2 + 15 - 24$', ok: false },
      ],
      caption: '移项，得',
      panel: '$3x - 10x \\geqslant 2 + 15 - 24$',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '合并同类项', ok: true },
        { label: '去括号', ok: false },
        { label: '取正整数解', ok: false },
      ],
      caption: '合并同类项，得',
      panel: '$-7x \\geqslant -7$',
    },
    {
      ask: '系数化为 1，得：',
      choices: [
        { label: '$x \\leqslant 1$', ok: true },
        { label: '$x \\geqslant 1$', ok: false },
        { label: '$x \\leqslant -1$', ok: false },
      ],
      caption: '系数化为 1，得 $x \\leqslant 1$。数轴上是实心圆圈在 $1$，射线向左。',
    },
  ],
};

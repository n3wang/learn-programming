/** 11.3 例 1 — 先分别求解，再看公共部分 */
export default {
  title: '例 1',
  lead: '解下列不等式组。先求出每一个的解集，再在数轴上找公共部分。',
  steps: [
    {
      caption: '（1）$\\begin{cases}2x-1>x+1\\\\ x+8<4x-1\\end{cases}$',
    },
    {
      ask: '解第一个不等式，得：',
      choices: [
        { label: '$x > 2$', ok: true },
        { label: '$x < 2$', ok: false },
        { label: '$x > 0$', ok: false },
      ],
      caption: '移项得 $x > 2$。',
      panel: '$x > 2$',
    },
    {
      ask: '解第二个不等式，得：',
      choices: [
        { label: '$x > 1$', ok: false },
        { label: '$x < 3$', ok: false },
        { label: '$x > 3$', ok: true },
      ],
      caption: '$x+8<4x-1$ 移项得 $9<3x$，所以 $x>3$。',
      panel: '$x > 3$',
    },
    {
      ask: '$x>2$ 与 $x>3$ 的公共部分是：',
      choices: [
        { label: '$x > 3$', ok: true },
        { label: '$x > 2$', ok: false },
        { label: '$2 < x < 3$', ok: false },
      ],
      caption: '两个都向右的射线，公共部分取更靠右的那条：$x>3$。',
    },
    {
      caption: '（2）$\\begin{cases}2x+3\\geqslant x+11\\\\ \\dfrac{2x+5}{3}-1<2-x\\end{cases}$',
    },
    {
      ask: '解 $2x+3\\geqslant x+11$，得：',
      choices: [
        { label: '$x \\geqslant 8$', ok: true },
        { label: '$x \\leqslant 8$', ok: false },
        { label: '$x \\geqslant 14$', ok: false },
      ],
      caption: '移项得 $x\\geqslant 8$。',
      panel: '$x \\geqslant 8$',
    },
    {
      ask: '解 $\\dfrac{2x+5}{3}-1<2-x$，得：',
      choices: [
        { label: '$x < 8$', ok: false },
        { label: '$x < \\dfrac{4}{5}$', ok: true },
        { label: '$x > \\dfrac{4}{5}$', ok: false },
      ],
      caption: '先移常数，再两边乘 $3$：$2x+5<9-3x$，得 $5x<4$，所以 $x<\\dfrac{4}{5}$。',
      panel: '$x < \\dfrac{4}{5}$',
    },
    {
      ask: '$x\\geqslant 8$ 与 $x<\\dfrac{4}{5}$ 的公共部分是：',
      choices: [
        { label: '$\\dfrac{4}{5}<x<8$', ok: false },
        { label: '$x\\geqslant 8$', ok: false },
        { label: '无解', ok: true },
      ],
      caption: '一条射线在 $8$ 的右边，一条在 $\\dfrac{4}{5}$ 的左边，中间没有重叠，不等式组无解。',
    },
  ],
};

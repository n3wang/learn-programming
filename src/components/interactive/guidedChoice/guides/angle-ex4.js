/** 6.3.3 例 4 — 两条平分线旁的余角 */
export default {
  title: '例 4',
  lead: '点 $A$、$O$、$B$ 在同一条直线上。射线 $OD$ 平分 $\\angle AOC$，射线 $OE$ 平分 $\\angle BOC$。图中哪些角互为余角？',
  steps: [
    {
      caption: '因为 $A$、$O$、$B$ 在同一直线上，$\\angle AOC$ 与 $\\angle BOC$ 的和是平角。',
    },
    {
      ask: '所以这两个角的关系是：',
      choices: [
        { label: '互补，$\\angle AOC + \\angle BOC = 180^\\circ$', ok: true },
        { label: '互余，$\\angle AOC + \\angle BOC = 90^\\circ$', ok: false },
        { label: '相等，$\\angle AOC = \\angle BOC$', ok: false },
      ],
      caption: '所以这两个角互补，$\\angle AOC + \\angle BOC = 180^\\circ$。',
    },
    {
      ask: '$OD$、$OE$ 分别平分这两个角，一半相加得：',
      choices: [
        { label: '$\\dfrac{1}{2} \\times 180^\\circ = 90^\\circ$', ok: true },
        { label: '$\\dfrac{1}{2} \\times 180^\\circ = 45^\\circ$', ok: false },
        { label: '$180^\\circ - 90^\\circ = 90^\\circ$，但不是一半相加', ok: false },
      ],
      caption: '$\\angle COD + \\angle COE = \\dfrac{1}{2}\\angle AOC + \\dfrac{1}{2}\\angle BOC = 90^\\circ$。因此 $\\angle COD$ 与 $\\angle COE$ 互为余角。同理，$\\angle AOD$ 与 $\\angle BOE$、$\\angle AOD$ 与 $\\angle COE$、$\\angle COD$ 与 $\\angle BOE$ 也互为余角。',
    },
  ],
};

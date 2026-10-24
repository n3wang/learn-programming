/** 11.3 例 2 — 不等式组的整数解 */
export default {
  title: '例 2',
  lead: '$x$ 取哪些整数值时，$5x+2>3(x-1)$ 与 $\\dfrac{1}{2}x-1\\leqslant 7-\\dfrac{3}{2}x$ 都成立？',
  steps: [
    {
      caption: '两个不等式都成立的 $x$，就是它们组成的不等式组的解。先求公共解集，再取出其中的整数。',
    },
    {
      ask: '解 $5x+2>3(x-1)$，得：',
      choices: [
        { label: '$x > -\\dfrac{5}{2}$', ok: true },
        { label: '$x > \\dfrac{5}{2}$', ok: false },
        { label: '$x < -\\dfrac{5}{2}$', ok: false },
      ],
      caption: '去括号、移项得 $2x>-5$，所以 $x>-\\dfrac{5}{2}$。',
      panel: '$x > -\\dfrac{5}{2}$',
    },
    {
      ask: '解 $\\dfrac{1}{2}x-1\\leqslant 7-\\dfrac{3}{2}x$，得：',
      choices: [
        { label: '$x \\leqslant 2$', ok: false },
        { label: '$x \\geqslant 4$', ok: false },
        { label: '$x \\leqslant 4$', ok: true },
      ],
      caption: '移项得 $2x\\leqslant 8$，所以 $x\\leqslant 4$。',
      panel: '$x \\leqslant 4$',
    },
    {
      ask: '公共解集是：',
      choices: [
        { label: '$-\\dfrac{5}{2}<x\\leqslant 4$', ok: true },
        { label: '$\\dfrac{5}{2}<x\\leqslant 4$', ok: false },
        { label: '$-4\\leqslant x<-\\dfrac{5}{2}$', ok: false },
      ],
      caption: '公共部分是 $-\\dfrac{5}{2}<x\\leqslant 4$。',
    },
    {
      ask: '这个区间里的整数是：',
      choices: [
        { label: '$3,\\,4$', ok: false },
        { label: '$-2,-1,0,1,2,3,4$', ok: true },
        { label: '$-3,-2,-1,0,1,2,3,4$', ok: false },
      ],
      caption: '$-2.5$ 右边第一个整数是 $-2$，右端 $4$ 取到，所以 $x=-2,-1,0,1,2,3,4$。',
    },
  ],
};

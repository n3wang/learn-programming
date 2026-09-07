/** 11.1.2 例 3（2） */
export default {

  lead: '解不等式 $3x < 2x + 1$。',
  steps: [
    {
      caption: '解 $3x < 2x + 1$。',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '两边减 $2x$，方向不变', ok: true },
        { label: '两边除以 3，方向改变', ok: false },
        { label: '两边加 $2x$', ok: false },
      ],
      caption: '根据不等式的性质 1，不等式两边减 $2x$，不等号的方向不变，所以',
      panel: '$3x - 2x < 2x + 1 - 2x$',
    },
    {
      ask: '化简后得：',
      choices: [
        { label: '$x < 1$', ok: true },
        { label: '$x > 1$', ok: false },
        { label: '$5x < 1$', ok: false },
      ],
      caption: '所以 $x < 1$。数轴上是空心圆圈在 $1$，射线向左。',
    },
  ],
};

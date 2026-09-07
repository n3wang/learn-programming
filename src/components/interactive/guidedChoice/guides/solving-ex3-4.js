/** 11.1.2 例 3（4） */
export default {
  title: '（4）',
  lead: '解不等式 $-4x > 3$。',
  steps: [
    {
      caption: '解 $-4x > 3$。',
    },
    {
      ask: '系数是负数，下一步用哪条性质？',
      choices: [
        { label: '性质 3，两边除以 $-4$，方向改变', ok: true },
        { label: '性质 2，两边除以 $-4$，方向不变', ok: false },
        { label: '两边加 4', ok: false },
      ],
      caption: '根据不等式的性质 3，不等式两边除以 $-4$，不等号的方向改变，所以',
      panel: '$\\dfrac{-4x}{-4} < \\dfrac{3}{-4}$',
    },
    {
      ask: '化简后得：',
      choices: [
        { label: '$x < -\\dfrac{3}{4}$', ok: true },
        { label: '$x > -\\dfrac{3}{4}$', ok: false },
        { label: '$x < \\dfrac{3}{4}$', ok: false },
      ],
      caption: '所以 $x < -\\dfrac{3}{4}$。数轴上是空心圆圈在 $-\\dfrac{3}{4}$，射线向左。',
    },
  ],
};

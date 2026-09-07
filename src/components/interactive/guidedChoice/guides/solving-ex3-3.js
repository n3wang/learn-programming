/** 11.1.2 例 3（3） */
export default {
  title: '（3）',
  lead: '解不等式 $\\dfrac{2}{3}x > 50$。',
  steps: [
    {
      caption: '解 $\\dfrac{2}{3}x > 50$。',
    },
    {
      ask: '系数是正数，下一步用哪条性质？',
      choices: [
        { label: '性质 2，两边乘 $\\dfrac{3}{2}$，方向不变', ok: true },
        { label: '性质 3，两边乘 $\\dfrac{3}{2}$，方向改变', ok: false },
        { label: '两边减 $\\dfrac{2}{3}$', ok: false },
      ],
      caption: '根据不等式的性质 2，不等式两边乘 $\\dfrac{3}{2}$，不等号的方向不变，所以',
      panel: '$\\dfrac{3}{2} \\times \\dfrac{2}{3}x > \\dfrac{3}{2} \\times 50$',
    },
    {
      ask: '化简后得：',
      choices: [
        { label: '$x > 75$', ok: true },
        { label: '$x > \\dfrac{100}{3}$', ok: false },
        { label: '$x < 75$', ok: false },
      ],
      caption: '所以 $x > 75$。数轴上是空心圆圈在 $75$，射线向右。',
    },
  ],
};

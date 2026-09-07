/** 11.1.2 例 3（1） */
export default {
  
  lead: '解不等式 $x - 7 > 26$。',
  steps: [
    {
      caption: '解 $x - 7 > 26$。',
    },
    {
      ask: '下一步用哪条性质？',
      choices: [
        { label: '性质 1，两边加 7，方向不变', ok: true },
        { label: '性质 3，两边加 7，方向改变', ok: false },
        { label: '两边减 7', ok: false },
      ],
      caption: '根据不等式的性质 1，不等式两边加 7，不等号的方向不变，所以',
      panel: '$x - 7 + 7 > 26 + 7$',
    },
    {
      ask: '化简后得：',
      choices: [
        { label: '$x > 33$', ok: true },
        { label: '$x > 19$', ok: false },
        { label: '$x < 33$', ok: false },
      ],
      caption: '所以 $x > 33$。数轴上是空心圆圈在 $33$，射线向右。',
    },
  ],
};

/** 5.3 工程问题：整理图书 */
export default {
  title: '例',
  lead: '一批图书，一人整理需 $40$ 小时。现先安排 $x$ 人整理 $4$ 小时，再增加 $2$ 人一起整理 $8$ 小时刚好完成。求一开始安排了多少人？',
  note: '把总工作量看作 $1$，一人效率是 $\\dfrac{1}{40}$。两段完成的工作量之和等于 $1$。',
  steps: [
    {
      caption: '设一开始安排 $x$ 人。一人效率为 $\\dfrac{1}{40}$。',
    },
    {
      ask: '前 $4$ 小时完成的工作量是：',
      choices: [
        { label: '$\\dfrac{4x}{40}$', ok: true },
        { label: '$4x$', ok: false },
        { label: '$\\dfrac{x}{40}$', ok: false },
      ],
      caption: '前一段工作量是 $\\dfrac{4x}{40}$。',
    },
    {
      ask: '后 $8$ 小时有 $x+2$ 人，完成量是 $\\dfrac{8(x+2)}{40}$。方程是：',
      choices: [
        { label: '$\\dfrac{4x}{40} + \\dfrac{8(x+2)}{40} = 1$', ok: true },
        { label: '$\\dfrac{4x}{40} + \\dfrac{8(x+2)}{40} = 40$', ok: false },
        { label: '$4x + 8(x+2) = 1$', ok: false },
      ],
      caption: '列得 $\\dfrac{4x + 8(x+2)}{40} = 1$，即 $12x + 16 = 40$，解得 $x = 2$。答：一开始安排 $2$ 人。',
    },
  ],
};

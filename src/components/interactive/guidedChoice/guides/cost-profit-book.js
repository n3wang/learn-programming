/** 进价、售价与利润 — 书题目 */
export default {
  title: '例',
  lead: '一件商品进价 $60$ 元。先按盈利 $25\\%$ 算利润和售价，再按亏损 $10\\%$ 算亏损额和售价。',
  note: '利润率、亏损率都是相对于进价，不是相对于售价。',
  steps: [
    {
      caption: '进价是 $60$ 元，盈利 $25\\%$。',
    },
    {
      ask: '利润等于：',
      choices: [
        { label: '$60 \\times 25\\% = 15$ 元', ok: true },
        { label: '$60 + 25 = 85$ 元', ok: false },
        { label: '$60 \\times 25 = 1500$ 元', ok: false },
      ],
      caption: '利润 $= 60 \\times 25\\% = 15$ 元。',
    },
    {
      ask: '这时售价等于：',
      choices: [
        { label: '$60 + 15 = 75$ 元', ok: true },
        { label: '$60 \\times 25\\% = 15$ 元', ok: false },
        { label: '$60 + 25 = 85$ 元', ok: false },
      ],
      caption: '售价 $= 60 + 15 = 75$ 元。',
    },
    {
      ask: '若改为亏损 $10\\%$，亏损额和售价是：',
      choices: [
        { label: '亏损 $6$ 元，售价 $54$ 元', ok: true },
        { label: '亏损 $10$ 元，售价 $50$ 元', ok: false },
        { label: '亏损 $6$ 元，售价 $66$ 元', ok: false },
      ],
      caption: '亏损额 $= 60 \\times 10\\% = 6$ 元，售价 $= 60 - 6 = 54$ 元。',
    },
  ],
};

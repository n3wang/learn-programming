/** 阅读与思考 — 阶梯水价 */
export default {
  title: '例',
  lead: '某城市居民生活用水：年用水量不超过 $180\\,\\mathrm{m}^3$ 时，按 $4.5$ 元/$\\mathrm{m}^3$；超过 $180\\,\\mathrm{m}^3$ 不超过 $240\\,\\mathrm{m}^3$ 的部分按 $6$ 元/$\\mathrm{m}^3$。某户年水费 $930$ 元，求年用水量。',
  note: '进入高一阶后，只对超出上一阶的那一部分按高价计，不是全部水量都改高价。',
  steps: [
    {
      caption: '第一阶梯封顶水费：$4.5 \\times 180 = 810$ 元。$930 > 810$，所以用水量进入第二阶梯。',
    },
    {
      ask: '设年用水量为 $t\\,\\mathrm{m}^3$（$180 < t \\leqslant 240$），水费方程是：',
      choices: [
        { label: '$810 + 6(t - 180) = 930$', ok: true },
        { label: '$6t = 930$', ok: false },
        { label: '$4.5t = 930$', ok: false },
      ],
      caption: '列得 $810 + 6(t - 180) = 930$。',
    },
    {
      ask: '解得用水量是：',
      choices: [
        { label: '$t = 200$', ok: true },
        { label: '$t = 180$', ok: false },
        { label: '$t = 155$', ok: false },
      ],
      caption: '由 $6(t-180) = 120$，得 $t - 180 = 20$，所以 $t = 200$。答：年用水量 $200\\,\\mathrm{m}^3$。',
    },
  ],
};

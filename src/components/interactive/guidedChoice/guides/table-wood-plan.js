/** 5.3 练习 — 桌面与桌腿配套用料 */
export default {
  title: '例',
  lead: '一张桌子需 $1$ 个桌面和 $4$ 条桌腿。$1\\,\\mathrm{m}^3$ 木料可做 $20$ 个桌面，或做 $400$ 条桌腿。现有木料 $12\\,\\mathrm{m}^3$，怎样分配才能做成套的桌子最多？',
  note: '做成套桌子：桌面个数 $=$ 桌腿个数 $\\div 4$。设做桌面用 $x\\,\\mathrm{m}^3$，则做桌腿用 $12-x\\,\\mathrm{m}^3$。',
  steps: [
    {
      caption: '设用 $x\\,\\mathrm{m}^3$ 做桌面，则用 $12-x\\,\\mathrm{m}^3$ 做桌腿。',
    },
    {
      ask: '桌面个数、桌腿个数分别是：',
      choices: [
        { label: '$20x$ 与 $400(12-x)$', ok: true },
        { label: '$400x$ 与 $20(12-x)$', ok: false },
        { label: '$20(12-x)$ 与 $400x$', ok: false },
      ],
      caption: '桌面 $20x$ 个，桌腿 $400(12-x)$ 条。',
    },
    {
      ask: '配套方程是：',
      choices: [
        { label: '$20x = \\dfrac{1}{4} \\times 400(12-x)$', ok: true },
        { label: '$20x = 400(12-x)$', ok: false },
        { label: '$20x + 400(12-x) = 12$', ok: false },
      ],
      caption: '列得 $20x = 100(12-x)$，解得 $x = 10$。答：桌面用 $10\\,\\mathrm{m}^3$、桌腿用 $2\\,\\mathrm{m}^3$，可做 $200$ 张桌子。',
    },
  ],
};

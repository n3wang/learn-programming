/** 11.2 例 3 — 能耗下降率 */
export default {
  title: '例 3',
  lead: '某市去年万元地区生产总值能耗为 0.320 t 标准煤。如果计划使今年万元地区生产总值能耗比去年的下降率不小于 5%，那么这个市今年万元地区生产总值能耗至多为多少？',
  note: '万元地区生产总值能耗是每万元地区生产总值所消费的能源总量（折算为标准煤）。下降率不小于 5% 是问题中的不等关系。',
  steps: [
    {
      caption: '设今年万元地区生产总值能耗为 $x\\,\\mathrm{t}$ 标准煤。列得',
      panel: '$\\dfrac{0.320 - x}{0.320} \\geqslant 0.05$',
    },
    {
      ask: '两边乘 0.320，得：',
      choices: [
        { label: '$0.320 - x \\geqslant 0.016$', ok: true },
        { label: '$0.320 - x \\geqslant 0.05$', ok: false },
        { label: '$0.320 - x \\leqslant 0.016$', ok: false },
      ],
      caption: '两边乘 0.320，得',
      panel: '$0.320 - x \\geqslant 0.016$',
    },
    {
      ask: '移项，得：',
      choices: [
        { label: '$-x \\geqslant -0.304$', ok: true },
        { label: '$-x \\geqslant 0.304$', ok: false },
        { label: '$x \\geqslant -0.304$', ok: false },
      ],
      caption: '移项，得',
      panel: '$-x \\geqslant -0.304$',
    },
    {
      ask: '两边除以 $-1$，方向改变，得：',
      choices: [
        { label: '$x \\leqslant 0.304$', ok: true },
        { label: '$x \\geqslant 0.304$', ok: false },
        { label: '$x \\leqslant -0.304$', ok: false },
      ],
      caption: '两边除以 $-1$，方向改变，得 $x \\leqslant 0.304$。也可写成 $0.320 \\times (1 - 0.05) = 0.304$。',
    },
  ],
};

/** 11.2 例 4 — 两家超市优惠比较 */
export default {
  title: '例 4',
  lead: '甲、乙两超市以同样价格出售同样的商品。甲超市累计超过 100 元后，超出部分九折；乙超市累计超过 50 元后，超出部分九五折。顾客到哪家超市购物花费较少？',
  note: '优惠起点不同，要分三种情况讨论。',
  steps: [
    {
      caption: '设累计购物 $x$ 元。当 $x \\leqslant 50$ 时，两家都不优惠，花费相同。',
    },
    {
      ask: '当 $50 < x \\leqslant 100$ 时，下一步怎么判断？',
      choices: [
        { label: '甲不优惠、乙有优惠，所以乙较少', ok: true },
        { label: '两家都按原价，花费相同', ok: false },
        { label: '甲按九折、乙按原价，所以甲较少', ok: false },
      ],
      caption: '当 $50 < x \\leqslant 100$ 时，甲不优惠，乙有优惠。',
    },
    {
      ask: '当 $x > 100$ 时，要比较花费，下一步该列什么？',
      choices: [
        { label: '先列甲花费较少的不等式', ok: true },
        { label: '直接说甲较少', ok: false },
        { label: '去分母', ok: false },
      ],
      caption: '若到甲超市花费较少，则',
      panel: '$100 + 0.9(x - 100) < 50 + 0.95(x - 50)$',
    },
    {
      ask: '去括号，得：',
      choices: [
        { label: '$0.9x + 10 < 0.95x + 2.5$', ok: true },
        { label: '$0.9x + 10 < 0.95x + 50$', ok: false },
        { label: '$0.9x - 90 < 0.95x - 47.5$', ok: false },
      ],
      caption: '去括号，得',
      panel: '$0.9x + 10 < 0.95x + 2.5$',
    },
    {
      ask: '移项，得：',
      choices: [
        { label: '$7.5 < 0.05x$', ok: true },
        { label: '$7.5 > 0.05x$', ok: false },
        { label: '$12.5 < 0.05x$', ok: false },
      ],
      caption: '移项，得',
      panel: '$7.5 < 0.05x$',
    },
    {
      ask: '系数化为 1，得：',
      choices: [
        { label: '$x > 150$', ok: true },
        { label: '$x > 100$', ok: false },
        { label: '$x < 150$', ok: false },
      ],
      caption: '所以 $x > 150$ 时甲较少。不等号反过来，$100 < x < 150$ 时乙较少。花费相同则 $x = 150$。',
    },
  ],
};

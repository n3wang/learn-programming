/** 11.2 例 2 — 古诗词竞赛晋级 */
export default {
  title: '例 2',
  lead: '七年级举办古诗词知识竞赛，共有 20 道题，每一题答对得 10 分，答错或不答都扣 5 分。如果规定初赛成绩超过 90 分晋级决赛，那么至少要答对多少道题才能成功晋级？',
  note: '「初赛成绩超过 90 分」是问题中的不等关系。',
  steps: [
    {
      caption: '设初赛答对了 $x$ 道题。列得',
      panel: '$10x - 5(20 - x) > 90$',
    },
    {
      ask: '去括号，得：',
      choices: [
        { label: '$10x - 100 + 5x > 90$', ok: true },
        { label: '$10x - 100 - 5x > 90$', ok: false },
        { label: '$10x - 5 - 20 + x > 90$', ok: false },
      ],
      caption: '去括号，得',
      panel: '$10x - 100 + 5x > 90$',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '移项、合并同类项', ok: true },
        { label: '去分母', ok: false },
        { label: '检验 12 道是否晋级', ok: false },
      ],
      caption: '移项、合并同类项，得',
      panel: '$15x > 190$',
    },
    {
      ask: '系数化为 1，得：',
      choices: [
        { label: '$x > 12\\dfrac{2}{3}$', ok: true },
        { label: '$x > 12$', ok: false },
        { label: '$x < 12\\dfrac{2}{3}$', ok: false },
      ],
      caption: '系数化为 1，得',
      panel: '$x > 12\\dfrac{2}{3}$',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '按题意取正整数，至少 13 道', ok: true },
        { label: '答至少答对 12 道', ok: false },
        { label: '答 $x = 12\\dfrac{2}{3}$', ok: false },
      ],
      caption: '$x$ 应为正整数，所以 $x$ 至少为 13。答对 13 道得 95 分，答对 12 道得 80 分。',
    },
  ],
};

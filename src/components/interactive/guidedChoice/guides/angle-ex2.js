/** 6.3.2 例 2 — 平角减角度 */
export default {
  title: '例 2',
  lead: 'O 是直线 $AB$ 上一点，$\\angle AOC = 53^\\circ 17\'$，求 $\\angle BOC$ 的度数。',
  note: '度与度、分与分分别相减。分不够减时，向度借 1，$1^\\circ = 60\'$。',
  steps: [
    {
      caption: '$AB$ 是直线，$\\angle AOB$ 是平角，等于 $180^\\circ$。$\\angle BOC$ 与 $\\angle AOC$ 的和是这个平角。',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '先把 $180^\\circ$ 化成 $179^\\circ 60\'$', ok: true },
        { label: '直接用 $180^\\circ - 53^\\circ 17\'$，分不用借位', ok: false },
        { label: '先把 $53^\\circ 17\'$ 化成秒', ok: false },
      ],
      caption: '先把 $180^\\circ$ 化成 $179^\\circ 60\'$。',
    },
    {
      ask: '相减得：',
      choices: [
        { label: '$126^\\circ 43\'$', ok: true },
        { label: '$127^\\circ 43\'$', ok: false },
        { label: '$126^\\circ 17\'$', ok: false },
      ],
      caption: '所以 $\\angle BOC = 179^\\circ 60\' - 53^\\circ 17\' = 126^\\circ 43\'$。',
    },
  ],
};

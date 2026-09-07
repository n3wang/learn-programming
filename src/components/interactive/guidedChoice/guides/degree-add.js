/** 6.3.2 练习 — 度分相加 */
export default {
  title: '例',
  lead: '计算 $48^\\circ 39\' + 67^\\circ 31\'$。',
  note: '度与度、分与分分别相加。分满 $60$ 要进位。',
  steps: [
    {
      caption: '先把分相加：$39\' + 31\'$。',
    },
    {
      ask: '分相加得：',
      choices: [
        { label: '$70\' = 1^\\circ 10\'$', ok: true },
        { label: '$70\'$', ok: false },
        { label: '$1^\\circ 10\'$，但不再进到度', ok: false },
      ],
      caption: '分是 $70\'$，进 $1^\\circ$，还剩 $10\'$。',
    },
    {
      ask: '度相加后再加进位，得：',
      choices: [
        { label: '$116^\\circ 10\'$', ok: true },
        { label: '$115^\\circ 70\'$', ok: false },
        { label: '$115^\\circ 10\'$', ok: false },
      ],
      caption: '$48^\\circ + 67^\\circ + 1^\\circ = 116^\\circ$，所以和是 $116^\\circ 10\'$。',
    },
  ],
};

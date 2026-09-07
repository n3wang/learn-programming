/** 6.3 练习 — 已知补角求余角 */
export default {
  title: '例',
  lead: '一个角的补角是 $150^\\circ$，这个角的余角是多少度？',
  steps: [
    {
      caption: '补角与这个角的和是 $180^\\circ$。',
    },
    {
      ask: '这个角是：',
      choices: [
        { label: '$180^\\circ - 150^\\circ = 30^\\circ$', ok: true },
        { label: '$150^\\circ - 90^\\circ = 60^\\circ$', ok: false },
        { label: '$90^\\circ - 150^\\circ$', ok: false },
      ],
      caption: '这个角是 $30^\\circ$。',
    },
    {
      ask: '它的余角是：',
      choices: [
        { label: '$90^\\circ - 30^\\circ = 60^\\circ$', ok: true },
        { label: '$180^\\circ - 30^\\circ = 150^\\circ$', ok: false },
        { label: '$90^\\circ - 150^\\circ$', ok: false },
      ],
      caption: '余角是 $90^\\circ - 30^\\circ = 60^\\circ$。',
    },
  ],
};

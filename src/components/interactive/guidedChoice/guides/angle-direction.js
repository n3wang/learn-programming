/** 6.3.1 例 1 — 方向角的读法 */
export default {
  title: '例 1',
  lead: '货轮 $O$ 发现灯塔 $A$ 在它南偏东 $60^\\circ$ 的方向上。方向角从正北或正南出发，再向东或向西偏一个角。',
  steps: [
    {
      caption: '南偏东 $60^\\circ$：从正南出发，向东偏 $60^\\circ$。',
    },
    {
      ask: '北偏东 $40^\\circ$ 是：',
      choices: [
        { label: '从正北向东偏 $40^\\circ$', ok: true },
        { label: '从正东向北偏 $40^\\circ$', ok: false },
        { label: '从正南向东偏 $40^\\circ$', ok: false },
      ],
      caption: '北偏东 $40^\\circ$：从正北出发，向东偏 $40^\\circ$。',
    },
    {
      ask: '南偏西 $10^\\circ$ 是：',
      choices: [
        { label: '从正南向西偏 $10^\\circ$', ok: true },
        { label: '从正西向南偏 $10^\\circ$', ok: false },
        { label: '从正北向西偏 $10^\\circ$', ok: false },
      ],
      caption: '南偏西 $10^\\circ$：从正南出发，向西偏 $10^\\circ$。',
    },
    {
      ask: '西北就是：',
      choices: [
        { label: '北偏西 $45^\\circ$', ok: true },
        { label: '南偏西 $45^\\circ$', ok: false },
        { label: '北偏东 $45^\\circ$', ok: false },
      ],
      caption: '西北就是北偏西 $45^\\circ$。',
    },
  ],
};

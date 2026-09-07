/** 6.3.2 例 3 — 周角七等分 */
export default {
  title: '例 3',
  lead: '把一个周角 7 等分，每份是多少度的角？精确到分。',
  note: '度、分、秒是六十进制。不能整除时，把剩余的度化成分再除。',
  steps: [
    {
      caption: '周角是 $360^\\circ$，每份是 $360^\\circ \\div 7$。',
    },
    {
      ask: '$360 \\div 7$ 先写成：',
      choices: [
        { label: '$51^\\circ + 3^\\circ \\div 7$', ok: true },
        { label: '$50^\\circ + 10^\\circ \\div 7$', ok: false },
        { label: '$51^\\circ 7\'$', ok: false },
      ],
      caption: '$360^\\circ \\div 7 = 51^\\circ + 3^\\circ \\div 7$。',
    },
    {
      ask: '把剩下的 $3^\\circ$ 化成分后再除，得：',
      choices: [
        { label: '$180\' \\div 7 \\approx 26\'$', ok: true },
        { label: '$180\' \\div 7 \\approx 25\'$', ok: false },
        { label: '$3^\\circ \\div 7 \\approx 0.4^\\circ$，约 $40\'$', ok: false },
      ],
      caption: '$3^\\circ = 180\'$，$180\' \\div 7 \\approx 25.7\'$，精确到分是 $26\'$。每份约 $51^\\circ 26\'$。',
    },
  ],
};

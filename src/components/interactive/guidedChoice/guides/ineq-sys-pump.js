/** 11.3 抽污水：用不等式组表示时间范围 */
export default {
  title: '问题',
  lead: '抽水机每小时抽 $30\\,\\mathrm{t}$。管道里的污水超过 $1200\\,\\mathrm{t}$，又不足 $1500\\,\\mathrm{t}$。求抽完所用时间 $x$（小时）的范围。',
  steps: [
    {
      caption: '设用 $x$ 小时抽完。抽水量是 $30x$（吨），$x$ 要同时满足两个不等关系。',
    },
    {
      ask: '「超过 $1200\\,\\mathrm{t}$」写成哪个不等式？',
      choices: [
        { label: '$30x < 1200$', ok: false },
        { label: '$30x > 1200$', ok: true },
        { label: '$30x = 1200$', ok: false },
      ],
      caption: '超过 $1200\\,\\mathrm{t}$，所以',
      panel: '$30x > 1200$',
    },
    {
      ask: '「不足 $1500\\,\\mathrm{t}$」写成哪个不等式？',
      choices: [
        { label: '$30x < 1500$', ok: true },
        { label: '$30x > 1500$', ok: false },
        { label: '$30x \\geqslant 1500$', ok: false },
      ],
      caption: '不足 $1500\\,\\mathrm{t}$，所以',
      panel: '$30x < 1500$',
    },
    {
      ask: '像方程组那样，把这两个不等式合在一起，记作：',
      choices: [
        { label: '$\\begin{cases}30x>1200\\\\ 30x<1500\\end{cases}$', ok: true },
        { label: '$30x>1200$ 或 $30x<1500$（满足一条即可）', ok: false },
        { label: '$\\begin{cases}30x+30x=2700\\end{cases}$', ok: false },
      ],
      caption: '这就是一个一元一次不等式组：',
      panel: '$\\begin{cases}30x>1200\\\\ 30x<1500\\end{cases}$',
    },
    {
      ask: '分别解这两个不等式，得：',
      choices: [
        { label: '$x > 40$ 且 $x < 50$', ok: true },
        { label: '$x < 40$ 且 $x > 50$', ok: false },
        { label: '$x > 40$ 且 $x > 50$', ok: false },
      ],
      caption: '两边除以正数 $30$，方向不变，得 $x > 40$ 与 $x < 50$。',
    },
    {
      ask: '两个解集的公共部分是：',
      choices: [
        { label: '$x > 50$', ok: false },
        { label: '$40 < x < 50$', ok: true },
        { label: '$x > 40$', ok: false },
      ],
      caption: '公共部分是 $40 < x < 50$。抽完要用多于 $40$ 小时、少于 $50$ 小时。',
    },
  ],
};

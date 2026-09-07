/** 11.1.1 问题 — 从时间看车速 */
export default {
  title: '从时间看',
  lead: '6:00 到 8:00 不到 $2\\,\\mathrm{h}$。设车速是 $x\\,\\mathrm{km/h}$，行驶 $210\\,\\mathrm{km}$ 所用的时间不到 $2\\,\\mathrm{h}$。',
  steps: [
    {
      caption: '时间 $=$ 路程 $\\div$ 速度，所以所用时间是 $\\dfrac{210}{x}\\,\\mathrm{h}$。',
    },
    {
      ask: '「不到 $2\\,\\mathrm{h}$」应写成哪一式？',
      choices: [
        { label: '$\\dfrac{210}{x} < 2$', ok: true },
        { label: '$\\dfrac{210}{x} > 2$', ok: false },
        { label: '$\\dfrac{x}{210} < 2$', ok: false },
      ],
      caption: '从时间看，车速应满足',
      panel: '$\\dfrac{210}{x} < 2$',
    },
  ],
};

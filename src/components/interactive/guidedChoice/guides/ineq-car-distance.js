/** 11.1.1 问题 — 从路程看车速 */
export default {
  title: '从路程看',
  lead: '以这个速度行驶 $2\\,\\mathrm{h}$ 的路程要超过 $210\\,\\mathrm{km}$。',
  steps: [
    {
      caption: '$2\\,\\mathrm{h}$ 驶过的路程是 $2x\\,\\mathrm{km}$，这个路程要超过 $210\\,\\mathrm{km}$。',
    },
    {
      ask: '从路程看，车速应写成哪一式？',
      choices: [
        { label: '$2x > 210$', ok: true },
        { label: '$2x < 210$', ok: false },
        { label: '$210x > 2$', ok: false },
      ],
      caption: '从路程看，车速应满足',
      panel: '$2x > 210$',
    },
    {
      ask: '这两式说的是同一件事吗？',
      choices: [
        { label: '是，都表示 8:00 之前驶过 A 地', ok: true },
        { label: '不是，时间和路程是两个不同条件', ok: false },
        { label: '只在 $x = 105$ 时才相同', ok: false },
      ],
      caption: '两式都表示车速应满足的不等关系。后面再求出使它们成立的 $x$ 的取值范围。',
    },
  ],
};

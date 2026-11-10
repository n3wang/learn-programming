/**
 * Democracy Inc. (民主大业) — hosted on a separate service. This module is a
 * promotional desk page on /party (QR + how-to), not a full HostShell game.
 */

export const LIFESIM_PARTY_URL = 'https://lsim.learn.l.l0l.in/party';

const lifesim = {
  id: 'lifesim',
  /** Opens on a separate Expo desk build; HostShell is skipped. */
  externalUrl: LIFESIM_PARTY_URL,
  logo: 'lifesim/logo.webp',
  title: {en: 'Democracy Inc.', zh: '民主大业'},
  blurb: {
    en: 'From a school teacher to a corrupt politician. We all share the same city, sometimes the same dream.',
    zh: '从一名学校老师变成腐败的政治家。我们都在同座城市里挣扎。',
  },
  players: {min: 2, max: 64},
  minutes: 40,
  coverTint: '#5c4a32',
  howTo: {
    en: [
      'Scan the QR (or open the link) on every phone. One person hosts; everyone else joins the room.',
      'Draft a scenario card (shop owner or professional), then play weeks together — no turn order.',
      'Spend operations on places and the market; politics runs a 4-week elect → nominate → pass → sign cycle.',
      'Highest monthly cashflow after N weeks wins. Optional hidden-agenda mode for 5+ players.',
    ],
    zh: [
      '每人扫二维码（或打开链接）。一人主持，其他人加入房间。',
      '先抽选一张情景卡（店主或专业人士），然后一起过周——没有轮流顺序。',
      '用行动点去地点与市场；政治按 4 周循环：选举 → 提名 → 通过 → 签署。',
      'N 周后月现金流最高者获胜。5 人以上可选隐藏阵营模式。',
    ],
  },
  rulebook(lang) {
    const zh = lang === 'zh';
    return [
      {
        title: zh ? '一句话' : 'In short',
        items: zh
          ? [
              '2–64 人（原型先做本机 ≤8，按 4 人桌调）。一晚约 30–45 分钟。',
              '资源：现金、影响力、运营点。声誉只加成影响力。',
              '棋盘是地图地点：店面可买、服务点有小效果、城市厅提议政策。',
            ]
          : [
              '2–64 players (v1: ≤8 local, tuned for 4). About 30–45 minutes.',
              'Resources: Cash, Influence, Operations. Reputation only multiplies Influence.',
              'Board = map places: ownable shops, service spots, City Hall for policies.',
            ],
      },
      {
        title: zh ? '同步周' : 'Simultaneous weeks',
        items: zh
          ? [
              '所有人同时下「订单」，服务器一起结算——可扩到大桌。',
              '市场行随人数变长；超时则挂机，仍结算收入与负担。',
              '政治每周一步，店铺从不为此暂停。',
            ]
          : [
              'Everyone locks in orders at once; the host resolves them together — that is why it scales.',
              'The market row grows with the room; idle seats still take income and upkeep.',
              'Politics is one step per week; shops never pause for it.',
            ],
      },
      {
        title: zh ? '与完整生涯的区别' : 'Not the full career',
        items: zh
          ? [
              '这是派对切片：精简档案 + 房间循环，不是双人分屏完整存档（D022）。',
              '原型在 Desk / Expo 服务上；本页只负责宣传与扫码进房。',
            ]
          : [
              'A party slice: slim profile + room loop — not split-screen full lives (D022).',
              'The prototype lives on the Desk / Expo service; this page is the QR desk.',
            ],
      },
    ];
  },
};

export default lifesim;

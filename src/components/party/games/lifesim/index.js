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
  /** Host desk shows this instead of the blurb. */
  banner: '/img/party/lifesim/cover.webp',
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
      'Draft a scenario card (shop owner or professional), then play weeks together — no turn order.',
      'Spend operations on places and the market; politics runs a 4-week elect → nominate → pass → sign cycle.',
      'Highest monthly cashflow after N weeks wins. Optional hidden-agenda mode for 5+ players.',
    ],
    zh: [
      '先抽选一张情景卡（店主或专业人士），然后一起过周——没有轮流顺序。',
      '用行动点去地点与市场；政治按 4 周循环：选举 → 提名 → 通过 → 签署。',
      'N 周后月现金流最高者获胜。5 人以上可选隐藏阵营模式。',
    ],
  },
  /** Host-desk trailers. One switch shows one video. */
  trailers: [
    {
      id: 'open',
      label: {en: 'Open mode', zh: '公开模式'},
      video: 'yOv93iS_tCw',
      text: {
        en: 'The first months have no offices, so the table can learn the city. Then you elect a governor. A cabinet lasts about 16 months.',
        zh: '前几个月没有官职，先把这座城练熟，然后再选州长。内阁大约 16 个月。',
      },
    },
    {
      id: 'coup',
      label: {en: 'Golpe de estado', zh: '政变'},
      video: 'ESF0D4wNVks',
      text: {
        en: 'Hidden identities for 5 or more players: honest, corrupt, or an outside puppet. Five honest policies halve living costs. Five corrupt ones — three if a puppet is governor — pay a large bonus.',
        zh: '5 人以上身份保密：廉洁、腐败，或外来傀儡。5 张廉洁政策让生活费减半。5 张腐败——傀儡当州长时 3 张——发一大笔奖金。',
      },
    },
  ],
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
    ];
  },
};

export default lifesim;

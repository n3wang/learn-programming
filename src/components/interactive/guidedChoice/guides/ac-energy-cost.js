/** 5.3 探究 3 — 两款空调综合费用 */
export default {
  title: '例',
  lead: '电价 $0.5$ 元/(kW·h)。1 级空调售价 $3000$ 元，年耗电 $640$ kW·h；3 级空调售价 $2600$ 元，年耗电 $800$ kW·h。使用多少年时两款综合费用相等？超过这个年数，哪款更省？',
  note: '综合费用 $=$ 售价 $+$ 电费。售价固定，电费随使用年数 $t$ 增加。',
  steps: [
    {
      caption: '设使用年数为 $t$。1 级综合费用是 $3000 + 0.5 \\times 640t$。',
    },
    {
      ask: '1 级综合费用写成：',
      choices: [
        { label: '$3000 + 320t$', ok: true },
        { label: '$3000 + 640t$', ok: false },
        { label: '$3000 + 0.5t$', ok: false },
      ],
      caption: '1 级综合费用是 $3000 + 320t$。',
    },
    {
      ask: '3 级综合费用写成：',
      choices: [
        { label: '$2600 + 400t$', ok: true },
        { label: '$2600 + 800t$', ok: false },
        { label: '$2600 + 320t$', ok: false },
      ],
      caption: '3 级综合费用是 $2600 + 400t$。',
    },
    {
      ask: '令两边相等，解得：',
      choices: [
        { label: '$t = 5$', ok: true },
        { label: '$t = 4$', ok: false },
        { label: '$t = 10$', ok: false },
      ],
      caption: '由 $3000 + 320t = 2600 + 400t$，得 $t = 5$。$t < 5$ 时 3 级更省，$t > 5$ 时 1 级更省。安全使用年限约 10 年，所以通常买 1 级更划算。',
    },
  ],
};

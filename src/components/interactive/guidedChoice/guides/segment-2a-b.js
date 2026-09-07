/** 6.2.2 作线段 2a − b */
export default {
  title: '例',
  lead: '已知线段 $a$、$b$，作一条线段，使它等于 $2a - b$。',
  steps: [
    {
      caption: '先在直线上作 $AB = a$，再在延长线上作 $BC = a$。',
    },
    {
      ask: '这时 $AC$ 等于：',
      choices: [
        { label: '$2a$', ok: true },
        { label: '$a + b$', ok: false },
        { label: '$a - b$', ok: false },
      ],
      caption: '则 $AC = 2a$。',
    },
    {
      ask: '下一步该做什么？',
      choices: [
        { label: '在 $AC$ 上截取 $CD = b$', ok: true },
        { label: '把 $AC$ 再延长 $b$', ok: false },
        { label: '取 $AC$ 的中点', ok: false },
      ],
      caption: '在线段 $AC$ 上截取 $CD = b$，则 $AD = 2a - b$。',
    },
  ],
};

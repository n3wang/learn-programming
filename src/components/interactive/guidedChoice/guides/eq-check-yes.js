/** 5.1 检验：代入后成立 */
export default {
  title: '例',
  lead: '判断 $x = 4$ 是不是方程 $2x + 3 = 11$ 的解。',
  steps: [
    {
      caption: '把 $x = 4$ 代入原方程的左边。',
    },
    {
      ask: '左边代入后得：',
      choices: [
        { label: '$2 \\times 4 + 3 = 11$', ok: true },
        { label: '$2 \\times 4 + 3 = 10$', ok: false },
        { label: '$2 + 4 + 3 = 9$', ok: false },
      ],
      caption: '左边是 $2 \\times 4 + 3 = 11$。',
    },
    {
      ask: '和右边比较，结论是：',
      choices: [
        { label: '左右相等，所以是解', ok: true },
        { label: '左右相等，所以不是解', ok: false },
        { label: '左边大于右边，所以不是解', ok: false },
      ],
      caption: '右边是 $11$，左右相等，所以 $x = 4$ 是解。',
    },
  ],
};

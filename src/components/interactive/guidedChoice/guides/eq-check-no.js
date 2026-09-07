/** 5.1 检验：代入后不成立 */
export default {
  title: '例',
  lead: '判断 $x = -1$ 是不是方程 $3x - 1 = 2$ 的解。',
  steps: [
    {
      caption: '把 $x = -1$ 代入原方程的左边。',
    },
    {
      ask: '左边代入后得：',
      choices: [
        { label: '$3 \\times (-1) - 1 = -4$', ok: true },
        { label: '$3 \\times (-1) - 1 = -2$', ok: false },
        { label: '$3 \\times (-1) - 1 = 2$', ok: false },
      ],
      caption: '左边是 $3 \\times (-1) - 1 = -4$。',
    },
    {
      ask: '和右边比较，结论是：',
      choices: [
        { label: '$-4 \\neq 2$，所以不是解', ok: true },
        { label: '$-4 = 2$，所以是解', ok: false },
        { label: '左右相等，所以是解', ok: false },
      ],
      caption: '右边是 $2$，$-4 \\neq 2$，所以 $x = -1$ 不是解。',
    },
  ],
};

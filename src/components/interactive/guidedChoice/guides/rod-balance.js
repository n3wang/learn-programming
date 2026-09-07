/** 阅读与思考 — 木杆挂重物列方程 */
export default {
  title: '例',
  lead: '木杆长 $l$ cm，支点在中点。右端挂 1 个重物，支点左边挂 $n$ 个等重物体，支点到左边挂点的距离为 $x$ cm。左右平衡时，列出关于 $x$ 的一元一次方程。',
  note: '左边重物个数与它到支点的距离的乘积，等于右边那个重物到支点的距离。',
  steps: [
    {
      caption: '支点在中点，支点到右端的距离是 $\\dfrac{l}{2}$。',
    },
    {
      ask: '左边的「个数 $\\times$ 距离」是：',
      choices: [
        { label: '$nx$', ok: true },
        { label: '$n + x$', ok: false },
        { label: '$x$', ok: false },
      ],
      caption: '左边是 $n$ 个重物，到支点 $x$ cm，乘积是 $nx$。',
    },
    {
      ask: '平衡时列得：',
      choices: [
        { label: '$nx = \\dfrac{l}{2}$', ok: true },
        { label: '$nx = l$', ok: false },
        { label: '$x = \\dfrac{l}{2}$', ok: false },
      ],
      caption: '列得 $nx = \\dfrac{l}{2}$。这是关于 $x$ 的一元一次方程。',
    },
  ],
};

import React from 'react';
import { randInt, pickOne } from '../mathRandom';
import { m, nonzero, fracTex, num, par } from '../examKit';
import GeoFig from '../../GeoFig';

/** 第二十六章 一次函数 — randomized items for MixedPractice. */

const lead = (k) => (k === 1 ? 'x' : k === -1 ? '-x' : `${k}x`);
const kb = (k, b) => `${lead(k)}${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`}`;
const lineFig = (lines, width = 240, lim = 6) => {
  const points = {};
  const ls = [];
  lines.forEach(([k, b], i) => {
    points[`P${i}`] = [0, b];
    points[`Q${i}`] = [1, k + b];
    ls.push({ through: [`P${i}`, `Q${i}`], color: ['#e0245e', '#4a90d9', '#2a9d8f'][i] });
  });
  const legend = lines.length > 1 ? lines.map(([k, b], i) => ({ label: `y = ${kb(k, b)}`, color: ls[i].color })) : undefined;
  return <GeoFig grid width={width} range={[-lim, lim, -lim, lim]} points={points} hide={Object.keys(points)} lines={ls} legend={legend} />;
};

/* ---------------- 26.1 函数 ---------------- */

/** 例 1 型：油箱油量 y = Q − r·x */
export function genFuelTank() {
  const Q = pickOne([40, 50, 60, 80]);
  const r = pickOne([0.1, 0.08, 0.125, 0.2]);
  const xmax = Q / r;
  const x = pickOne([100, 150, 200, 250, 300].filter((v) => v < xmax));
  return {
    prompt: `汽车油箱中有汽油 ${Q} L，如果不再加油，耗油量为 ${r} L/km。写出油量 ${m('y')}（L）与行驶路程 ${m('x')}（km）的函数关系式，指出 ${m('x')} 的最大值，并求行驶 ${x} km 时油箱中还有多少汽油。`,
    steps: [
      `${m(`y = ${Q} - ${r}x`)}（${m(`${r}x`)} 表示行驶 ${m('x')} km 用掉的油）。`,
      `油量不能为负：${m(`${Q} - ${r}x \\ge 0`)}，所以 ${m(`0 \\le x \\le ${num(xmax)}`)}。`,
      `${m(`x = ${x}`)} 时，${m(`y = ${Q} - ${r}\\times ${x} = ${num(Q - r * x)}`)}（L）。`,
    ],
    answer: `x 最大 ${num(xmax)}，剩 ${num(Q - r * x)} L`,
    fields: [
      { name: 'xm', label: 'x 的最大值（km）', display: 'x_{\\max}', value: xmax },
      { name: 'y', label: `行驶 ${x} km 后（L）`, display: 'y', value: Q - r * x },
    ],
  };
}

/** 自变量的取值范围 */
export function genDomain() {
  const kind = randInt(0, 2);
  const a = nonzero(-6, 6);
  if (kind === 0) {
    return {
      prompt: `求函数 ${m(`y = \\sqrt{x ${a < 0 ? '+' : '-'} ${Math.abs(a)}}`)} 中自变量 ${m('x')} 的取值范围。`,
      steps: ['被开方数要非负。', `${m(`x ${a < 0 ? '+' : '-'} ${Math.abs(a)} \\ge 0`)}，${m(`x \\ge ${a}`)}。`],
      answer: m(`x \\ge ${a}`),
      fields: [{ name: 'x', label: '取值范围', type: 'ineq', value: { op: '≥', bound: a } }],
    };
  }
  if (kind === 1) {
    return {
      prompt: `求函数 ${m(`y = \\dfrac{3}{x ${a < 0 ? '+' : '-'} ${Math.abs(a)}}`)} 中自变量 ${m('x')} 的取值范围：${m('x \\ne')} ？`,
      steps: ['分母不能为 0。', `${m(`x \\ne ${a}`)}。`],
      answer: m(`x \\ne ${a}`),
      fields: [{ name: 'x', label: 'x 不能取', display: 'x \\ne', value: a }],
    };
  }
  return {
    prompt: `求函数 ${m(`y = \\dfrac{1}{\\sqrt{x ${a < 0 ? '+' : '-'} ${Math.abs(a)}}}`)} 中自变量 ${m('x')} 的取值范围。`,
    steps: ['根号下非负，又在分母里不能为 0，所以被开方数大于 0。', `${m(`x > ${a}`)}。`],
    answer: m(`x > ${a}`),
    fields: [{ name: 'x', label: '取值范围', type: 'ineq', value: { op: '>', bound: a } }],
  };
}

/** 函数值 */
export function genFunctionValue() {
  const k = nonzero(-5, 5);
  const b = randInt(-9, 9);
  const x = randInt(-6, 6);
  const y = randInt(-12, 12);
  return {
    prompt: `对于函数 ${m(`y = ${kb(k, b)}`)}：（1）当 ${m(`x = ${x}`)} 时，求函数值；（2）当函数值为 ${y} 时，求 ${m('x')}。`,
    steps: [`（1）${m(`y = ${k}\\times ${par(x)}${b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${Math.abs(b)}`} = ${k * x + b}`)}。`, `（2）${m(`${kb(k, b)} = ${y}`)}，${m(`x = ${fracTex(y - b, k)}`)}。`],
    answer: `（1）${k * x + b}；（2）x = ${fracTex(y - b, k)}`,
    fields: [
      { name: 'y', label: '（1）函数值', display: 'y', value: k * x + b },
      { name: 'x', label: '（2）', display: 'x', value: (y - b) / k },
    ],
  };
}

/** 例 2 型：读图象（家—食堂—图书馆） */
export function genReadGraph() {
  const d1 = pickOne([0.4, 0.5, 0.6, 0.8]);
  const t1 = pickOne([6, 8, 10]);
  const eat = pickOne([15, 17, 20]);
  const d2 = d1 + pickOne([0.2, 0.3, 0.4]);
  const t2 = randInt(2, 5);
  const read = pickOne([20, 25, 30]);
  const back = pickOne([10, 12, 15]);
  const T = [0, t1, t1 + eat, t1 + eat + t2, t1 + eat + t2 + read, t1 + eat + t2 + read + back];
  const Y = [0, d1, d1, d2, d2, 0];
  const pts = {};
  T.forEach((t, i) => (pts[`T${i}`] = [t / 10, Y[i] * 10]));
  return {
    prompt: `小明家、食堂、图书馆在同一条直线上。小明从家去食堂吃早餐，再去图书馆读报，然后回家。他离家的距离 ${m('y')}（km）与时间 ${m('x')}（min）：0 min 在家；${T[1]} min 到食堂（${d1} km）；${T[2]} min 离开食堂；${T[3]} min 到图书馆（${num(d2)} km）；${T[4]} min 离开图书馆；${T[5]} min 回到家。求：吃早餐用时、食堂到图书馆的距离、小明回家的平均速度（km/min）。`,
    figure: (
      <GeoFig
        grid
        width={300}
        range={[-0.5, T[5] / 10 + 0.5, -0.5, d2 * 10 + 1]}
        points={pts}
        hide={Object.keys(pts)}
        segments={T.slice(1).map((_, i) => ({ s: [`T${i}`, `T${i + 1}`], color: '#e0245e', width: 2.2 }))}
        caption="横轴：时间（单位 10 min）；纵轴：距离（单位 0.1 km）"
      />
    ),
    steps: [
      `图象中平行于 x 轴的线段表示距离不变（停留）：吃早餐 ${m(`${T[2]} - ${T[1]} = ${eat}`)} min。`,
      `食堂到图书馆：${m(`${num(d2)} - ${d1} = ${num(d2 - d1)}`)} km。`,
      `回家：${num(d2)} km 用了 ${back} min，平均速度 ${m(`${num(d2)}\\div ${back} \\approx ${num(d2 / back, 3)}`)} km/min。`,
    ],
    answer: `${eat} min；${num(d2 - d1)} km；${num(d2 / back, 3)} km/min`,
    fields: [
      { name: 'eat', label: '吃早餐（min）', display: 't', value: eat },
      { name: 'dd', label: '食堂到图书馆（km）', display: 'd', value: d2 - d1 },
      { name: 'v', label: '回家速度（km/min，保留 3 位）', display: 'v', value: d2 / back, tol: 0.0006 },
    ],
  };
}

/* ---------------- 26.2 一次函数 ---------------- */

/** 正比例函数：由一点求解析式，再求另一个值 */
export function genProportional() {
  const k = nonzero(-6, 6) * (Math.random() < 0.3 ? 0.5 : 1);
  const x0 = nonzero(-5, 5) * 2;
  const y0 = k * x0;
  const x1 = randInt(-8, 8);
  return {
    prompt: `正比例函数 ${m('y = kx')} 的图象经过点 ${m(`(${x0},\\ ${num(y0)})`)}。求 ${m('k')}，并求 ${m(`x = ${x1}`)} 时的函数值。`,
    figure: lineFig([[k, 0]]),
    steps: [`把点代入：${m(`${num(y0)} = ${x0}k`)}，${m(`k = ${num(k)}`)}。`, `${m(`y = ${k === 1 ? '' : k === -1 ? '-' : num(k)}x`)}，当 ${m(`x = ${x1}`)} 时 ${m(`y = ${num(k * x1)}`)}。`, `${k > 0 ? 'k > 0，图象经过第一、三象限，y 随 x 增大而增大。' : 'k < 0，图象经过第二、四象限，y 随 x 增大而减小。'}`],
    answer: `k = ${num(k)}，y = ${num(k * x1)}`,
    fields: [
      { name: 'k', value: k },
      { name: 'y', label: `x = ${x1} 时`, display: 'y', value: k * x1 },
    ],
  };
}

/** 一次函数的性质：经过哪些象限、增减性 */
export function genLinearProperties() {
  const k = nonzero(-4, 4);
  const b = nonzero(-6, 6);
  const quads = k > 0 ? (b > 0 ? '一、二、三' : '一、三、四') : b > 0 ? '一、二、四' : '二、三、四';
  return {
    prompt: `一次函数 ${m(`y = ${kb(k, b)}`)} 的图象经过哪几个象限？${m('y')} 随 ${m('x')} 的增大怎样变化？`,
    figure: lineFig([[k, b]]),
    steps: [`${m(`k = ${k}`)} ${k > 0 ? '> 0：直线从左向右上升，y 随 x 增大而增大' : '< 0：直线从左向右下降，y 随 x 增大而减小'}。`, `${m(`b = ${b}`)} ${b > 0 ? '> 0：与 y 轴交于正半轴' : '< 0：与 y 轴交于负半轴'}。`, `所以经过第${quads}象限。`],
    answer: `第${quads}象限；${k > 0 ? '增大' : '减小'}`,
    fields: [
      { name: 'q', label: '经过第几象限', type: 'choice', options: ['一、二、三', '一、三、四', '一、二、四', '二、三、四'], value: quads },
      { name: 'inc', label: 'y 随 x 增大而', type: 'choice', options: ['增大', '减小'], value: k > 0 ? '增大' : '减小' },
    ],
  };
}

/** 与坐标轴的交点、与坐标轴围成的三角形面积 */
export function genIntercepts() {
  const k = nonzero(-4, 4);
  const xi = nonzero(-6, 6);
  const b = -k * xi;
  return {
    prompt: `求直线 ${m(`y = ${kb(k, b)}`)} 与 ${m('x')} 轴、${m('y')} 轴的交点坐标，以及它与两坐标轴围成的三角形的面积。`,
    figure: lineFig([[k, b]], 240, Math.max(7, Math.abs(b) + 1, Math.abs(xi) + 1)),
    steps: [`与 ${m('y')} 轴：令 ${m('x = 0')}，${m(`y = ${b}`)}，交点 ${m(`(0,\\ ${b})`)}。`, `与 ${m('x')} 轴：令 ${m('y = 0')}，${m(`${kb(k, b)} = 0`)}，${m(`x = ${xi}`)}，交点 ${m(`(${xi},\\ 0)`)}。`, `面积 ${m(`= \\dfrac12\\times ${Math.abs(xi)}\\times ${Math.abs(b)} = ${num((Math.abs(xi) * Math.abs(b)) / 2)}`)}。`],
    answer: `(${xi}, 0)，(0, ${b})，S = ${num((Math.abs(xi) * Math.abs(b)) / 2)}`,
    fields: [
      { name: 'xi', label: '与 x 轴交点横坐标', display: 'x', value: xi },
      { name: 'yi', label: '与 y 轴交点纵坐标', display: 'y', value: b },
      { name: 's', label: '面积', display: 'S', value: (Math.abs(xi) * Math.abs(b)) / 2 },
    ],
  };
}

/** "3k + " / "-k + " / "" (x = 0) for the system k·x + b = y. */
const kTerm = (x) => (x === 0 ? '' : `${x === 1 ? '' : x === -1 ? '-' : x}k + `);

/** 待定系数法：过两点 */
export function genTwoPoints() {
  const k = nonzero(-4, 4);
  const b = randInt(-8, 8);
  const x1 = randInt(-5, 2);
  const x2 = x1 + randInt(1, 6);
  const y1 = k * x1 + b;
  const y2 = k * x2 + b;
  return {
    prompt: `已知一次函数的图象经过点 ${m(`(${x1},\\ ${y1})`)} 与 ${m(`(${x2},\\ ${y2})`)}，求这个一次函数的解析式 ${m('y = kx + b')}。`,
    steps: [
      `设 ${m('y = kx + b\\ (k\\ne 0)')}，代入两点：${m(`\\begin{cases} ${kTerm(x1)}b = ${y1} \\\\ ${kTerm(x2)}b = ${y2} \\end{cases}`)}`,
      `两式相减：${m(`${x2 - x1 === 1 ? '' : x2 - x1}k = ${y2 - y1}`)}，${m(`k = ${k}`)}；${x1 === 0 ? `由第一个方程 ${m(`b = ${y1}`)}` : m(`b = ${y1} - ${par(x1)}\\times ${par(k)} = ${b}`)}。`,
      `解析式：${m(`y = ${kb(k, b)}`)}。像这样先设出解析式再求系数的方法叫做**待定系数法**。`,
    ],
    answer: m(`y = ${kb(k, b)}`),
    fields: [
      { name: 'k', value: k },
      { name: 'b', value: b },
    ],
  };
}

/** 平移：y = kx + b 向上 / 向下平移 */
export function genShift() {
  const k = nonzero(-5, 5);
  const b = randInt(-5, 5);
  const d = randInt(1, 6) * pickOne([1, -1]);
  return {
    prompt: `把直线 ${m(`y = ${kb(k, b)}`)} 向${d > 0 ? '上' : '下'}平移 ${Math.abs(d)} 个单位长度，得到的直线解析式为 ${m('y = kx + b')}。求 ${m('k')}、${m('b')}。`,
    figure: lineFig([[k, b], [k, b + d]]),
    steps: ['上下平移：k 不变（直线平行），b 加上（向上）或减去（向下）平移的距离。', `${m(`y = ${kb(k, b + d)}`)}。`],
    answer: m(`y = ${kb(k, b + d)}`),
    fields: [
      { name: 'k', value: k },
      { name: 'b', value: b + d },
    ],
  };
}

/** 两条直线的交点 ↔ 二元一次方程组的解 */
export function genIntersection() {
  const x = randInt(-4, 4);
  const y = randInt(-4, 4);
  let k1;
  let k2;
  do {
    k1 = nonzero(-3, 3);
    k2 = nonzero(-3, 3);
  } while (k1 === k2);
  const b1 = y - k1 * x;
  const b2 = y - k2 * x;
  return {
    prompt: `求直线 ${m(`y = ${kb(k1, b1)}`)} 与直线 ${m(`y = ${kb(k2, b2)}`)} 的交点坐标。`,
    figure: lineFig([[k1, b1], [k2, b2]], 240, Math.max(6, Math.abs(y) + 2, Math.abs(x) + 2)),
    steps: ['两条直线交点的坐标，就是这两个解析式组成的方程组的解。', `${m(`${kb(k1, b1)} = ${kb(k2, b2)}`)}，${m(`${lead(k1 - k2)} = ${b2 - b1}`)}，${m(`x = ${x}`)}；代入得 ${m(`y = ${y}`)}。`],
    answer: m(`(${x},\\ ${y})`),
    fields: [
      { name: 'x', value: x },
      { name: 'y', value: y },
    ],
  };
}

/** 一次函数与一元一次不等式：kx + b > 0 的解集 */
export function genLinearInequality() {
  const k = nonzero(-4, 4);
  const r = nonzero(-5, 5);
  const b = -k * r;
  const opBase = pickOne(['>', '<', '≥', '≤']);
  const flip = { '>': '<', '<': '>', '≥': '≤', '≤': '≥' };
  const op = k > 0 ? opBase : flip[opBase];
  const tx = { '>': '>', '<': '<', '≥': '\\ge', '≤': '\\le' };
  return {
    prompt: `一次函数 ${m(`y = ${kb(k, b)}`)} 的图象如图。当 ${m('x')} 取何值时，${m(`y ${tx[opBase]} 0`)}？`,
    figure: lineFig([[k, b]], 240, Math.max(6, Math.abs(b) + 1)),
    steps: [`直线与 ${m('x')} 轴交于 ${m(`(${r},\\ 0)`)}。`, `${k > 0 ? 'y 随 x 增大而增大' : 'y 随 x 增大而减小'}，${opBase === '>' || opBase === '≥' ? '图象在 x 轴上方' : '图象在 x 轴下方'}的部分对应 ${m(`x ${tx[op]} ${r}`)}。`],
    answer: m(`x ${tx[op]} ${r}`),
    fields: [{ name: 'x', label: '解集', type: 'ineq', value: { op, bound: r } }],
  };
}

/** 例 5 型：分段计价（种子 2 kg 以上打折） */
export function genPiecewise() {
  const p = pickOne([4, 5, 6, 8]);
  const T = pickOne([2, 3, 5]);
  const disc = pickOne([0.8, 0.9, 0.75]);
  const x = T + pickOne([1, 1.5, 2, 3, 4]);
  const pay = p * T + p * disc * (x - T);
  return {
    prompt: `某种子的价格为 ${p} 元/kg。如果一次购买 ${T} kg 以上，超过 ${T} kg 部分的价格打 ${disc * 10} 折。写出购买量 ${m('x')}（kg，${m(`x > ${T}`)}）时的付款金额 ${m('y')}（元），并求购买 ${num(x)} kg 的付款。`,
    steps: [
      `${m(`0 \\le x \\le ${T}`)} 时，${m(`y = ${p}x`)}。`,
      `${m(`x > ${T}`)} 时，${m(`y = ${p}\\times ${T} + ${num(p * disc)}(x - ${T}) = ${num(p * disc)}x + ${num(p * T - p * disc * T)}`)}。`,
      `${m(`x = ${num(x)}`)}：${m(`y = ${num(pay)}`)}（元）。`,
    ],
    answer: `y = ${num(p * disc)}x + ${num(p * T - p * disc * T)}；${num(pay)} 元`,
    fields: [
      { name: 'k', label: 'x > ' + T + ' 时 y = kx + b，', display: 'k', value: p * disc },
      { name: 'b', display: 'b', value: p * T - p * disc * T },
      { name: 'y', label: `购买 ${num(x)} kg`, display: 'y', value: pay },
    ],
  };
}

/* ---------------- 26.3 选择方案 ---------------- */

/** 两种收费方案：月租 + 单价，何时一样、选哪种 */
export function genChoosePlan() {
  let a1;
  let r1;
  let a2;
  let r2;
  let t;
  for (;;) {
    a1 = pickOne([0, 10, 15, 20]);
    a2 = a1 + pickOne([10, 15, 20, 30, 50]);
    r1 = pickOne([0.2, 0.25, 0.3, 0.4, 0.5]);
    r2 = pickOne([0.1, 0.15, 0.2]);
    if (r2 >= r1) continue;
    t = (a2 - a1) / (r1 - r2);
    if (Number.isInteger(t) && t <= 600 && t >= 20) break;
  }
  const use = t + pickOne([-1, 1]) * pickOne([20, 40, 60].filter((v) => v < t));
  const best = use < t ? 'A' : 'B';
  return {
    prompt: `两种手机计费方式：A 方式月租 ${a1} 元，通话每分钟 ${r1} 元；B 方式月租 ${a2} 元，通话每分钟 ${r2} 元。通话多少分钟时两种方式费用相同？某人每月通话 ${use} 分钟，选哪种更省钱？`,
    steps: [
      `设每月通话 ${m('x')} 分钟：${m(`y_A = ${a1 ? `${a1} + ` : ''}${r1}x`)}，${m(`y_B = ${a2} + ${r2}x`)}。`,
      `相同：${m(`${a1 ? `${a1} + ` : ''}${r1}x = ${a2} + ${r2}x`)}，${m(`x = ${t}`)}。`,
      `少于 ${t} 分钟时 A 便宜（月租低），多于 ${t} 分钟时 B 便宜（单价低）。${use} 分钟选 ${best}。`,
    ],
    answer: `${t} 分钟；选 ${best}`,
    fields: [
      { name: 't', label: '费用相同时（分钟）', display: 'x', value: t },
      { name: 'best', label: `通话 ${use} 分钟选`, type: 'choice', options: ['A', 'B'], value: best },
    ],
  };
}

import React from 'react';
import { randInt, pickOne } from '../mathRandom';
import { m, nonzero, num } from '../examKit';
import GeoFig from '../../GeoFig';

/** 第二十章 轴对称 — randomized items for MixedPractice. */

const deg = (n) => `${n}^\\circ`;
const ptTex = (x, y) => `(${x},\\ ${y})`;

/* ---------------- 20.1 / 20.2 对称点 ---------------- */

/** 点关于 x 轴 / y 轴 / 直线 x = k / y = k 的对称点 */
export function genReflectPoint() {
  const x = nonzero(-7, 7);
  const y = nonzero(-7, 7);
  const kind = pickOne(['x', 'y', 'x', 'y', 'vx', 'hy']);
  const k = nonzero(-3, 3);
  let rx = x;
  let ry = y;
  let axis;
  let rule;
  if (kind === 'x') {
    ry = -y;
    axis = '$x$ 轴';
    rule = '关于 $x$ 轴对称：横坐标不变，纵坐标互为相反数，$(x,y)\\to(x,-y)$。';
  } else if (kind === 'y') {
    rx = -x;
    axis = '$y$ 轴';
    rule = '关于 $y$ 轴对称：纵坐标不变，横坐标互为相反数，$(x,y)\\to(-x,y)$。';
  } else if (kind === 'vx') {
    rx = 2 * k - x;
    axis = `直线 ${m(`x = ${k}`)}（直线上各点横坐标都是 ${k}）`;
    rule = `对称轴竖直：纵坐标不变；两点横坐标的平均数是 ${k}，所以 ${m(`x' = 2\\times ${k} - (${x}) = ${rx}`)}。`;
  } else {
    ry = 2 * k - y;
    axis = `直线 ${m(`y = ${k}`)}（直线上各点纵坐标都是 ${k}）`;
    rule = `对称轴水平：横坐标不变；两点纵坐标的平均数是 ${k}，所以 ${m(`y' = 2\\times ${k} - (${y}) = ${ry}`)}。`;
  }
  const lim = Math.max(8, Math.abs(rx) + 1, Math.abs(ry) + 1);
  return {
    prompt: `写出点 ${m(`A${ptTex(x, y)}`)} 关于${axis}的对称点 ${m("A'")} 的坐标。`,
    figure: (
      <GeoFig
        grid
        range={[-lim, lim, -lim, lim]}
        width={260}
        points={{ A: [x, y], K1: kind === 'vx' ? [k, 0] : [0, k], K2: kind === 'vx' ? [k, 1] : [1, k] }}
        hide={['K1', 'K2']}
        lines={kind === 'vx' || kind === 'hy' ? [{ through: ['K1', 'K2'], dash: true, color: '#e0245e' }] : []}
      />
    ),
    steps: [rule, `所以 ${m(`A'${ptTex(rx, ry)}`)}。`],
    answer: m(`A'${ptTex(rx, ry)}`),
    fields: [
      { name: 'x', label: "A′ 横坐标", display: "x'", value: rx },
      { name: 'y', label: "A′ 纵坐标", display: "y'", value: ry },
    ],
  };
}

/** 根据坐标变化判断对称方式（习题 20.2 第 5 题） */
export function genWhichMotion() {
  const x = nonzero(-7, 7);
  const y = nonzero(-7, 7);
  const kind = pickOne(['x', 'y', 'o']);
  const to = kind === 'x' ? [x, -y] : kind === 'y' ? [-x, y] : [-x, -y];
  const opts = ['关于 x 轴对称', '关于 y 轴对称', '先关于 x 轴、再关于 y 轴对称'];
  const val = opts[['x', 'y', 'o'].indexOf(kind)];
  return {
    prompt: `点 ${m(ptTex(x, y))} 变到了 ${m(ptTex(to[0], to[1]))}。它做了怎样的运动？`,
    steps: [
      `比较坐标：横坐标 ${x} → ${to[0]}（${to[0] === x ? '不变' : '变成相反数'}），纵坐标 ${y} → ${to[1]}（${to[1] === y ? '不变' : '变成相反数'}）。`,
      '纵坐标变号 → 关于 x 轴；横坐标变号 → 关于 y 轴；两个都变号 → 两次对称（也就是关于原点）。',
    ],
    answer: val,
    fields: [{ name: 'c', label: '运动', type: 'choice', options: opts, value: val }],
  };
}

/* ---------------- 20.1.2 线段的垂直平分线 ---------------- */

/** △ABC 中 DE 垂直平分 AC，AE = a，△ABD 周长 P，求 △ABC 周长 */
export function genPerpBisectorPerimeter() {
  const ae = randInt(2, 8);
  const P = randInt(ae * 2 + 4, 30);
  return {
    prompt: `在 △ABC 中，DE 是 AC 的垂直平分线（D 在 BC 上，E 在 AC 上），${m(`AE = ${ae}\\ \\text{cm}`)}，△ABD 的周长为 ${m(`${P}\\ \\text{cm}`)}。求 △ABC 的周长。`,
    figure: (
      <GeoFig
        width={260}
        points={{ A: [1.2, 3.4], B: [0, 0], C: [6, 0], D: [3.73, 0], E: [3.6, 1.7] }}
        segments={['AB', 'BC', 'CA', { s: 'DE', color: '#e0245e' }, { s: 'AD', dash: true }]}
        right={['C E D']}
        ticks={[['AE', 1], ['EC', 1]]}
        labelPos={{ D: 's', E: 'ne' }}
      />
    ),
    steps: [
      '垂直平分线上的点到线段两端距离相等：D 在 AC 的垂直平分线上，所以 DA = DC；E 是中点，AC = 2AE。',
      `△ABD 的周长 ${m('= AB + BD + DA = AB + BD + DC = AB + BC')} ${m(`= ${P}`)}。`,
      `△ABC 的周长 ${m(`= AB + BC + AC = ${P} + 2\\times ${ae} = ${P + 2 * ae}`)}（cm）。`,
    ],
    answer: `${P + 2 * ae} cm`,
    fields: [{ name: 'p', label: '△ABC 周长（cm）', display: 'C', value: P + 2 * ae }],
  };
}

/* ---------------- 20.3 等腰三角形 ---------------- */

/** 等腰三角形：已知顶角求底角，或已知底角求顶角 */
export function genIsoAngles() {
  const giveTop = Math.random() < 0.5;
  const top = giveTop ? 2 * randInt(10, 80) : 180 - 2 * randInt(20, 85);
  const base = (180 - top) / 2;
  return {
    prompt: giveTop
      ? `等腰三角形的顶角是 ${m(deg(top))}，它的底角是多少度？`
      : `等腰三角形的一个底角是 ${m(deg(base))}，它的顶角是多少度？`,
    steps: [
      '等腰三角形的两个底角相等（等边对等角），三角形内角和是 180°。',
      giveTop ? `底角 ${m(`= (180^\\circ - ${top}^\\circ)\\div 2 = ${base}^\\circ`)}` : `顶角 ${m(`= 180^\\circ - 2\\times ${base}^\\circ = ${top}^\\circ`)}`,
    ],
    answer: m(deg(giveTop ? base : top)),
    fields: [{ name: 'v', label: giveTop ? '底角（度）' : '顶角（度）', display: '\\angle', value: giveTop ? base : top }],
  };
}

/** 等腰三角形一个内角为 α：分类讨论 */
export function genIsoCases() {
  const obtuse = Math.random() < 0.4;
  const a = obtuse ? 2 * randInt(46, 80) : 2 * randInt(10, 40);
  if (obtuse) {
    const b = (180 - a) / 2;
    return {
      prompt: `等腰三角形有一个内角是 ${m(deg(a))}，另外两个角各是多少度？`,
      steps: [
        `${m(deg(a))} 是钝角，不能作底角（两个底角相等，${a}° × 2 > 180°），所以它只能是顶角。`,
        `底角 ${m(`= (180^\\circ - ${a}^\\circ)\\div 2 = ${b}^\\circ`)}。`,
      ],
      answer: `${b}°，${b}°`,
      fields: [{ name: 'v', label: '每个底角（度）', display: '\\angle', value: b }],
    };
  }
  const b1 = (180 - a) / 2;
  const t2 = 180 - 2 * a;
  return {
    prompt: `等腰三角形有一个内角是 ${m(deg(a))}。（1）若它是顶角，底角是多少度？（2）若它是底角，顶角是多少度？`,
    steps: [
      '锐角既可以是顶角，也可以是底角，要分两种情况讨论。',
      `（1）顶角 ${a}°：底角 ${m(`(180 - ${a})\\div 2 = ${b1}`)}°。`,
      `（2）底角 ${a}°：顶角 ${m(`180 - 2\\times ${a} = ${t2}`)}°。`,
    ],
    answer: `（1）${b1}°；（2）${t2}°`,
    fields: [
      { name: 'b', label: '（1）底角（度）', display: '\\angle_1', value: b1 },
      { name: 't', label: '（2）顶角（度）', display: '\\angle_2', value: t2 },
    ],
  };
}

/** 等腰三角形的边：周长 P，一边 s，分类讨论 + 三角形三边关系 */
export function genIsoSides() {
  for (;;) {
    const s = randInt(2, 12);
    const P = randInt(s + 4, 40);
    const legCase = { leg: s, base: P - 2 * s }; // s 是腰
    const baseCase = { leg: (P - s) / 2, base: s }; // s 是底
    const ok = (c) => c.base > 0 && Number.isInteger(c.leg) && c.leg > 0 && 2 * c.leg > c.base;
    const goods = [legCase, baseCase].filter(ok);
    if (goods.length !== 1) continue;
    const g = goods[0];
    const bad = g === legCase ? baseCase : legCase;
    return {
      prompt: `一个等腰三角形的周长为 ${P} cm，其中一边长 ${s} cm。求它的腰长和底边长。`,
      steps: [
        `若 ${s} cm 是腰：底边 ${m(`= ${P} - 2\\times ${s} = ${legCase.base}`)}。`,
        `若 ${s} cm 是底：腰 ${m(`= (${P} - ${s})\\div 2 = ${num(baseCase.leg)}`)}。`,
        `检验三边关系（两腰之和要大于底边）：${num(bad.leg)}、${num(bad.leg)}、${num(bad.base)} ${bad.base <= 0 || !Number.isInteger(bad.leg) ? '不合题意' : '不能组成三角形'}，舍去。`,
        `所以腰长 ${g.leg} cm，底边 ${g.base} cm。`,
      ],
      answer: `腰 ${g.leg} cm，底 ${g.base} cm`,
      fields: [
        { name: 'leg', label: '腰长（cm）', display: '\\text{腰}', value: g.leg },
        { name: 'base', label: '底边（cm）', display: '\\text{底}', value: g.base },
      ],
    };
  }
}

/** 例 1 型：AB = AC，D 在 AC 上，BD = BC，∠A = α，求 ∠ABD */
export function genIsoChain() {
  const golden = Math.random() < 0.3;
  if (golden) {
    return {
      prompt: '在 △ABC 中，AB = AC，点 D 在 AC 上，且 BD = BC = AD。求 △ABC 各角的度数。',
      figure: (
        <GeoFig
          width={220}
          points={{ A: [0, 4.6], B: [-1.5, 0], C: [1.5, 0], D: [0.57, 2.85] }}
          segments={['AB', 'AC', 'BC', { s: 'BD', color: '#e0245e' }]}
          ticks={[['BD', 2], ['BC', 2], ['AD', 2]]}
          labelPos={{ D: 'e' }}
        />
      ),
      steps: [
        '设 ∠A = x。AD = BD，所以 ∠ABD = ∠A = x，∠BDC = ∠A + ∠ABD = 2x（外角）。',
        'BD = BC，所以 ∠C = ∠BDC = 2x；AB = AC，所以 ∠ABC = ∠C = 2x。',
        '内角和：x + 2x + 2x = 180°，x = 36°。',
      ],
      answer: '∠A = 36°，∠ABC = ∠C = 72°',
      fields: [
        { name: 'a', label: '∠A（度）', display: '\\angle A', value: 36 },
        { name: 'c', label: '∠C（度）', display: '\\angle C', value: 72 },
      ],
    };
  }
  const a = 2 * randInt(8, 28);
  const c = (180 - a) / 2;
  const abd = c - a;
  return {
    prompt: `在 △ABC 中，AB = AC，${m(`\\angle A = ${a}^\\circ`)}，点 D 在 AC 上，且 BD = BC。求 ${m('\\angle ABD')} 的度数。`,
    figure: (
      <GeoFig
        width={220}
        points={{ A: [0, 4.6], B: [-1.5, 0], C: [1.5, 0], D: [0.75, 2.3] }}
        segments={['AB', 'AC', 'BC', { s: 'BD', color: '#e0245e' }]}
        ticks={[['AB', 1], ['AC', 1], ['BD', 2], ['BC', 2]]}
        labelPos={{ D: 'e' }}
      />
    ),
    steps: [
      `AB = AC：${m(`\\angle ABC = \\angle C = (180^\\circ - ${a}^\\circ)\\div 2 = ${c}^\\circ`)}。`,
      `BD = BC：${m(`\\angle BDC = \\angle C = ${c}^\\circ`)}，所以 ${m(`\\angle DBC = 180^\\circ - 2\\times ${c}^\\circ = ${a}^\\circ`)}。`,
      `${m(`\\angle ABD = \\angle ABC - \\angle DBC = ${c}^\\circ - ${a}^\\circ = ${abd}^\\circ`)}。`,
    ],
    answer: m(`\\angle ABD = ${abd}^\\circ`),
    fields: [{ name: 'v', label: '度数', display: '\\angle ABD', value: abd }],
  };
}

/** 含 30° 角的直角三角形 */
export function genThirtySixty() {
  const c = 2 * randInt(2, 12);
  const kind = randInt(0, 1);
  if (kind === 0) {
    return {
      prompt: `在 Rt△ABC 中，${m('\\angle C = 90^\\circ')}，${m('\\angle A = 30^\\circ')}，斜边 ${m(`AB = ${c}`)}。求 ${m('BC')} 的长。`,
      figure: (
        <GeoFig width={240} points={{ A: [0, 0], B: [3.46, 2], C: [3.46, 0] }} segments={['AB', 'BC', 'CA']} right={['A C B']} arcs={[{ at: 'A', from: 'C', to: 'B', label: '30°' }]} />
      ),
      steps: ['在直角三角形中，30° 角所对的直角边等于斜边的一半。', `${m(`BC = \\dfrac{1}{2}AB = ${c / 2}`)}`],
      answer: m(`BC = ${c / 2}`),
      fields: [{ name: 'v', label: '长', display: 'BC', value: c / 2 }],
    };
  }
  return {
    prompt: `在 Rt△ABC 中，${m('\\angle ACB = 90^\\circ')}，${m('\\angle A = 30^\\circ')}，CD 是斜边 AB 上的高，${m(`AB = ${2 * c}`)}。求 ${m('BC')} 和 ${m('BD')}。`,
    figure: (
      <GeoFig
        width={260}
        points={{ A: [0, 0], B: [4, 0], C: [3, 1.73], D: [3, 0] }}
        segments={['AB', 'BC', 'CA', { s: 'CD', dash: true }]}
        right={['A C B', 'B D C']}
        arcs={[{ at: 'A', from: 'B', to: 'C', label: '30°' }]}
        labelPos={{ D: 's', C: 'n' }}
      />
    ),
    steps: [
      `30° 角所对的直角边是斜边的一半：${m(`BC = \\dfrac{1}{2}AB = ${c}`)}。`,
      `${m('\\angle B = 60^\\circ')}，在 Rt△BCD 中 ${m('\\angle BCD = 30^\\circ')}，所以 ${m(`BD = \\dfrac{1}{2}BC = ${c / 2}`)}。`,
    ],
    answer: `BC = ${c}，BD = ${c / 2}`,
    fields: [
      { name: 'bc', label: '长', display: 'BC', value: c },
      { name: 'bd', label: '长', display: 'BD', value: c / 2 },
    ],
  };
}

/** 例 5 型屋架：∠A = 30°，立柱 BC ⊥ AC，DE ⊥ AC，D 是 AB 中点，AB = L，求 BC、DE */
export function genRoofTruss() {
  const L = 2 * randInt(3, 9);
  return {
    prompt: `屋架设计图中，斜梁 ${m(`AB = ${L}\\ \\text{m}`)}，${m('\\angle A = 30^\\circ')}，立柱 BC、DE 都垂直于横梁 AC，D 是 AB 的中点。立柱 BC、DE 各要多长？`,
    figure: (
      <GeoFig
        width={260}
        points={{ A: [0, 0], C: [3.46, 0], B: [3.46, 2], D: [1.73, 1], E: [1.73, 0] }}
        segments={['AB', 'AC', 'BC', 'DE']}
        right={['A C B', 'A E D']}
        arcs={[{ at: 'A', from: 'C', to: 'B', label: '30°' }]}
        labelPos={{ E: 's', D: 'nw' }}
      />
    ),
    steps: [
      `Rt△ABC 中，30° 角所对直角边 ${m(`BC = \\dfrac{1}{2}AB = ${L / 2}`)} m。`,
      `D 是 AB 中点：${m(`AD = ${L / 2}`)}；Rt△ADE 中 ${m(`DE = \\dfrac{1}{2}AD = ${L / 4}`)} m。`,
    ],
    answer: `BC = ${L / 2} m，DE = ${num(L / 4)} m`,
    fields: [
      { name: 'bc', label: '米', display: 'BC', value: L / 2 },
      { name: 'de', label: '米', display: 'DE', value: L / 4 },
    ],
  };
}

/** 等边三角形 */
export function genEquilateral() {
  const a = randInt(3, 15);
  return {
    prompt: `等边三角形 ABC 的边长为 ${a}，AD 是 BC 边上的高。求 ${m('BD')} 的长和 ${m('\\angle BAD')} 的度数。`,
    figure: <GeoFig width={200} points={{ A: [0, 3.46], B: [-2, 0], C: [2, 0], D: [0, 0] }} segments={['AB', 'BC', 'CA', { s: 'AD', dash: true }]} right={['A D C']} labelPos={{ D: 's' }} />,
    steps: [
      '等边三角形是特殊的等腰三角形，三线合一：底边上的高也是中线和顶角平分线。',
      `${m(`BD = \\dfrac{1}{2}BC = ${num(a / 2)}`)}；每个内角 60°，${m('\\angle BAD = 30^\\circ')}。`,
    ],
    answer: `BD = ${num(a / 2)}，∠BAD = 30°`,
    fields: [
      { name: 'bd', label: '长', display: 'BD', value: a / 2 },
      { name: 'ang', label: '度数', display: '\\angle BAD', value: 30 },
    ],
  };
}

/* ---------------- 20.4 最短路径 ---------------- */

const TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 6, 10],
  [12, 5, 13],
  [9, 12, 15],
  [12, 9, 15],
  [8, 15, 17],
  [12, 16, 20],
  [16, 12, 20],
];

/** 将军饮马：A(0,a)、B(d,b) 在河 (x 轴) 同侧，P 在河边，PA + PB 最小 */
export function genGeneralHorse() {
  for (;;) {
    const [d, s, h] = pickOne(TRIPLES);
    const a = randInt(1, s - 1);
    const b = s - a;
    const px = (d * a) / s;
    if (!Number.isInteger(px * 2)) continue;
    return {
      prompt: `如图，小河边为 ${m('x')} 轴。A 地在 ${m(`(0,\\ ${a})`)}，B 地在 ${m(`(${d},\\ ${b})`)}（单位：km）。在河边找一点 P 饮马，使 ${m('PA + PB')} 最短。求 P 的横坐标和最短路程。`,
      figure: (
        <GeoFig
          grid
          width={300}
          range={[-1, d + 1, -a - 1, Math.max(a, b) + 1]}
          points={{ A: [0, a], B: [d, b], Ap: [0, -a], P: [px, 0] }}
          segments={[{ s: 'A P', color: '#2a9d8f' }, { s: 'P B', color: '#2a9d8f' }, { s: 'Ap P', dash: true, color: '#e0245e' }]}
          labelPos={{ P: 'se', Ap: 'w', A: 'w' }}
        />
      ),
      steps: [
        `作 A 关于河（${m('x')} 轴）的对称点 ${m(`A'(0,\\ ${-a})`)}。河边任一点 P 都有 ${m("PA = PA'")}。`,
        `${m("PA + PB = PA' + PB \\ge A'B")}，当 ${m("A'")}、P、B 共线时最短（两点之间，线段最短）。`,
        `直线 ${m("A'B")} 与 ${m('x')} 轴的交点：横坐标 ${m(`= ${d}\\times\\dfrac{${a}}{${a}+${b}} = ${num(px)}`)}。`,
        `最短路程 ${m(`A'B = \\sqrt{${d}^2 + (${a}+${b})^2} = ${h}`)}（km）。`,
      ],
      answer: `P(${num(px)}, 0)，最短 ${h} km`,
      fields: [
        { name: 'px', label: 'P 的横坐标', display: 'x_P', value: px },
        { name: 'len', label: '最短路程（km）', display: 'PA+PB', value: h },
      ],
    };
  }
}

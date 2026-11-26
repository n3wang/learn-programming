import React from 'react';
import { randInt, pickOne } from '../mathRandom';
import { m, num } from '../examKit';
import GeoFig from '../../GeoFig';
import { simplifyRoot } from '../g8a/ch23Generators';
import { TRIPLES } from './ch24Generators';

/** 第二十五章 平行四边形 — randomized items for MixedPractice. */

const deg = (n) => `${n}^\\circ`;
const rootTex = (k, r) => (r === 1 ? `${k}` : `${k === 1 ? '' : k}\\sqrt{${r}}`);
const rootPlain = (k, r) => (r === 1 ? `${k}` : `${k}*√${r}`);
const PARA = { A: [0, 0], B: [4, 0], C: [5.2, 2.2], D: [1.2, 2.2] };
const paraFig = (extra = {}) => (
  <GeoFig width={240} points={{ ...PARA, ...(extra.points || {}) }} segments={['AB', 'BC', 'CD', 'DA', ...(extra.segments || [])]} labelPos={{ A: 'sw', B: 'se', C: 'ne', D: 'nw', ...(extra.labelPos || {}) }} />
);

/** 平行四边形的角：已知一个角，或两邻角之比 / 之差 */
export function genParaAngles() {
  const kind = randInt(0, 2);
  let A;
  let given;
  let ratio = null;
  if (kind === 0) {
    A = randInt(20, 80) * 2 - (Math.random() < 0.5 ? 1 : 0);
    given = `${m(`\\angle A = ${A}^\\circ`)}`;
  } else if (kind === 1) {
    const [p, q] = pickOne([[1, 2], [1, 3], [2, 3], [1, 4], [1, 5], [4, 5], [2, 7], [3, 7]]);
    A = (180 * p) / (p + q);
    ratio = [p, q];
    given = `${m(`\\angle A : \\angle B = ${p} : ${q}`)}`;
  } else {
    const d = 2 * randInt(5, 60);
    A = (180 - d) / 2;
    given = `${m(`\\angle B`)} 比 ${m('\\angle A')} 大 ${m(deg(d))}`;
  }
  const B = 180 - A;
  return {
    prompt: `在 ▱ABCD 中，${given}。求 ${m('\\angle B')}、${m('\\angle C')}、${m('\\angle D')} 的度数。`,
    figure: paraFig(),
    steps: [
      '平行四边形的对角相等，邻角互补（AD ∥ BC，同旁内角互补）。',
      ratio
        ? `邻角和 180°，按比例分配：${m(`\\angle A = 180^\\circ\\times\\dfrac{${ratio[0]}}{${ratio[0] + ratio[1]}} = ${num(A)}^\\circ`)}，${m(`\\angle B = ${num(B)}^\\circ`)}。`
        : kind === 2
          ? `${m('\\angle A + \\angle B = 180^\\circ')}，${m(`\\angle B - \\angle A = ${num(B - A)}^\\circ`)}，所以 ${m(`\\angle A = ${num(A)}^\\circ`)}，${m(`\\angle B = ${num(B)}^\\circ`)}。`
          : `${m(`\\angle B = 180^\\circ - \\angle A = ${num(B)}^\\circ`)}。`,
      `${m(`\\angle C = \\angle A = ${num(A)}^\\circ`)}，${m(`\\angle D = \\angle B = ${num(B)}^\\circ`)}。`,
    ],
    answer: `∠B = ${num(B)}°，∠C = ${num(A)}°，∠D = ${num(B)}°`,
    fields: [
      { name: 'b', label: '度数', display: '\\angle B', value: B },
      { name: 'c', label: '度数', display: '\\angle C', value: A },
      { name: 'd', label: '度数', display: '\\angle D', value: B },
    ],
  };
}

/** 平行四边形的边：周长与两邻边之差 */
export function genParaSides() {
  const a = randInt(4, 20);
  const b = a + randInt(1, 8);
  return {
    prompt: `▱ABCD 的周长为 ${2 * (a + b)} cm，${m('AB')} 比 ${m('BC')} 短 ${b - a} cm。求 ${m('AB')}、${m('BC')} 的长。`,
    figure: paraFig(),
    steps: [
      '平行四边形的对边相等，所以周长 = 2(AB + BC)。',
      `${m(`AB + BC = ${a + b}`)}，${m(`BC - AB = ${b - a}`)}，得 ${m(`BC = ${b}`)}，${m(`AB = ${a}`)}。`,
    ],
    answer: `AB = ${a} cm，BC = ${b} cm`,
    fields: [
      { name: 'ab', label: 'cm', display: 'AB', value: a },
      { name: 'bc', label: 'cm', display: 'BC', value: b },
    ],
  };
}

/** 对角线互相平分：AC、BD 与 △AOB 周长 */
export function genParaDiagonals() {
  const ac = 2 * randInt(3, 12);
  const bd = 2 * randInt(3, 12);
  const ab = randInt(Math.abs(ac - bd) / 2 + 1, (ac + bd) / 2 - 1);
  return {
    prompt: `▱ABCD 的对角线 AC、BD 相交于点 O，${m(`AC = ${ac}`)}，${m(`BD = ${bd}`)}，${m(`AB = ${ab}`)}。求 △AOB 的周长。`,
    figure: paraFig({ points: { O: [2.6, 1.1] }, segments: [{ s: 'A C', dash: true }, { s: 'B D', dash: true }], labelPos: { O: 's' } }),
    steps: ['平行四边形的对角线互相平分：OA = ½AC，OB = ½BD。', `${m(`OA = ${ac / 2}`)}，${m(`OB = ${bd / 2}`)}，周长 ${m(`= ${ac / 2} + ${bd / 2} + ${ab} = ${ac / 2 + bd / 2 + ab}`)}。`],
    answer: `${ac / 2 + bd / 2 + ab}`,
    fields: [{ name: 'p', label: '△AOB 周长', display: 'C', value: ac / 2 + bd / 2 + ab }],
  };
}

/** 例 2（25.1）型：AB、AD 已知，AC ⊥ BC，求 AC、OA 与面积 */
export function genParaArea() {
  const [p, q, r] = pickOne(TRIPLES);
  const k = pickOne([1, 1, 2]);
  const AB = r * k;
  const BC = q * k;
  const AC = p * k;
  return {
    prompt: `在 ▱ABCD 中，${m(`AB = ${AB}`)}，${m(`AD = ${BC}`)}，${m('AC \\perp BC')}，对角线交于 O。求 ${m('AC')}、${m('OA')} 的长和 ▱ABCD 的面积。`,
    figure: <GeoFig width={240} points={{ A: [1.2, 2.2], B: [0, 0], C: [1.2, 0], D: [2.4, 2.2], O: [1.2, 1.1] }} segments={['AB', 'BC', 'CD', 'DA', { s: 'A C', color: '#e0245e' }, { s: 'B D', dash: true }]} right={['A C B']} labelPos={{ O: 'e', C: 's' }} />,
    steps: [
      `对边相等：${m(`BC = AD = ${BC}`)}。△ABC 是直角三角形，${m(`AC = \\sqrt{${AB}^2 - ${BC}^2} = ${AC}`)}。`,
      `对角线互相平分：${m(`OA = \\dfrac12 AC = ${num(AC / 2)}`)}。`,
      `面积 = 底 × 高：${m(`S = BC\\cdot AC = ${BC}\\times ${AC} = ${BC * AC}`)}。`,
    ],
    answer: `AC = ${AC}，OA = ${num(AC / 2)}，S = ${BC * AC}`,
    fields: [
      { name: 'ac', label: '长', display: 'AC', value: AC },
      { name: 'oa', label: '长', display: 'OA', value: AC / 2 },
      { name: 's', label: '面积', display: 'S', value: BC * AC },
    ],
  };
}

/** 判定：选出能判定平行四边形的条件 */
const CRIT = [
  ['AB ∥ CD，AD ∥ BC', true, '两组对边分别平行（定义）'],
  ['AB = CD，AD = BC', true, '两组对边分别相等'],
  ['AB ∥ CD，AB = CD', true, '一组对边平行且相等'],
  ['∠A = ∠C，∠B = ∠D', true, '两组对角分别相等'],
  ['OA = OC，OB = OD', true, '对角线互相平分'],
  ['AB ∥ CD，AD = BC', false, '一组对边平行、另一组对边相等——可能是等腰梯形'],
  ['AB = AD，CB = CD', false, '两组邻边相等——是「筝形」，不一定是平行四边形'],
  ['∠A = ∠B，∠C = ∠D', false, '两组邻角相等——可能是等腰梯形'],
  ['AC = BD', false, '只有对角线相等，不能判定'],
];
export function genParaCriteria() {
  const [cond, yes, why] = pickOne(CRIT);
  return {
    prompt: `四边形 ABCD 的对角线交于 O。已知 ${cond}，能否判定四边形 ABCD 是平行四边形？`,
    steps: ['平行四边形的判定：两组对边分别平行；两组对边分别相等；一组对边平行且相等；两组对角分别相等；对角线互相平分。', `${why}，所以${yes ? '能' : '不能'}判定。`],
    answer: yes ? '能' : '不能',
    fields: [{ name: 'r', label: '能否判定', type: 'choice', options: ['能', '不能'], value: yes ? '能' : '不能' }],
  };
}

/** 三角形的中位线 */
export function genMidline() {
  const kind = randInt(0, 1);
  if (kind === 0) {
    const bc = randInt(4, 30);
    const ab = randInt(4, 30);
    const ac = randInt(Math.abs(ab - bc) + 1, ab + bc - 1);
    return {
      prompt: `△ABC 中，D、E、F 分别是 AB、AC、BC 的中点，${m(`AB = ${ab}`)}，${m(`BC = ${bc}`)}，${m(`AC = ${ac}`)}。求 DE 的长和 △DEF 的周长。`,
      figure: <GeoFig width={220} points={{ A: [1.2, 3], B: [0, 0], C: [4, 0], D: [0.6, 1.5], E: [2.6, 1.5], F: [2, 0] }} segments={['AB', 'BC', 'CA', { s: 'DE', color: '#e0245e' }, { s: 'EF', color: '#e0245e' }, { s: 'FD', color: '#e0245e' }]} labelPos={{ D: 'w', E: 'e', F: 's' }} />,
      steps: [
        '三角形的中位线平行于三角形的第三边，并且等于第三边的一半。',
        `${m(`DE = \\dfrac12 BC = ${num(bc / 2)}`)}；同理 ${m(`EF = \\dfrac12 AB`)}，${m(`DF = \\dfrac12 AC`)}。`,
        `△DEF 的周长 = △ABC 周长的一半 ${m(`= \\dfrac12(${ab} + ${bc} + ${ac}) = ${num((ab + bc + ac) / 2)}`)}。`,
      ],
      answer: `DE = ${num(bc / 2)}，周长 ${num((ab + bc + ac) / 2)}`,
      fields: [
        { name: 'de', label: '长', display: 'DE', value: bc / 2 },
        { name: 'p', label: '△DEF 周长', display: 'C', value: (ab + bc + ac) / 2 },
      ],
    };
  }
  const d = randInt(10, 60);
  return {
    prompt: `A、B 两点被池塘隔开。在 AB 外选一点 C，连接 AC、BC，分别取 AC、BC 的中点 M、N，量得 ${m(`MN = ${d}\\ \\text{m}`)}。A、B 两点间的距离是多少？`,
    figure: <GeoFig width={220} points={{ C: [1.5, 3], A: [0, 0], B: [4, 0], M: [0.75, 1.5], N: [2.75, 1.5] }} segments={['CA', 'CB', { s: 'A B', dash: true }, { s: 'MN', color: '#e0245e' }]} labelPos={{ M: 'w', N: 'e' }} />,
    steps: ['MN 是 △ABC 的中位线，所以 $MN = \\dfrac12 AB$。', `${m(`AB = 2MN = ${2 * d}`)} m。`],
    answer: `${2 * d} m`,
    fields: [{ name: 'ab', label: 'm', display: 'AB', value: 2 * d }],
  };
}

/** 矩形：对角线夹角 60° 或 120° */
export function genRectangle() {
  if (Math.random() < 0.5) {
    const ab = randInt(2, 12);
    return {
      prompt: `矩形 ABCD 的对角线 AC、BD 相交于点 O，${m('\\angle AOB = 60^\\circ')}，${m(`AB = ${ab}`)}。求对角线的长。`,
      figure: <GeoFig width={220} points={{ A: [0, 1.73], B: [0, 0], C: [3, 0], D: [3, 1.73], O: [1.5, 0.87] }} segments={['AB', 'BC', 'CD', 'DA', { s: 'A C', dash: true }, { s: 'B D', dash: true }]} labelPos={{ O: 'n' }} />,
      steps: ['矩形的对角线相等且互相平分，所以 OA = OB。', `又 ${m('\\angle AOB = 60^\\circ')}，△OAB 是等边三角形，${m(`OA = AB = ${ab}`)}。`, `${m(`AC = BD = 2OA = ${2 * ab}`)}。`],
      answer: `${2 * ab}`,
      fields: [{ name: 'ac', label: '对角线', display: 'AC', value: 2 * ab }],
    };
  }
  const d = 2 * randInt(2, 10);
  const [k, r] = simplifyRoot(3 * (d / 2) ** 2);
  return {
    prompt: `一个矩形的一条对角线长为 ${d}，两条对角线的一个交角为 ${m('120^\\circ')}。求这个矩形的两条边长。`,
    steps: [
      '对角线互相平分且相等，交角 120° 的邻角是 60°，所以短边与两条半对角线组成等边三角形。',
      `短边 ${m(`= \\dfrac{${d}}{2} = ${d / 2}`)}；长边 ${m(`= \\sqrt{${d}^2 - ${d / 2}^2} = ${rootTex(k, r)}`)}。`,
    ],
    answer: `${d / 2} 和 ${rootTex(k, r)}`,
    fields: [
      { name: 's', label: '短边', display: 'a', value: d / 2 },
      { name: 'l', label: '长边', display: 'b', type: 'expr', value: rootPlain(k, r), form: 'radical', placeholder: '如 4√3' },
    ],
  };
}

/** 直角三角形斜边上的中线 */
export function genMedianHyp() {
  const [p, q, r] = pickOne(TRIPLES);
  return {
    prompt: `在 Rt△ABC 中，${m('\\angle ACB = 90^\\circ')}，${m(`AC = ${p}`)}，${m(`BC = ${q}`)}，CD 是斜边 AB 上的中线。求 CD 的长。`,
    figure: <GeoFig width={220} points={{ A: [0, 2.4], C: [0, 0], B: [3.2, 0], D: [1.6, 1.2] }} segments={['AB', 'BC', 'CA', { s: 'C D', color: '#e0245e' }]} right={['A C B']} labelPos={{ C: 'sw', D: 'ne' }} />,
    steps: [`${m(`AB = \\sqrt{${p}^2 + ${q}^2} = ${r}`)}。`, '直角三角形斜边上的中线等于斜边的一半（矩形对角线相等且互相平分）。', `${m(`CD = \\dfrac12 AB = ${num(r / 2)}`)}。`],
    answer: m(`CD = ${num(r / 2)}`),
    fields: [{ name: 'cd', label: '长', display: 'CD', value: r / 2 }],
  };
}

/** 菱形：由对角线求边长、面积；或例 3 花坛 */
export function genRhombus() {
  if (Math.random() < 0.55) {
    const [p, q, r] = pickOne(TRIPLES);
    const ac = 2 * p;
    const bd = 2 * q;
    return {
      prompt: `菱形 ABCD 的两条对角线 ${m(`AC = ${ac}`)}，${m(`BD = ${bd}`)}。求菱形的边长、面积和 AB 边上的高。`,
      figure: <GeoFig width={200} points={{ A: [0, 1.5], B: [2, 0], C: [0, -1.5], D: [-2, 0], O: [0, 0] }} segments={['AB', 'BC', 'CD', 'DA', { s: 'A C', dash: true }, { s: 'B D', dash: true }]} right={['A O B']} labelPos={{ O: 'sw' }} />,
      steps: [
        '菱形的对角线互相垂直平分。',
        `${m(`OA = ${p}`)}，${m(`OB = ${q}`)}，${m(`AB = \\sqrt{${p}^2 + ${q}^2} = ${r}`)}。`,
        `面积 = 对角线乘积的一半：${m(`S = \\dfrac12\\times ${ac}\\times ${bd} = ${(ac * bd) / 2}`)}。`,
        `高 ${m(`h = S\\div AB = ${(ac * bd) / 2}\\div ${r} = ${num((ac * bd) / 2 / r, 2)}`)}。`,
      ],
      answer: `边长 ${r}，面积 ${(ac * bd) / 2}，高 ${num((ac * bd) / 2 / r, 2)}`,
      fields: [
        { name: 'ab', label: '边长', display: 'AB', value: r },
        { name: 's', label: '面积', display: 'S', value: (ac * bd) / 2 },
        { name: 'h', label: '高（可写分数）', display: 'h', value: (ac * bd) / 2 / r },
      ],
    };
  }
  const a = 2 * randInt(3, 15);
  return {
    prompt: `菱形花坛 ABCD 的边长为 ${a} m，${m('\\angle ABC = 60^\\circ')}，沿两条对角线修了小路 AC 和 BD。求两条小路的长和花坛的面积（结果用根号表示）。`,
    figure: <GeoFig width={220} points={{ A: [0, 1], B: [-1.73, 0], C: [0, -1], D: [1.73, 0], O: [0, 0] }} segments={['AB', 'BC', 'CD', 'DA', { s: 'A C', dash: true }, { s: 'B D', dash: true }]} labelPos={{ O: 'se' }} />,
    steps: [
      '∠ABC = 60°，AB = BC，所以 △ABC 是等边三角形，AC = AB。',
      `${m(`AC = ${a}`)}；${m(`OB = \\sqrt{${a}^2 - ${a / 2}^2} = ${rootTex(a / 2, 3)}`)}，${m(`BD = ${rootTex(a, 3)}`)}。`,
      `${m(`S = \\dfrac12 AC\\cdot BD = \\dfrac12\\times ${a}\\times ${rootTex(a, 3)} = ${rootTex((a * a) / 2, 3)}`)}（m²）。`,
    ],
    answer: `AC = ${a} m，BD = ${a}√3 m，S = ${(a * a) / 2}√3 m²`,
    fields: [
      { name: 'ac', label: 'm', display: 'AC', value: a },
      { name: 'bd', label: 'm', display: 'BD', type: 'expr', value: `${a}*√3`, form: 'radical' },
      { name: 's', label: 'm²', display: 'S', type: 'expr', value: `${(a * a) / 2}*√3`, form: 'radical' },
    ],
  };
}

/** 正方形：对角线与边长、面积 */
export function genSquare() {
  if (Math.random() < 0.5) {
    const a = randInt(2, 12);
    return {
      prompt: `正方形 ABCD 的边长为 ${a}。求对角线 AC 的长和 ${m('\\angle OAB')} 的度数（O 是对角线交点）。`,
      figure: <GeoFig width={180} points={{ A: [0, 2], B: [0, 0], C: [2, 0], D: [2, 2], O: [1, 1] }} segments={['AB', 'BC', 'CD', 'DA', { s: 'A C', dash: true }, { s: 'B D', dash: true }]} labelPos={{ O: 'e' }} />,
      steps: ['正方形既是矩形又是菱形：对角线相等、互相垂直平分，每条对角线平分一组对角。', `${m(`AC = \\sqrt{${a}^2 + ${a}^2} = ${a === 1 ? '' : a}\\sqrt2`)}；${m('\\angle OAB = 45^\\circ')}。`],
      answer: `AC = ${a}√2，∠OAB = 45°`,
      fields: [
        { name: 'ac', label: '长', display: 'AC', type: 'expr', value: `${a}*√2`, form: 'radical' },
        { name: 'ang', label: '度数', display: '\\angle OAB', value: 45 },
      ],
    };
  }
  const d = randInt(2, 16);
  return {
    prompt: `正方形的对角线长为 ${d}。求它的面积。`,
    steps: ['正方形也是菱形，面积 = 对角线乘积的一半。', `${m(`S = \\dfrac12\\times ${d}\\times ${d} = ${num((d * d) / 2)}`)}。`],
    answer: `${num((d * d) / 2)}`,
    fields: [{ name: 's', label: '面积', display: 'S', value: (d * d) / 2 }],
  };
}

/** 特殊平行四边形的判定 */
const SPECIAL = [
  ['▱ABCD 中，∠A = 90°', '矩形', '有一个角是直角的平行四边形是矩形'],
  ['▱ABCD 中，AC = BD', '矩形', '对角线相等的平行四边形是矩形'],
  ['四边形 ABCD 中，∠A = ∠B = ∠C = 90°', '矩形', '有三个角是直角的四边形是矩形'],
  ['▱ABCD 中，AB = BC', '菱形', '有一组邻边相等的平行四边形是菱形'],
  ['▱ABCD 中，AC ⊥ BD', '菱形', '对角线互相垂直的平行四边形是菱形'],
  ['四边形 ABCD 中，AB = BC = CD = DA', '菱形', '四条边相等的四边形是菱形'],
  ['矩形 ABCD 中，AB = BC', '正方形', '有一组邻边相等的矩形是正方形'],
  ['菱形 ABCD 中，∠A = 90°', '正方形', '有一个角是直角的菱形是正方形'],
  ['▱ABCD 中，AC = BD，AC ⊥ BD', '正方形', '对角线相等（矩形）且垂直（菱形）'],
  ['▱ABCD 中，AB = CD', '一般平行四边形', '对边相等是所有平行四边形都有的性质'],
];
export function genSpecialCriteria() {
  const [cond, kind, why] = pickOne(SPECIAL);
  const opts = ['一般平行四边形', '矩形', '菱形', '正方形'];
  return {
    prompt: `已知：${cond}。四边形 ABCD 一定是（选最具体的一种）？`,
    steps: [`${why}。`, '记关系：正方形既是矩形又是菱形；矩形、菱形都是平行四边形。'],
    answer: kind,
    fields: [{ name: 'k', label: '一定是', type: 'choice', options: opts, value: kind }],
  };
}

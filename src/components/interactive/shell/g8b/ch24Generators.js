import React from 'react';
import { randInt, pickOne } from '../mathRandom';
import { m, num, fracTex } from '../examKit';
import GeoFig from '../../GeoFig';
import { simplifyRoot } from '../g8a/ch23Generators';

/** 第二十四章 勾股定理 — randomized items for MixedPractice. */

export const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [12, 16, 20],
  [20, 21, 29],
  [9, 40, 41],
  [10, 24, 26],
  [15, 20, 25],
];
const rootTex = (k, r) => (r === 1 ? `${k}` : `${k === 1 ? '' : k}\\sqrt{${r}}`);
const rootPlain = (k, r) => (r === 1 ? `${k}` : `${k}*√${r}`);
const radField = (n, opts = {}) => {
  const [k, r] = simplifyRoot(n);
  return { type: 'expr', value: rootPlain(k, r), form: 'radical', placeholder: '整数或最简二次根式，如 2√5', ...opts };
};
const rightTri = (labels = {}) => (
  <GeoFig
    width={200}
    points={{ A: [0, 2.4], B: [3.2, 0], C: [0, 0] }}
    segments={['AB', 'BC', 'CA']}
    right={['A C B']}
    labelPos={{ C: 'sw' }}
    {...labels}
  />
);

/** 已知两边求第三边（整数或二次根式） */
export function genPythagorasSide() {
  const findHyp = Math.random() < 0.5;
  const useTriple = Math.random() < 0.6;
  let a;
  let b;
  let c2;
  if (useTriple) {
    const [p, q, r] = pickOne(TRIPLES);
    [a, b] = Math.random() < 0.5 ? [p, q] : [q, p];
    c2 = r * r;
  } else {
    a = randInt(1, 9);
    b = randInt(2, 10);
    c2 = a * a + b * b;
  }
  const c = Math.sqrt(c2);
  if (findHyp) {
    const [k, r] = simplifyRoot(c2);
    return {
      prompt: `在 Rt△ABC 中，${m('\\angle C = 90^\\circ')}，${m(`a = ${a}`)}，${m(`b = ${b}`)}。求斜边 ${m('c')}。`,
      figure: rightTri(),
      steps: ['勾股定理：直角三角形两条直角边的平方和等于斜边的平方，$a^2 + b^2 = c^2$。', `${m(`c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c2}`)}`, `${m(`c = \\sqrt{${c2}} = ${rootTex(k, r)}`)}${r === 1 ? '' : `（≈ ${num(c, 2)}）`}`],
      answer: m(`c = ${rootTex(k, r)}`),
      fields: [radField(c2, { name: 'c', display: 'c', label: '斜边' })],
    };
  }
  const leg2 = c2 - a * a;
  const [k, r] = simplifyRoot(leg2);
  const cTex = Number.isInteger(c) ? `${c}` : `\\sqrt{${c2}}`;
  return {
    prompt: `在 Rt△ABC 中，${m('\\angle C = 90^\\circ')}，斜边 ${m(`c = ${cTex}`)}，直角边 ${m(`a = ${a}`)}。求另一条直角边 ${m('b')}。`,
    figure: rightTri(),
    steps: ['由 $a^2 + b^2 = c^2$ 得 $b^2 = c^2 - a^2$（求直角边用减法）。', `${m(`b^2 = ${c2} - ${a * a} = ${leg2}`)}，${m(`b = ${rootTex(k, r)}`)}`],
    answer: m(`b = ${rootTex(k, r)}`),
    fields: [radField(leg2, { name: 'b', display: 'b', label: '直角边' })],
  };
}

/** 例 2 型：梯子顶端下滑，底端外移多少？ */
export function genLadder() {
  const [p, q, r] = pickOne([[7, 24, 25], [6, 8, 10], [15, 20, 25], [12, 16, 20], [9, 12, 15], [10, 24, 26]]);
  const s = pickOne([0.1, 0.2]);
  const L = r * s;
  const h = q * s; // 墙高
  const b0 = p * s; // 底端到墙
  const drops = [];
  for (let d = 1; d < 40; d++) {
    const nh = h - d * 0.1;
    const nb = Math.sqrt(L * L - nh * nh);
    if (nh > 0 && Math.abs(nb * 10 - Math.round(nb * 10)) < 1e-9) drops.push([d / 10, nb]);
  }
  const [drop, nb] = drops.length ? pickOne(drops) : [h - b0, h];
  return {
    prompt: `一架 ${num(L)} m 长的梯子 AB 斜靠在竖直的墙 AO 上，这时 AO 为 ${num(h)} m。如果梯子顶端 A 沿墙下滑 ${num(drop)} m，梯子底端 B 外移多少米？`,
    figure: <GeoFig width={220} points={{ A: [0, 2.4], O: [0, 0], B: [0.7, 0], C: [0, 1.9], D: [1.3, 0] }} segments={['A O', 'O D', { s: 'A B', color: '#4a90d9' }, { s: 'C D', color: '#e0245e', dash: true }]} right={['A O B']} labelPos={{ O: 'sw' }} />,
    steps: [
      `下滑前：${m(`OB = \\sqrt{AB^2 - OA^2} = \\sqrt{${num(L)}^2 - ${num(h)}^2} = ${num(b0)}`)} m。`,
      `下滑后 ${m(`OC = ${num(h)} - ${num(drop)} = ${num(h - drop)}`)}，${m(`OD = \\sqrt{${num(L)}^2 - ${num(h - drop)}^2} = ${num(nb)}`)} m。`,
      `${m(`BD = OD - OB = ${num(nb)} - ${num(b0)} = ${num(nb - b0)}`)} m。${Math.abs(nb - b0 - drop) < 1e-9 ? '正好也是' : '和顶端下滑的距离不一样，'}${num(drop)} m${Math.abs(nb - b0 - drop) < 1e-9 ? '（巧合）。' : '。'}`,
    ],
    answer: `${num(nb - b0)} m`,
    fields: [{ name: 'bd', label: '外移（m）', display: 'BD', value: nb - b0, tol: 0.006 }],
  };
}

/** 例 1 型：木板能否从门框通过 */
export function genDoorBoard() {
  const w = randInt(8, 15) / 10; // 门宽
  const hgt = randInt(18, 22) / 10;
  const diag = Math.sqrt(w * w + hgt * hgt);
  const board = Math.random() < 0.5 ? Math.floor(diag * 10 - 1) / 10 : Math.ceil(diag * 10 + 0.5) / 10;
  const can = board < diag;
  return {
    prompt: `一个门框宽 ${num(w)} m、高 ${num(hgt)} m。一块长 3 m、宽 ${num(board)} m 的长方形薄木板能否从门框内通过？（填对角线长，保留两位小数）`,
    figure: <GeoFig width={160} points={{ A: [0, 2], B: [0, 0], C: [1, 0], D: [1, 2] }} segments={['AB', 'BC', 'CD', 'DA', { s: 'A C', dash: true, color: '#e0245e' }]} />,
    steps: [
      '横着、竖着都过不去，只能斜着过。门框对角线 AC 是斜着能通过的最大宽度。',
      `${m(`AC = \\sqrt{${num(w)}^2 + ${num(hgt)}^2} = \\sqrt{${num(w * w + hgt * hgt, 4)}} \\approx ${num(diag, 2)}`)} m。`,
      `${num(diag, 2)} ${can ? '>' : '<'} ${num(board)}，所以木板${can ? '能' : '不能'}通过。`,
    ],
    answer: `AC ≈ ${num(diag, 2)} m，${can ? '能' : '不能'}通过`,
    fields: [
      { name: 'ac', label: '对角线 AC（m）', display: 'AC', value: diag, tol: 0.006 },
      { name: 'can', label: '能否通过', type: 'choice', options: ['能', '不能'], value: can ? '能' : '不能' },
    ],
  };
}

/** 勾股定理的逆定理：判断是不是直角三角形 */
export function genIsRight() {
  let s;
  if (Math.random() < 0.5) {
    const [p, q, r] = pickOne(TRIPLES);
    s = [p, q, r];
  } else {
    const [p, q, r] = pickOne(TRIPLES);
    s = [p, q, r + pickOne([-1, 1])];
    if (s[2] <= s[1]) s[2] = s[1] + 1;
  }
  const order = [...s].sort(() => Math.random() - 0.5);
  const [a, b, c] = [...s].sort((x, y) => x - y);
  const yes = a * a + b * b === c * c;
  return {
    prompt: `由线段 ${m(`a = ${order[0]}`)}、${m(`b = ${order[1]}`)}、${m(`c = ${order[2]}`)} 组成的三角形是不是直角三角形？`,
    steps: [
      '逆定理：如果三角形三边长满足 $a^2 + b^2 = c^2$，那么它是直角三角形。只要看**两条较小边**的平方和是否等于**最大边**的平方。',
      `${m(`${a}^2 + ${b}^2 = ${a * a + b * b}`)}，${m(`${c}^2 = ${c * c}`)}。`,
      yes ? `相等，所以是直角三角形（最大边 ${c} 所对的角是直角）。` : '不相等，所以不是直角三角形。',
    ],
    answer: yes ? '是' : '不是',
    fields: [{ name: 'r', label: '直角三角形？', type: 'choice', options: ['是', '不是'], value: yes ? '是' : '不是' }],
  };
}

/** 网格 / 坐标中两点距离 */
export function genGridDistance() {
  const x1 = randInt(-5, 3);
  const y1 = randInt(-5, 3);
  const dx = randInt(1, 6) * pickOne([1, -1]);
  const dy = randInt(1, 6) * pickOne([1, -1]);
  const d2 = dx * dx + dy * dy;
  const [k, r] = simplifyRoot(d2);
  return {
    prompt: `在平面直角坐标系中，点 ${m(`A(${x1},\\ ${y1})`)}，${m(`B(${x1 + dx},\\ ${y1 + dy})`)}。求线段 AB 的长。`,
    figure: (
      <GeoFig grid width={240} range={[-7, 7, -7, 7]} points={{ A: [x1, y1], B: [x1 + dx, y1 + dy], C: [x1 + dx, y1] }} segments={[{ s: 'A B', color: '#e0245e' }, { s: 'A C', dash: true }, { s: 'C B', dash: true }]} right={['A C B']} hide={['C']} />
    ),
    steps: [
      `构造直角三角形：水平方向相差 ${m(`|${dx}| = ${Math.abs(dx)}`)}，竖直方向相差 ${m(`|${dy}| = ${Math.abs(dy)}`)}。`,
      `${m(`AB = \\sqrt{${Math.abs(dx)}^2 + ${Math.abs(dy)}^2} = \\sqrt{${d2}} = ${rootTex(k, r)}`)}`,
    ],
    answer: m(`AB = ${rootTex(k, r)}`),
    fields: [radField(d2, { name: 'ab', display: 'AB', label: '长' })],
  };
}

/** 长方形纸片折叠：AB = a，BC = b，沿 AE 折叠使 D 落在 BC 上的 F，求 EC */
export function genFoldRect() {
  const [p, q, r] = pickOne([[6, 8, 10], [3, 4, 5], [9, 12, 15], [12, 16, 20], [5, 12, 13]]);
  // AF = AD = r and AB = p, so BF = q (a Pythagorean triple)
  const AB = p;
  const AD = r;
  const BF = q;
  const FC = AD - BF;
  // EC = x, EF = DE = AB − x: (p − x)² = x² + FC² → x = (p² − FC²)/(2p)
  const x = (AB * AB - FC * FC) / (2 * AB);
  if (x <= 0) return genFoldRect();
  return {
    prompt: `长方形纸片 ABCD 中，${m(`AB = ${AB}`)}，${m(`AD = ${AD}`)}。沿 AE 折叠（E 在 CD 上），使点 D 落在 BC 边上的点 F 处。求 CE 的长。`,
    figure: (
      <GeoFig
        width={240}
        points={{ A: [0, 3], B: [0, 0], C: [5, 0], D: [5, 3], F: [4, 0], E: [5, 1.33] }}
        segments={['AB', 'BC', 'CD', 'DA', { s: 'A E', color: '#e0245e' }, { s: 'A F', dash: true }, { s: 'F E', dash: true }]}
        labelPos={{ F: 's', E: 'e' }}
      />
    ),
    steps: [
      `折叠前后对应线段相等：${m(`AF = AD = ${AD}`)}，${m('EF = DE')}。`,
      `Rt△ABF：${m(`BF = \\sqrt{${AD}^2 - ${AB}^2} = ${BF}`)}，所以 ${m(`FC = ${AD} - ${BF} = ${FC}`)}。`,
      `设 ${m('CE = x')}，则 ${m(`EF = DE = ${AB} - x`)}。Rt△EFC：${m(`x^2 + ${FC}^2 = (${AB} - x)^2`)}，${m(`${2 * AB}x = ${AB * AB - FC * FC}`)}，${m(`x = ${fracTex(AB * AB - FC * FC, 2 * AB)}`)}。`,
    ],
    answer: m(`CE = ${fracTex(AB * AB - FC * FC, 2 * AB)}`),
    fields: [{ name: 'ce', label: '长', display: 'CE', value: x }],
  };
}

/** 例 2（24.2）型：两船航向 —— 用逆定理判断夹角是直角 */
export function genShips() {
  const [p, q, r] = pickOne([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
  let t;
  let scale;
  do {
    t = pickOne([1, 1.5, 2]);
    scale = pickOne([2, 3, 4]);
  } while (!Number.isInteger((q * scale) / t) || !Number.isInteger((p * scale) / t));
  const V1 = (q * scale) / t;
  const V2 = (p * scale) / t;
  const d = r * scale;
  const dir1 = pickOne(['东北', '西北']);
  const dir2 = dir1 === '东北' ? '西北' : '东北';
  return {
    prompt: `两艘轮船同时离开港口 P，“远航”号每小时航行 ${num(V1)} 海里，“海天”号每小时航行 ${num(V2)} 海里。${num(t)} 小时后它们相距 ${d} 海里。已知“远航”号沿${dir1}方向航行，“海天”号向北偏哪边航行？两船航向的夹角是多少度？`,
    steps: [
      `${num(t)} 小时后：PQ ${m(`= ${num(V1)}\\times ${num(t)} = ${num(V1 * t)}`)}，PR ${m(`= ${num(V2)}\\times ${num(t)} = ${num(V2 * t)}`)}，QR = ${d}。`,
      `${m(`${num(V1 * t)}^2 + ${num(V2 * t)}^2 = ${num((V1 * t) ** 2 + (V2 * t) ** 2)} = ${d}^2`)}，由勾股定理的逆定理，${m('\\angle QPR = 90^\\circ')}。`,
      `“远航”号沿${dir1}方向（与正北成 45°），所以“海天”号沿${dir2}方向航行。`,
    ],
    answer: `夹角 90°，“海天”号沿${dir2}方向`,
    fields: [
      { name: 'ang', label: '航向夹角（度）', display: '\\angle QPR', value: 90 },
      { name: 'dir', label: '“海天”号方向', type: 'choice', options: ['东北', '西北'], value: dir2 },
    ],
  };
}

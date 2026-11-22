import React from 'react';
import MathText from '@site/src/components/ProblemSet/MathText';
import { randInt } from './mathRandom';

/**
 * Small building blocks for the 期末卷「原题 / 换数字」generators
 * (grade7ExamGenerators.js, grade8ExamGenerators.js):
 *  - number / sign / fraction formatting for TeX;
 *  - a multiple-choice helper that keeps the paper's option order for 原题
 *    and shuffles (moves the true answer) otherwise;
 *  - React figures rendered under the prompt: option list, sub-question list,
 *    fill-in table, number line.
 * Generators return { prompt, figure?, steps, answer, fields } for MixedPractice.
 */

export const m = (expr) => `$${expr}$`;

export function nonzero(min, max) {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** p/q as TeX: integer when exact, otherwise (-)\dfrac{p}{q}. */
export function fracTex(p, q) {
  if (q < 0) {
    p = -p;
    q = -q;
  }
  const g = gcd(p, q);
  p /= g;
  q /= g;
  if (q === 1) return `${p}`;
  return `${p < 0 ? '-' : ''}\\dfrac{${Math.abs(p)}}{${q}}`;
}

/** Wrap negatives in parentheses: 3 → "3", -3 → "(-3)". */
export const par = (n) => (n < 0 ? `(${n})` : `${n}`);

/** Coefficient·variable as the leading term: 1→x, -1→-x, 3→3x. */
export function lead(c, v) {
  if (c === 1) return v;
  if (c === -1) return `-${v}`;
  return `${c}${v}`;
}

/** Following term with its sign: +3x, - x, + 5 (v omitted for constants). */
export function signed(c, v = '') {
  const abs = Math.abs(c);
  const core = v ? (abs === 1 ? v : `${abs}${v}`) : `${abs}`;
  return c < 0 ? ` - ${core}` : ` + ${core}`;
}

/** a·v + b as TeX, dropping a zero part. */
export function lin(a, b, v) {
  if (a === 0) return `${b}`;
  return b === 0 ? lead(a, v) : `${lead(a, v)}${signed(b)}`;
}

/** Round for display (money / km), trimming trailing zeros. */
export const num = (n, d = 2) => String(Number(Number(n).toFixed(d)));

const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Multiple choice. `options`: four option strings (MathText), `correct`: index into it.
 * 原题 keeps the printed order; otherwise the options (and the true answer) are shuffled.
 * Returns { figure, field, letter, text }.
 */
export function choice(options, correct, original) {
  const order = original ? options.map((_, i) => i) : shuffle(options.map((_, i) => i));
  const shown = order.map((i) => options[i]);
  const letter = LETTERS[order.indexOf(correct)];
  return {
    figure: <ChoiceList options={shown} />,
    field: { name: 'choice', label: '选', type: 'choice', options: LETTERS, value: letter },
    letter,
    text: options[correct],
  };
}

export function ChoiceList({ options }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '6px 18px',
        margin: '10px 0 4px',
      }}
    >
      {options.map((o, i) => (
        <div key={i}>
          <b>{LETTERS[i]}.</b> <MathText text={o} />
        </div>
      ))}
    </div>
  );
}

/** Lettered sub-questions under the stem: [['a', '每份…'], …]. */
export function Parts({ items }) {
  return (
    <ol style={{ listStyle: 'none', paddingLeft: '0.5em', margin: '8px 0' }}>
      {items.map(([k, text]) => (
        <li key={k} style={{ margin: '4px 0' }}>
          <b>{k}.</b> <MathText text={text} />
        </li>
      ))}
    </ol>
  );
}

/** A blank cell marker: blank('①') shows a boxed ① the student fills below. */
export const blank = (tag) => ({ blank: tag });

const cellStyle = {
  border: '1px solid var(--ifm-color-emphasis-400)',
  padding: '4px 10px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
};

/** Fill-in table. Cells are strings (MathText) or blank(tag). */
export function ExamTable({ head, rows, caption }) {
  return (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
      {caption ? (
        <div style={{ fontSize: '0.92em', margin: '0 0 4px' }}>
          <MathText text={caption} />
        </div>
      ) : null}
      <table style={{ borderCollapse: 'collapse', display: 'table', width: 'auto', margin: 0 }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ ...cellStyle, background: 'var(--ifm-color-emphasis-100)' }}>
                <MathText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={cellStyle}>
                  {c && typeof c === 'object' && c.blank ? (
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: 34,
                        borderBottom: '1.5px solid var(--ifm-color-primary)',
                        color: 'var(--ifm-color-primary)',
                        fontWeight: 700,
                      }}
                    >
                      {c.blank}
                    </span>
                  ) : (
                    <MathText text={c == null ? '' : String(c)} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Circled tags ① … ⑳ for table blanks. */
export const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'.split('');

/** Number field for a table blank: shows "label ① =". */
export const cellField = (i, label, value, extra = {}) => ({
  name: `c${i}`,
  label,
  display: `\\text{${CIRCLED[i]}}`,
  value,
  ...extra,
});

/** Choice field (是 / 否) for a table blank. */
export const yesNoField = (i, label, yes) => ({
  name: `c${i}`,
  label: `${CIRCLED[i]} ${label}`,
  type: 'choice',
  options: ['是', '否'],
  value: yes ? '是' : '否',
});

/**
 * Number line in the exam's style.
 * ticks: [{ x, label }]; marks: [{ from, to, open?, closed?, level }] where
 * from/to are numbers or ±Infinity, `fromOpen` / `toOpen` decide hollow vs filled dots.
 * Values are laid out by rank (not to scale) so any numbers fit.
 */
export function NumberLine({ ticks, rays, width = 380 }) {
  const values = [...new Set(ticks.map((t) => t.x))].sort((a, b) => a - b);
  const pad = 70;
  const span = width - 2 * pad;
  const pos = (v) => {
    if (v === -Infinity) return 14;
    if (v === Infinity) return width - 26;
    if (values.length === 1) return width / 2;
    return pad + (span * values.indexOf(v)) / (values.length - 1);
  };
  const levels = Math.max(1, ...rays.map((r) => r.level || 1));
  const axisY = 18 + levels * 16;
  const h = axisY + 30;
  return (
    <svg
      viewBox={`0 0 ${width} ${h}`}
      style={{ width: '100%', maxWidth: width, display: 'block', margin: '8px 0' }}
      role="img"
      aria-label="数轴"
    >
      <line x1="6" y1={axisY} x2={width - 8} y2={axisY} stroke="var(--ifm-color-emphasis-700)" strokeWidth="1.5" />
      <path d={`M${width - 2},${axisY} l-10,-5 l0,10 z`} fill="var(--ifm-color-emphasis-700)" />
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pos(t.x)} x2={pos(t.x)} y1={axisY - 4} y2={axisY + 4} stroke="var(--ifm-color-emphasis-700)" />
          <text x={pos(t.x)} y={axisY + 20} textAnchor="middle" fontSize="13" fill="var(--ifm-font-color-base)">
            {t.label ?? t.x}
          </text>
        </g>
      ))}
      {rays.map((r, i) => {
        const y = axisY - (r.level || 1) * 16;
        const color = r.color || '#e0245e';
        const x1 = pos(r.from);
        const x2 = pos(r.to);
        const dot = (v, open) =>
          Number.isFinite(v) ? (
            <g>
              <line x1={pos(v)} x2={pos(v)} y1={y} y2={axisY} stroke={color} strokeWidth="2" />
              <circle
                cx={pos(v)}
                cy={axisY}
                r="5"
                fill={open ? 'var(--ifm-background-color)' : color}
                stroke={color}
                strokeWidth="2"
              />
            </g>
          ) : null;
        return (
          <g key={i} style={{ color }}>
            <line x1={x1} x2={x2} y1={y} y2={y} stroke={color} strokeWidth="2.2" />
            {r.from === -Infinity ? <path d={`M${x1 - 4},${y} l10,-5 l0,10 z`} fill={color} /> : null}
            {r.to === Infinity ? <path d={`M${x2 + 4},${y} l-10,-5 l0,10 z`} fill={color} /> : null}
            {dot(r.from, r.fromOpen)}
            {dot(r.to, r.toOpen)}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Rays from O in the exam's angle figures. rays: [{ deg, label, color }], deg measured
 * counter-clockwise from the positive x-axis. `line`: draw the straight line A—B.
 */
export function RayFan({ rays, right = null, width = 300 }) {
  const cx = width / 2;
  const cy = 120;
  const R = 105;
  const pt = (deg, r = R) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
  return (
    <svg viewBox={`0 0 ${width} 145`} style={{ width: '100%', maxWidth: width, display: 'block', margin: '8px 0' }} role="img" aria-label="角的示意图">
      {right != null ? (
        (() => {
          const s = 14;
          const [ax, ay] = pt(right, s);
          const [bx, by] = pt(right + 90, s);
          const [qx, qy] = [ax + bx - cx, ay + by - cy];
          return <path d={`M${ax},${ay} L${qx},${qy} L${bx},${by}`} fill="none" stroke="#e0245e" strokeWidth="1.2" />;
        })()
      ) : null}
      {rays.map((r, i) => {
        const [x, y] = pt(r.deg);
        const [lx, ly] = pt(r.deg, R + 12);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={r.color || 'var(--ifm-color-emphasis-800)'} strokeWidth="1.8" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="13" fill="var(--ifm-font-color-base)">
              {r.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="2.5" fill="var(--ifm-font-color-base)" />
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="13" fill="var(--ifm-font-color-base)">
        O
      </text>
    </svg>
  );
}

/** Wrap several figure pieces. */
export const Fig = ({ children }) => <div>{children}</div>;

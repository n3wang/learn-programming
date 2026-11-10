/**
 * Helpers for simulators that report answer fields to the 综合练习 runner
 * (usePracticeAnswer in PracticeModeContext.js). They turn the display strings
 * simulators already keep — 'x > −6', 'x ≤ 5/4', '2 < x < 4', '无解' — into
 * field objects the runner can grade.
 */

/** '−5/4' / '-2.5' / '3' → number (NaN when unreadable). */
export function parseNum(s) {
  const t = String(s).replace(/[−–—]/g, '-').replace(/\s+/g, '');
  const frac = /^([+-]?)(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t);
  if (frac) return (frac[1] === '-' ? -1 : 1) * (Number(frac[2]) / Number(frac[3]));
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN;
}

const NUM = '([−–\\-+]?\\s*\\d+(?:\\.\\d+)?(?:\\s*/\\s*\\d+(?:\\.\\d+)?)?)';
const normOp = (op) => ({ '<=': '≤', '>=': '≥', '⩽': '≤', '⩾': '≥' })[op] || op;

/**
 * Parse a solution-set string.
 *  'x > −6'        → { kind: 'ineq', v: 'x', op: '>', bound: -6 }
 *  '−1 < x ≤ 4'    → { kind: 'range', v: 'x', lo: -1, loIncl: false, hi: 4, hiIncl: true }
 *  '无解'           → { kind: 'none' }
 * Returns null if the string is not a solution set.
 */
export function parseSolutionSet(str) {
  const s = String(str).trim();
  if (/无解|空集|∅/.test(s)) return { kind: 'none' };
  let m = new RegExp(`^${NUM}\\s*(<=|<|≤|⩽)\\s*([a-z])\\s*(<=|<|≤|⩽)\\s*${NUM}$`).exec(s);
  if (m) {
    return {
      kind: 'range',
      v: m[3],
      lo: parseNum(m[1]),
      loIncl: normOp(m[2]) === '≤',
      hi: parseNum(m[5]),
      hiIncl: normOp(m[4]) === '≤',
    };
  }
  m = new RegExp(`^([a-z])\\s*=\\s*${NUM}$`).exec(s);
  if (m) {
    const at = parseNum(m[2]);
    return { kind: 'range', v: m[1], lo: at, loIncl: true, hi: at, hiIncl: true };
  }
  m = new RegExp(`^([a-z])\\s*(<=|>=|<|>|≤|≥|⩽|⩾)\\s*${NUM}$`).exec(s);
  if (m) return { kind: 'ineq', v: m[1], op: normOp(m[2]), bound: parseNum(m[3]) };
  return null;
}

/** Single-inequality answer: `x [op] [bound]`. */
export function ineqField(name, label, resultStr) {
  const p = parseSolutionSet(resultStr);
  if (!p || p.kind !== 'ineq') return null;
  return { name, label, type: 'ineq', display: p.v, value: { op: p.op, bound: p.bound } };
}

/**
 * Solution set of a system: always the two-sided `[lo] op x op [hi]` / 无解 input,
 * so the input's shape does not give away whether the answer is one-sided or empty.
 */
export function rangeField(name, label, resultStr) {
  const p = parseSolutionSet(resultStr);
  if (!p) return null;
  if (p.kind === 'none') return { name, label, type: 'range', display: 'x', value: 'none' };
  if (p.kind === 'range') {
    return { name, label, type: 'range', display: p.v, value: { lo: p.lo, loIncl: p.loIncl, hi: p.hi, hiIncl: p.hiIncl } };
  }
  const lower = p.op === '>' || p.op === '≥';
  return {
    name,
    label,
    type: 'range',
    display: p.v,
    value: lower
      ? { lo: p.bound, loIncl: p.op === '≥', hi: null, hiIncl: false }
      : { lo: null, loIncl: false, hi: p.bound, hiIncl: p.op === '≤' },
  };
}

/** Choice answer, e.g. a missing inequality sign. */
export function choiceField(name, label, options, value) {
  return { name, label, type: 'choice', options, value };
}

/**
 * Plain number answer. `display` is the TeX shown before “=”.
 * `value` may be a number or a numeric string (e.g. a simulator's fmtNum(…, 4) text);
 * pass `tol` when the simulator only knows the answer rounded.
 */
export function numberField(name, label, value, display, tol) {
  const f = { name, label, value: Number(value), display: display || name };
  if (tol) f.tol = tol;
  return f;
}

/**
 * Angle answer in 度分秒. `value` is { d, m, s } or total seconds; the student fills
 * ° ′ (and ″ when `seconds`) boxes and must write minutes / seconds below 60.
 */
export function dmsField(name, label, value, seconds = false, tol = 0) {
  const total = typeof value === 'number' ? value : (value.d || 0) * 3600 + (value.m || 0) * 60 + (value.s || 0);
  const f = { name, label, type: 'dms', value: total, seconds };
  if (tol) f.tol = tol; // seconds of slack, e.g. 30 for “精确到分”
  return f;
}

/** Degrees given as a plain number (e.g. 60 for 60°), shown as `label = [ ]°`. */
export function degField(name, label, deg) {
  return { name, label, type: 'dms', value: deg * 3600, seconds: false };
}

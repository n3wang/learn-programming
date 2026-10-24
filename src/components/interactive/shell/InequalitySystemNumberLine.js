import React from 'react';

function labelOf(n) {
  if (n == null) return '';
  return String(n).replace('-', '−');
}

export function describeHalf(ineq) {
  const at = labelOf(ineq.label != null ? ineq.label : ineq.at);
  if (ineq.dir === 'right') return ineq.closed ? `x ≥ ${at}` : `x > ${at}`;
  return ineq.closed ? `x ≤ ${at}` : `x < ${at}`;
}

export function describeIntersection(result) {
  if (!result || result.empty) return '无解';
  if (result.kind === 'point') {
    const at = labelOf(result.label != null ? result.label : result.at);
    return `x = ${at}`;
  }
  if (result.kind === 'ray') return describeHalf(result);
  const L = labelOf(result.leftLabel != null ? result.leftLabel : result.left);
  const R = labelOf(result.rightLabel != null ? result.rightLabel : result.right);
  const leftSign = result.leftClosed ? '≤' : '<';
  const rightSign = result.rightClosed ? '≤' : '<';
  return `${L} ${leftSign} x ${rightSign} ${R}`;
}

function loClosedOf(side, lo) {
  if (!Number.isFinite(side.lo)) return true;
  return side.lo === lo ? side.loClosed : true;
}

function hiClosedOf(side, hi) {
  if (!Number.isFinite(side.hi)) return true;
  return side.hi === hi ? side.hiClosed : true;
}

function toHalf(ineq) {
  if (ineq.dir === 'right') {
    return { lo: ineq.at, loClosed: Boolean(ineq.closed), hi: Infinity, hiClosed: false };
  }
  return { lo: -Infinity, loClosed: false, hi: ineq.at, hiClosed: Boolean(ineq.closed) };
}

export function intersectHalves(a, b) {
  const A = toHalf(a);
  const B = toHalf(b);
  const lo = Math.max(A.lo, B.lo);
  const hi = Math.min(A.hi, B.hi);
  const loClosed = loClosedOf(A, lo) && loClosedOf(B, lo);
  const hiClosed = hiClosedOf(A, hi) && hiClosedOf(B, hi);
  const labelFor = (value) => {
    if (value === a.at) return a.label;
    if (value === b.at) return b.label;
    return undefined;
  };

  if (lo > hi) return { empty: true };
  if (lo === hi && !(loClosed && hiClosed)) return { empty: true };
  if (lo === hi) {
    return { kind: 'point', at: lo, closed: true, label: labelFor(lo) };
  }
  if (!Number.isFinite(lo)) {
    return { kind: 'ray', dir: 'left', at: hi, closed: hiClosed, label: labelFor(hi) };
  }
  if (!Number.isFinite(hi)) {
    return { kind: 'ray', dir: 'right', at: lo, closed: loClosed, label: labelFor(lo) };
  }
  return {
    kind: 'seg',
    left: lo,
    leftClosed: loClosed,
    right: hi,
    rightClosed: hiClosed,
    leftLabel: labelFor(lo),
    rightLabel: labelFor(hi),
  };
}

function End({ cx, cy, closed, color }) {
  return closed ? (
    <circle cx={cx} cy={cy} r="5" fill={color} />
  ) : (
    <circle cx={cx} cy={cy} r="5" fill="#fff" stroke={color} strokeWidth="1.8" />
  );
}

function staplePath(x1, x2, y, axisY) {
  return `M ${x1} ${axisY} L ${x1} ${y} L ${x2} ${y} L ${x2} ${axisY}`;
}

function placeTicks(values) {
  const uniq = [];
  values.forEach((v) => {
    if (v == null || !Number.isFinite(v)) return;
    if (!uniq.some((u) => Math.abs(u - v) < 1e-9)) uniq.push(v);
  });
  uniq.sort((p, q) => p - q);
  if (uniq.length === 0) return [];
  if (uniq.length === 1) return [{ value: uniq[0], x: 130 }];
  const min = uniq[0];
  const max = uniq[uniq.length - 1];
  const span = max - min || 1;
  return uniq.map((value) => ({
    value,
    x: 48 + ((value - min) / span) * 164,
  }));
}

function xOf(ticks, value, fallback) {
  const hit = ticks.find((t) => Math.abs(t.value - value) < 1e-9);
  return hit ? hit.x : fallback;
}

/**
 * Textbook-style stacked staples: two source rays plus the common part.
 */
export default function InequalitySystemNumberLine({
  a,
  b,
  extraMarks = [0],
  showSources = true,
  width = '100%',
}) {
  const result = intersectHalves(a, b);
  const ticks = placeTicks([
    ...extraMarks,
    a.at,
    b.at,
    result.kind === 'seg' ? result.left : null,
    result.kind === 'seg' ? result.right : null,
    result.kind === 'ray' || result.kind === 'point' ? result.at : null,
  ]);
  const axisY = 58;
  const srcY = [18, 32];
  const interY = 44;

  const raySpan = (ineq, y, color) => {
    const cx = xOf(ticks, ineq.at, ineq.dir === 'right' ? 92 : 176);
    if (ineq.dir === 'right') {
      return (
        <>
          <path d={`M ${cx} ${axisY} L ${cx} ${y} L 226 ${y}`} fill="none" stroke={color} strokeWidth="2" />
          <polygon points={`226,${y} 216,${y - 5} 216,${y + 5}`} fill={color} />
          <End cx={cx} cy={axisY} closed={ineq.closed} color={color} />
        </>
      );
    }
    return (
      <>
        <path d={`M 34 ${y} L ${cx} ${y} L ${cx} ${axisY}`} fill="none" stroke={color} strokeWidth="2" />
        <polygon points={`34,${y} 44,${y - 5} 44,${y + 5}`} fill={color} />
        <End cx={cx} cy={axisY} closed={ineq.closed} color={color} />
      </>
    );
  };

  const sources = [a, b];
  const srcColor = '#90a4ae';
  const ink = '#e91e63';

  return (
    <svg
      viewBox="0 0 260 84"
      width={width}
      height="90"
      role="img"
      aria-label={`两个解集的公共部分是 ${describeIntersection(result)}`}
    >
      <line x1="12" y1={axisY} x2="238" y2={axisY} stroke="#455a64" strokeWidth="1.4" />
      <polygon points="238,58 228,53 228,63" fill="#455a64" />
      {showSources
        ? sources.map((ineq, i) => <g key={`src-${i}`}>{raySpan(ineq, srcY[i], srcColor)}</g>)
        : null}
      {result.empty ? (
        <text x="130" y="40" textAnchor="middle" fontSize="13" fill="#c62828">
          没有公共部分
        </text>
      ) : null}
      {result.kind === 'ray' ? raySpan(result, interY, ink) : null}
      {result.kind === 'point' ? (
        <End cx={xOf(ticks, result.at, 130)} cy={axisY} closed color={ink} />
      ) : null}
      {result.kind === 'seg' ? (
        <>
          <path
            d={staplePath(xOf(ticks, result.left, 80), xOf(ticks, result.right, 180), interY, axisY)}
            fill="none"
            stroke={ink}
            strokeWidth="2.2"
          />
          <End cx={xOf(ticks, result.left, 80)} cy={axisY} closed={result.leftClosed} color={ink} />
          <End cx={xOf(ticks, result.right, 180)} cy={axisY} closed={result.rightClosed} color={ink} />
        </>
      ) : null}
      {ticks.map((t) => (
        <text key={t.value} x={t.x} y="78" textAnchor="middle" fontSize="12" fill="currentColor">
          {labelOf(t.value === a.at && a.label != null ? a.label : t.value === b.at && b.label != null ? b.label : t.value)}
        </text>
      ))}
    </svg>
  );
}

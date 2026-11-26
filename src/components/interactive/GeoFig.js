import React from 'react';

/**
 * Static labeled geometry figure for lessons and practice items.
 *
 * <GeoFig
 *   points={{ A: [0, 4], B: [-3, 0], C: [3, 0], D: [0, 0] }}   // math coords (y up)
 *   segments={['AB', 'AC', 'BC', { s: 'AD', dash: true, color: '#e0245e' }]}
 *   lines={[{ through: ['B', 'C'], label: 'l' }]}              // extended lines
 *   ticks={[['AB', 1], ['AC', 1]]}                             // equal-length marks
 *   right={['ADB']}                                            // right-angle mark at D
 *   arcs={[{ at: 'B', from: 'A', to: 'C', label: '72°' }]}
 *   grid                                                       // optional coordinate grid with axes
 *   legend={[{ label: 'y = 2x', color: '#e0245e' }]}           // colour key under the figure
 * />
 * Point names like `Ap` display as A′; `P_1` as P₁. Segments may be 'AB', 'Ap Bp' or ['Ap', 'Bp'].
 * Labels go outward from the centroid unless given as `labelPos: { A: 'n' | 's' | 'e' | 'w' | … }`.
 */
const DIRS = { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0], ne: [0.7, 0.7], nw: [-0.7, 0.7], se: [0.7, -0.7], sw: [-0.7, -0.7] };

export default function GeoFig({
  points,
  segments = [],
  lines = [],
  ticks = [],
  right = [],
  arcs = [],
  polygons = [],
  labelPos = {},
  hide = [],
  grid = false,
  range,
  width = 320,
  caption,
  legend,
}) {
  const names = Object.keys(points);
  const xs = names.map((n) => points[n][0]);
  const ys = names.map((n) => points[n][1]);
  let [x0, x1, y0, y1] = range || [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const padU = Math.max(x1 - x0, y1 - y0) * 0.12 + 0.6;
  if (!range) {
    x0 -= padU;
    x1 += padU;
    y0 -= padU;
    y1 += padU;
  }
  const sc = width / (x1 - x0);
  const height = (y1 - y0) * sc;
  const X = (x) => (x - x0) * sc;
  const Y = (y) => (y1 - y) * sc;
  const P = (n) => [X(points[n][0]), Y(points[n][1])];
  const cx = xs.reduce((s, v) => s + v, 0) / xs.length;
  const cy = ys.reduce((s, v) => s + v, 0) / ys.length;
  const ink = 'var(--ifm-font-color-base)';
  const stroke = 'var(--ifm-color-emphasis-800)';

  const seg = (s) => (typeof s === 'string' || Array.isArray(s) ? { s } : s);
  const ends = (s) => (Array.isArray(s) ? s : s.includes(' ') ? s.split(' ') : [s[0], s.slice(1)]);

  return (
    <figure style={{ margin: '10px 0', maxWidth: width }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="几何图">
        {grid ? (
          <g>
            {Array.from({ length: Math.floor(x1) - Math.ceil(x0) + 1 }, (_, i) => Math.ceil(x0) + i).map((gx) => (
              <line key={`gx${gx}`} x1={X(gx)} x2={X(gx)} y1={0} y2={height} stroke="var(--ifm-color-emphasis-200)" strokeWidth={gx === 0 ? 0 : 1} />
            ))}
            {Array.from({ length: Math.floor(y1) - Math.ceil(y0) + 1 }, (_, i) => Math.ceil(y0) + i).map((gy) => (
              <line key={`gy${gy}`} y1={Y(gy)} y2={Y(gy)} x1={0} x2={width} stroke="var(--ifm-color-emphasis-200)" strokeWidth={gy === 0 ? 0 : 1} />
            ))}
            <line x1={0} x2={width} y1={Y(0)} y2={Y(0)} stroke={stroke} strokeWidth="1.3" />
            <line y1={0} y2={height} x1={X(0)} x2={X(0)} stroke={stroke} strokeWidth="1.3" />
            <text x={width - 10} y={Y(0) - 6} fontSize="12" fill={ink}>x</text>
            <text x={X(0) + 6} y={12} fontSize="12" fill={ink}>y</text>
            <text x={X(0) - 12} y={Y(0) + 14} fontSize="11" fill={ink}>O</text>
            {Array.from({ length: Math.floor(x1) - Math.ceil(x0) + 1 }, (_, i) => Math.ceil(x0) + i)
              .filter((g) => g !== 0)
              .map((g) => (
                <text key={`lx${g}`} x={X(g)} y={Y(0) + 13} fontSize="9" textAnchor="middle" fill="var(--ifm-color-emphasis-600)">
                  {g}
                </text>
              ))}
            {Array.from({ length: Math.floor(y1) - Math.ceil(y0) + 1 }, (_, i) => Math.ceil(y0) + i)
              .filter((g) => g !== 0)
              .map((g) => (
                <text key={`ly${g}`} x={X(0) - 5} y={Y(g) + 3} fontSize="9" textAnchor="end" fill="var(--ifm-color-emphasis-600)">
                  {g}
                </text>
              ))}
          </g>
        ) : null}
        {polygons.map((pg, i) => (
          <polygon
            key={`pg${i}`}
            points={pg.pts.map((n) => P(n).join(',')).join(' ')}
            fill={pg.fill || 'rgba(74,144,217,0.15)'}
            stroke={pg.color || '#4a90d9'}
            strokeWidth="1.6"
            strokeDasharray={pg.dash ? '5 4' : undefined}
          />
        ))}
        {lines.map((l, i) => {
          const [a, b] = l.through.map((n) => points[n]);
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const L = Math.hypot(dx, dy) || 1;
          const big = (x1 - x0 + y1 - y0) * 2;
          const pA = [a[0] - (dx / L) * big, a[1] - (dy / L) * big];
          const pB = [a[0] + (dx / L) * big, a[1] + (dy / L) * big];
          // label near the far end inside the box
          const t = Math.min(
            ...[x0 + 0.3, x1 - 0.3].map((xb) => (dx ? (xb - a[0]) / (dx / L) : Infinity)).filter((v) => v > 0),
            ...[y0 + 0.3, y1 - 0.3].map((yb) => (dy ? (yb - a[1]) / (dy / L) : Infinity)).filter((v) => v > 0),
          );
          const lp = [a[0] + (dx / L) * t, a[1] + (dy / L) * t];
          return (
            <g key={`l${i}`}>
              <line x1={X(pA[0])} y1={Y(pA[1])} x2={X(pB[0])} y2={Y(pB[1])} stroke={l.color || stroke} strokeWidth="1.4" strokeDasharray={l.dash ? '6 4' : undefined} />
              {l.label ? (
                <text x={X(lp[0]) + 6} y={Y(lp[1]) - 4} fontSize="13" fontStyle="italic" fill={ink}>
                  {l.label}
                </text>
              ) : null}
            </g>
          );
        })}
        {segments.map(seg).map((s, i) => {
          const [a, b] = ends(s.s);
          const [ax, ay] = P(a);
          const [bx, by] = P(b);
          return <line key={`s${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke={s.color || stroke} strokeWidth={s.width || 1.7} strokeDasharray={s.dash ? '5 4' : undefined} />;
        })}
        {ticks.map(([s, n], i) => {
          const [a, b] = ends(s);
          const [ax, ay] = P(a);
          const [bx, by] = P(b);
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2;
          const L = Math.hypot(bx - ax, by - ay) || 1;
          const ux = (bx - ax) / L;
          const uy = (by - ay) / L;
          return (
            <g key={`t${i}`}>
              {Array.from({ length: n }, (_, k) => {
                const off = (k - (n - 1) / 2) * 4;
                const px = mx + ux * off;
                const py = my + uy * off;
                return <line key={k} x1={px - uy * 5} y1={py + ux * 5} x2={px + uy * 5} y2={py - ux * 5} stroke={stroke} strokeWidth="1.4" />;
              })}
            </g>
          );
        })}
        {right.map((r, i) => {
          const [a, v, b] = Array.isArray(r) ? r : r.includes(' ') ? r.split(' ') : [r[0], r[1], r[2]];
          const [vx, vy] = P(v);
          const u = (n) => {
            const [px, py] = P(n);
            const L = Math.hypot(px - vx, py - vy) || 1;
            return [(px - vx) / L, (py - vy) / L];
          };
          const [ux, uy] = u(a);
          const [wx, wy] = u(b);
          const s = 10;
          return <path key={`r${i}`} d={`M${vx + ux * s},${vy + uy * s} L${vx + (ux + wx) * s},${vy + (uy + wy) * s} L${vx + wx * s},${vy + wy * s}`} fill="none" stroke="#e0245e" strokeWidth="1.2" />;
        })}
        {arcs.map((a, i) => {
          const [vx, vy] = P(a.at);
          const ang = (n) => {
            const [px, py] = P(n);
            return Math.atan2(py - vy, px - vx);
          };
          const t1 = ang(a.from);
          let d = ang(a.to) - t1;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          const R = a.r || 18;
          const p1 = [vx + R * Math.cos(t1), vy + R * Math.sin(t1)];
          const p2 = [vx + R * Math.cos(t1 + d), vy + R * Math.sin(t1 + d)];
          const mid = t1 + d / 2;
          return (
            <g key={`a${i}`}>
              <path d={`M${p1[0]},${p1[1]} A${R},${R} 0 0 ${d > 0 ? 1 : 0} ${p2[0]},${p2[1]}`} fill="none" stroke={a.color || '#e0245e'} strokeWidth="1.3" />
              {a.label ? (
                <text x={vx + (R + 13) * Math.cos(mid)} y={vy + (R + 13) * Math.sin(mid) + 4} fontSize="11" textAnchor="middle" fill={a.color || '#e0245e'}>
                  {a.label}
                </text>
              ) : null}
            </g>
          );
        })}
        {names
          .filter((n) => !hide.includes(n))
          .map((n) => {
            const [px, py] = P(n);
            let dir = labelPos[n] ? DIRS[labelPos[n]] : [points[n][0] - cx, points[n][1] - cy];
            const L = Math.hypot(dir[0], dir[1]) || 1;
            dir = [dir[0] / L, dir[1] / L];
            return (
              <g key={`p${n}`}>
                <circle cx={px} cy={py} r="2.4" fill={ink} />
                <text x={px + dir[0] * 13} y={py - dir[1] * 13 + 4} fontSize="13" textAnchor="middle" fill={ink}>
                  {n.replace(/_(\d)/, (_, d) => '₀₁₂₃₄₅₆₇₈₉'[d]).replace(/p$/, '′')}
                </text>
              </g>
            );
          })}
      </svg>
      {legend && legend.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', justifyContent: 'center', fontSize: '0.85em', margin: '2px 0' }}>
          {legend.map((l, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              <span style={{ display: 'inline-block', width: 16, height: 3, background: l.color, verticalAlign: 'middle', marginRight: 5 }} />
              {l.label}
            </span>
          ))}
        </div>
      ) : null}
      {caption ? <figcaption style={{ fontSize: '0.85em', color: 'var(--ifm-color-emphasis-700)', textAlign: 'center' }}>{caption}</figcaption> : null}
    </figure>
  );
}

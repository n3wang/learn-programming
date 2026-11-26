import React, { useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import { useSvgPointer, fmt } from '../g8a/svgDrag';

/** 25.1 三角形的中位线：拖动顶点 A，D、E 是 AB、AC 中点，DE ∥ BC 且 DE = ½BC。 */
const W = 360;
const H = 250;
const U = 30;
const B = { x: 50, y: 210 };
const C = { x: 310, y: 210 };

export default function MidlineSimulator() {
  const [A, setA] = useState({ x: 140, y: 40 });
  const { ref, bind } = useSvgPointer(({ x, y }) => setA({ x: Math.max(10, Math.min(W - 10, x)), y: Math.max(10, Math.min(B.y - 30, y)) }));
  const D = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const E = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const de = Math.hypot(E.x - D.x, E.y - D.y) / U;
  const bc = Math.hypot(C.x - B.x, C.y - B.y) / U;
  const L = (p, q, color, w = 2, dash) => <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={color} strokeWidth={w} strokeDasharray={dash} />;
  return (
    <CEBlock title="三角形的中位线" subtitle="拖动顶点 A：DE 始终平行于 BC，并且等于 BC 的一半">
      <CEBlock.Section>
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', ...bind.style }} {...bind}>
          {L(A, B, 'var(--ifm-color-emphasis-800)')}
          {L(A, C, 'var(--ifm-color-emphasis-800)')}
          {L(B, C, '#4a90d9', 2.5)}
          {L(D, E, '#e0245e', 2.5)}
          {L(E, { x: E.x + (E.x - D.x), y: E.y }, '#e0245e', 1, '4 4')}
          {[[A, B], [A, C]].map(([p, q], i) =>
            [0.25, 0.75].map((t) => {
              const mx = p.x + (q.x - p.x) * t;
              const my = p.y + (q.y - p.y) * t;
              const Lh = Math.hypot(q.x - p.x, q.y - p.y);
              const ux = (q.x - p.x) / Lh;
              const uy = (q.y - p.y) / Lh;
              return <line key={`${i}${t}`} x1={mx - uy * 5} y1={my + ux * 5} x2={mx + uy * 5} y2={my - ux * 5} stroke="var(--ifm-color-emphasis-800)" strokeWidth={i + 1} />;
            }),
          )}
          {[['A', A, -4, -8], ['B', B, -14, 14], ['C', C, 4, 14], ['D', D, -16, 0], ['E', E, 6, 0]].map(([n, p, dx, dy]) => (
            <text key={n} x={p.x + dx} y={p.y + dy} fontSize="14" fontWeight="700" fill="var(--ifm-font-color-base)">{n}</text>
          ))}
          <circle cx={A.x} cy={A.y} r="8" fill="#e0245e" opacity="0.8" />
        </svg>
        <Typography sx={{ mt: 1, fontVariantNumeric: 'tabular-nums' }}>
          DE = {fmt(de, 2)}，BC = {fmt(bc, 2)}，DE ÷ BC = {fmt(de / bc, 2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          证明思路：延长 DE 到 F，使 EF = DE，连接 CF。△ADE ≌ △CFE，四边形 DBCF 是平行四边形，所以 DF ∥ BC，DF = BC，DE = ½DF = ½BC。
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

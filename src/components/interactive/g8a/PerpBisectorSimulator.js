import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import { useSvgPointer, fmt } from './svgDrag';

/**
 * 20.1.2 线段的垂直平分线：拖动点 P，比较 PA 与 PB。
 * 「锁在直线上」时 P 只能沿垂直平分线 l 移动 —— 两段始终相等；
 * 放开后 P 可以随便拖，只有回到 l 上时 PA = PB。
 */
const W = 360;
const H = 260;
const A = { x: 90, y: 170 };
const B = { x: 270, y: 170 };
const MX = (A.x + B.x) / 2;
const UNIT = 30; // px per unit for displayed lengths

export default function PerpBisectorSimulator() {
  const [P, setP] = useState({ x: MX, y: 60 });
  const [lock, setLock] = useState(true);
  const { ref, bind } = useSvgPointer(({ x, y }) => {
    const cy = Math.max(12, Math.min(H - 12, y));
    setP(lock ? { x: MX, y: cy } : { x: Math.max(12, Math.min(W - 12, x)), y: cy });
  });
  const pa = Math.hypot(P.x - A.x, P.y - A.y) / UNIT;
  const pb = Math.hypot(P.x - B.x, P.y - B.y) / UNIT;
  const equal = Math.abs(pa - pb) < 0.05;
  const onLine = Math.abs(P.x - MX) < 1.5;
  return (
    <CEBlock title="垂直平分线上的点" subtitle="拖动点 P，看 PA 和 PB 什么时候相等">
      <CEBlock.Section>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
          <ToggleButton value="lock" size="small" selected={lock} onClick={() => { setLock(!lock); if (!lock) setP((p) => ({ ...p, x: MX })); }}>
            {lock ? '🔒 P 锁在直线 l 上' : '🔓 P 可以随便拖'}
          </ToggleButton>
          <Typography variant="body2" color="text.secondary">
            在图上按住拖动
          </Typography>
        </Stack>
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', ...bind.style }} {...bind}>
          <line x1={MX} y1={0} x2={MX} y2={H} stroke="#e0245e" strokeWidth="1.6" strokeDasharray="6 4" />
          <text x={MX + 6} y={14} fontSize="13" fontStyle="italic" fill="#e0245e">l</text>
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--ifm-color-emphasis-800)" strokeWidth="2" />
          <path d={`M${MX},${A.y - 10} h10 v10`} fill="none" stroke="#e0245e" />
          {[[A.x + 45, 1], [B.x - 45, 1]].map(([x], i) => (
            <line key={i} x1={x} x2={x} y1={A.y - 5} y2={A.y + 5} stroke="var(--ifm-color-emphasis-800)" />
          ))}
          <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} stroke="#2a9d8f" strokeWidth="1.8" />
          <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} stroke="#4a90d9" strokeWidth="1.8" />
          {[['A', A, -14], ['B', B, 8]].map(([n, p, dx]) => (
            <g key={n}>
              <circle cx={p.x} cy={p.y} r="3" fill="var(--ifm-font-color-base)" />
              <text x={p.x + dx} y={p.y + 18} fontSize="14" fill="var(--ifm-font-color-base)">{n}</text>
            </g>
          ))}
          <text x={MX - 5} y={A.y + 18} fontSize="13" fill="var(--ifm-font-color-base)">C</text>
          <circle cx={P.x} cy={P.y} r="8" fill={equal ? '#2e7d32' : '#e0245e'} opacity="0.85" />
          <text x={P.x + 11} y={P.y - 8} fontSize="14" fontWeight="700" fill="var(--ifm-font-color-base)">P</text>
        </svg>
        <Typography sx={{ mt: 1, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: '#2a9d8f', fontWeight: 700 }}>PA = {fmt(pa, 2)}</span>
          <span style={{ color: '#4a90d9', fontWeight: 700 }}>PB = {fmt(pb, 2)}</span>
          {equal ? <b style={{ color: '#2e7d32' }}>PA = PB ✓</b> : <span style={{ color: '#d32f2f' }}>PA ≠ PB</span>}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {lock
            ? '不论 P 在 l 上的什么位置，PA 都等于 PB：线段垂直平分线上的点与这条线段两个端点的距离相等。'
            : onLine
              ? 'P 回到了直线 l 上，所以 PA = PB。'
              : '离开 l 之后，PA ≠ PB。反过来：与 A、B 距离相等的点都在线段 AB 的垂直平分线上。'}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

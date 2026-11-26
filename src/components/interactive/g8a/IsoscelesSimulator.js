import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

/**
 * 20.3.1 等腰三角形的性质：拖动滑块改变顶角，看两个底角始终相等；
 * 顶角平分线、底边上的中线、底边上的高画出来是同一条线（三线合一）。
 */
const W = 340;
const H = 250;

export default function IsoscelesSimulator() {
  const [top, setTop] = useState(40);
  const [show, setShow] = useState(['bis']);
  const base = (180 - top) / 2;
  const leg = 190;
  const half = (top / 2) * (Math.PI / 180);
  const A = { x: W / 2, y: 20 };
  const B = { x: A.x - leg * Math.sin(half), y: A.y + leg * Math.cos(half) };
  const C = { x: A.x + leg * Math.sin(half), y: B.y };
  const D = { x: A.x, y: B.y };
  const sc = Math.min(1, (H - 30) / (B.y - A.y + 10), (W - 30) / (C.x - B.x + 10));
  const T = (p) => ({ x: W / 2 + (p.x - W / 2) * sc, y: 15 + (p.y - A.y) * sc });
  const [a, b, c, d] = [A, B, C, D].map(T);
  const arc = (v, p1, p2, r, color) => {
    const t1 = Math.atan2(p1.y - v.y, p1.x - v.x);
    const t2 = Math.atan2(p2.y - v.y, p2.x - v.x);
    let dl = t2 - t1;
    while (dl > Math.PI) dl -= 2 * Math.PI;
    while (dl < -Math.PI) dl += 2 * Math.PI;
    const s = [v.x + r * Math.cos(t1), v.y + r * Math.sin(t1)];
    const e = [v.x + r * Math.cos(t1 + dl), v.y + r * Math.sin(t1 + dl)];
    return <path d={`M${s} A${r},${r} 0 0 ${dl > 0 ? 1 : 0} ${e}`} fill="none" stroke={color} strokeWidth="2" />;
  };
  const has = (k) => show.includes(k);
  return (
    <CEBlock title="等腰三角形：等边对等角、三线合一" subtitle="拖动滑块改变顶角 ∠A，AB = AC 始终成立">
      <CEBlock.Section>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          <Typography variant="body2">顶角 ∠A = {top}°</Typography>
          <input type="range" min={10} max={160} step={2} value={top} onChange={(e) => setTop(Number(e.target.value))} style={{ flex: '1 1 160px' }} />
        </Stack>
        <ToggleButtonGroup size="small" value={show} onChange={(_, v) => setShow(v)}>
          <ToggleButton value="bis">顶角平分线</ToggleButton>
          <ToggleButton value="med">底边中线</ToggleButton>
          <ToggleButton value="alt">底边上的高</ToggleButton>
        </ToggleButtonGroup>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', marginTop: 8 }}>
          <polygon points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`} fill="rgba(74,144,217,0.1)" stroke="var(--ifm-color-emphasis-800)" strokeWidth="2" />
          {arc(b, c, a, 22, '#2a9d8f')}
          {arc(c, b, a, 22, '#2a9d8f')}
          {[[a, b], [a, c]].map(([p, q], i) => {
            const mx = (p.x + q.x) / 2;
            const my = (p.y + q.y) / 2;
            const L = Math.hypot(q.x - p.x, q.y - p.y);
            const ux = (q.x - p.x) / L;
            const uy = (q.y - p.y) / L;
            return <line key={i} x1={mx - uy * 6} y1={my + ux * 6} x2={mx + uy * 6} y2={my - ux * 6} stroke="var(--ifm-color-emphasis-800)" strokeWidth="1.6" />;
          })}
          {show.length ? (
            <line
              x1={a.x}
              y1={a.y}
              x2={d.x}
              y2={d.y}
              stroke={has('bis') && has('med') && has('alt') ? '#7b3fbf' : has('alt') ? '#e0245e' : has('med') ? '#f39c12' : '#3b6ea5'}
              strokeWidth={1.5 + show.length}
              strokeDasharray={show.length === 1 ? '6 4' : undefined}
            />
          ) : null}
          {has('alt') ? <path d={`M${d.x + 10},${d.y} v-10 h-10`} fill="none" stroke="#e0245e" /> : null}
          {has('med') ? (
            <g stroke="#f39c12" strokeWidth="1.6">
              {[(b.x + d.x) / 2, (c.x + d.x) / 2].map((x, i) => (
                <g key={i}>
                  <line x1={x - 2} x2={x - 2} y1={d.y - 6} y2={d.y + 6} />
                  <line x1={x + 2} x2={x + 2} y1={d.y - 6} y2={d.y + 6} />
                </g>
              ))}
            </g>
          ) : null}
          {has('bis') ? (
            <>
              {arc(a, b, d, 26, '#3b6ea5')}
              {arc(a, d, c, 32, '#3b6ea5')}
            </>
          ) : null}
          <text x={a.x - 5} y={a.y - 2} fontSize="14" fill="var(--ifm-font-color-base)">A</text>
          <text x={b.x - 16} y={b.y + 6} fontSize="14" fill="var(--ifm-font-color-base)">B</text>
          <text x={c.x + 6} y={c.y + 6} fontSize="14" fill="var(--ifm-font-color-base)">C</text>
          {show.length ? <text x={d.x - 4} y={d.y + 18} fontSize="14" fill="var(--ifm-font-color-base)">D</text> : null}
          <text x={b.x + 26} y={b.y - 8} fontSize="12" fill="#2a9d8f">{base}°</text>
          <text x={c.x - 48} y={c.y - 8} fontSize="12" fill="#2a9d8f">{base}°</text>
        </svg>
        <Typography sx={{ mt: 1 }}>
          ∠B = ∠C = (180° − {top}°) ÷ 2 = <b>{base}°</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {show.length === 3
            ? '三条线完全重合：等腰三角形的顶角平分线、底边上的中线、底边上的高相互重合（三线合一）。'
            : '把三个按钮都打开，看看三条线是不是同一条。'}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

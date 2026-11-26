import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import { useSvgPointer, fmt } from '../g8a/svgDrag';

/**
 * 25 平行四边形：拖动顶点 D（A、B 固定，C = B + D − A），对边、对角、对角线随之变化。
 * 打开「对角线」看 OA = OC、OB = OD；变成矩形、菱形、正方形时会自动标出。
 */
const W = 380;
const H = 260;
const U = 30;
const A = { x: 70, y: 200 };
const B = { x: 220, y: 200 };

const len = (p, q) => Math.hypot(p.x - q.x, p.y - q.y) / U;
const ang = (v, p, q) => {
  const a1 = Math.atan2(p.y - v.y, p.x - v.x);
  const a2 = Math.atan2(q.y - v.y, q.x - v.x);
  let d = Math.abs(a1 - a2) * (180 / Math.PI);
  if (d > 180) d = 360 - d;
  return d;
};

export default function ParallelogramSimulator() {
  const [D, setD] = useState({ x: 120, y: 90 });
  const [Bx, setBx] = useState(B.x);
  const [show, setShow] = useState(['diag']);
  const [drag, setDrag] = useState('D');
  const Bp = { x: Bx, y: B.y };
  const C = { x: Bp.x + D.x - A.x, y: Bp.y + D.y - A.y };
  const O = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const { ref, bind } = useSvgPointer(({ x, y }, kind) => {
    if (kind === 'down') {
      const dD = Math.hypot(x - D.x, y - D.y);
      const dB = Math.hypot(x - Bp.x, y - Bp.y);
      setDrag(dB < dD ? 'B' : 'D');
      return;
    }
    if (drag === 'D') setD({ x: Math.max(20, Math.min(W - 160, x)), y: Math.max(20, Math.min(A.y - 30, y)) });
    else setBx(Math.max(A.x + 40, Math.min(W - 120, x)));
  });
  const ab = len(A, Bp);
  const ad = len(A, D);
  const angA = ang(A, Bp, D);
  const ac = len(A, C);
  const bd = len(Bp, D);
  const right = Math.abs(angA - 90) < 2.5;
  const rhomb = Math.abs(ab - ad) < 0.12;
  const kind = right && rhomb ? '正方形' : right ? '矩形' : rhomb ? '菱形' : '平行四边形';
  const snap = (k) => {
    const side = ab;
    if (k === 'rect') setD({ x: A.x, y: A.y - 4 * U });
    if (k === 'rhombus') setD({ x: A.x + side * U * Math.cos(Math.PI / 3), y: A.y - side * U * Math.sin(Math.PI / 3) });
    if (k === 'square') setD({ x: A.x, y: A.y - side * U });
  };
  const has = (k) => show.includes(k);
  const L = (p, q, color = 'var(--ifm-color-emphasis-800)', w = 2, dash) => <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={color} strokeWidth={w} strokeDasharray={dash} />;
  return (
    <CEBlock title="平行四边形与特殊平行四边形" subtitle="拖动顶点 D 或 B，观察边、角、对角线">
      <CEBlock.Section>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          {[
            ['diag', '对角线'],
            ['len', '边长'],
            ['ang', '角度'],
          ].map(([k, label]) => (
            <ToggleButton key={k} value={k} size="small" selected={has(k)} onClick={() => setShow((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))}>
              {label}
            </ToggleButton>
          ))}
          <ToggleButtonGroup exclusive size="small" value={null} onChange={(_, v) => v && snap(v)}>
            <ToggleButton value="rect">变矩形</ToggleButton>
            <ToggleButton value="rhombus">变菱形</ToggleButton>
            <ToggleButton value="square">变正方形</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', ...bind.style }} {...bind}>
          <polygon points={[A, Bp, C, D].map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(74,144,217,0.12)" stroke="none" />
          {L(A, Bp, '#4a90d9')}
          {L(D, C, '#4a90d9')}
          {L(A, D, '#2a9d8f')}
          {L(Bp, C, '#2a9d8f')}
          {has('diag') ? (
            <>
              {L(A, C, '#e0245e', 1.5, '5 4')}
              {L(Bp, D, '#f39c12', 1.5, '5 4')}
              <circle cx={O.x} cy={O.y} r="3" fill="var(--ifm-font-color-base)" />
              <text x={O.x + 6} y={O.y + 14} fontSize="12" fill="var(--ifm-font-color-base)">O</text>
            </>
          ) : null}
          {right ? <path d={`M${A.x + 12},${A.y} v-12 h-12`} fill="none" stroke="#e0245e" /> : null}
          {has('len') ? (
            <g fontSize="11" fill="var(--ifm-font-color-base)">
              <text x={(A.x + Bp.x) / 2} y={A.y + 16} textAnchor="middle">{fmt(ab)}</text>
              <text x={(D.x + C.x) / 2} y={D.y - 6} textAnchor="middle">{fmt(ab)}</text>
              <text x={(A.x + D.x) / 2 - 18} y={(A.y + D.y) / 2}>{fmt(ad)}</text>
              <text x={(Bp.x + C.x) / 2 + 6} y={(Bp.y + C.y) / 2}>{fmt(ad)}</text>
            </g>
          ) : null}
          {has('ang') ? (
            <g fontSize="11" fill="#7b3fbf">
              <text x={A.x + 14} y={A.y - 6}>{Math.round(angA)}°</text>
              <text x={Bp.x - 34} y={Bp.y - 6}>{Math.round(180 - angA)}°</text>
              <text x={C.x - 34} y={C.y + 16}>{Math.round(angA)}°</text>
              <text x={D.x + 8} y={D.y + 16}>{Math.round(180 - angA)}°</text>
            </g>
          ) : null}
          {[['A', A, -16, 14], ['B', Bp, 6, 14], ['C', C, 6, -4], ['D', D, -16, -4]].map(([n, p, dx, dy]) => (
            <text key={n} x={p.x + dx} y={p.y + dy} fontSize="14" fontWeight="700" fill="var(--ifm-font-color-base)">{n}</text>
          ))}
          <circle cx={D.x} cy={D.y} r="8" fill="#e0245e" opacity="0.8" />
          <circle cx={Bp.x} cy={Bp.y} r="7" fill="#f39c12" opacity="0.8" />
        </svg>
        <Typography sx={{ mt: 1 }}>
          现在是：<b>{kind}</b>
          {has('diag') ? `　AC = ${fmt(ac, 2)}，BD = ${fmt(bd, 2)}，OA = OC = ${fmt(ac / 2, 2)}，OB = OD = ${fmt(bd / 2, 2)}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {kind === '平行四边形'
            ? '对边相等、对角相等、邻角互补、对角线互相平分——不论怎么拖都成立。'
            : kind === '矩形'
              ? '矩形：四个角都是直角，对角线相等（AC = BD）。'
              : kind === '菱形'
                ? '菱形：四条边相等，对角线互相垂直，并且平分每一组对角。'
                : '正方形：既是矩形又是菱形——对角线相等、互相垂直平分。'}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

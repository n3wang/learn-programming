import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

/**
 * 24.1 勾股定理：直角三角形三边上的正方形面积（a² + b² = c²），
 * 以及赵爽弦图（四个全等直角三角形 + 中间小正方形 = 大正方形）。
 */
const W = 360;
const H = 320;

export default function PythagorasSimulator() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [mode, setMode] = useState('sq');
  const c2 = a * a + b * b;
  const c = Math.sqrt(c2);
  let fig;
  if (mode === 'sq') {
    // Whole figure spans x ∈ [−b, a + b], y ∈ [−(a + b), a] in units (C at the origin): fit it to the frame.
    const u = Math.min((W - 30) / (a + 2 * b), (H - 30) / (2 * a + b));
    const C = { x: (W - (a + 2 * b) * u) / 2 + b * u, y: (H - (2 * a + b) * u) / 2 + (a + b) * u };
    const A = { x: C.x, y: C.y - b * u };
    const B = { x: C.x + a * u, y: C.y };
    const poly = (pts, fill, label, at) => (
      <g>
        <polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill={fill} stroke="var(--ifm-color-emphasis-800)" strokeWidth="1.3" />
        <text x={at.x} y={at.y} fontSize="13" textAnchor="middle" fill="var(--ifm-font-color-base)">
          {label}
        </text>
      </g>
    );
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const P = { x: B.x + dy, y: B.y - dx };
    const Q = { x: A.x + dy, y: A.y - dx };
    fig = (
      <g>
        {poly([C, B, { x: B.x, y: C.y + a * u }, { x: C.x, y: C.y + a * u }], 'rgba(74,144,217,0.3)', `a² = ${a * a}`, { x: (C.x + B.x) / 2, y: C.y + (a * u) / 2 + 5 })}
        {poly([C, A, { x: C.x - b * u, y: A.y }, { x: C.x - b * u, y: C.y }], 'rgba(42,157,143,0.3)', `b² = ${b * b}`, { x: C.x - (b * u) / 2, y: (A.y + C.y) / 2 + 5 })}
        {poly([A, B, P, Q], 'rgba(224,36,94,0.25)', `c² = ${c2}`, { x: (A.x + B.x + P.x + Q.x) / 4, y: (A.y + B.y + P.y + Q.y) / 4 + 5 })}
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="var(--ifm-background-color)" stroke="var(--ifm-color-emphasis-900)" strokeWidth="2" />
        <path d={`M${C.x + 9},${C.y} v-9 h-9`} fill="none" stroke="#e0245e" />
        <text x={(C.x + B.x) / 2} y={C.y - 4} fontSize="12" textAnchor="middle" fill="var(--ifm-font-color-base)">a</text>
        <text x={C.x + 6} y={(A.y + C.y) / 2} fontSize="12" fill="var(--ifm-font-color-base)">b</text>
        <text x={(A.x + B.x) / 2 + 6} y={(A.y + B.y) / 2 + 12} fontSize="12" fill="var(--ifm-font-color-base)">c</text>
      </g>
    );
  } else {
    const u = 220 / (a + b);
    const s = (a + b) * u;
    const x0 = (W - s) / 2;
    const y0 = 20;
    // 外：边长 a+b 的大正方形里放四个直角三角形，中间是边长 c 的正方形（另一种拼法：赵爽弦图里中间是边长 b − a 的小正方形）
    const P = [
      { x: x0 + a * u, y: y0 },
      { x: x0 + s, y: y0 + a * u },
      { x: x0 + b * u, y: y0 + s },
      { x: x0, y: y0 + b * u },
    ];
    const corners = [
      { x: x0, y: y0 },
      { x: x0 + s, y: y0 },
      { x: x0 + s, y: y0 + s },
      { x: x0, y: y0 + s },
    ];
    fig = (
      <g>
        <rect x={x0} y={y0} width={s} height={s} fill="none" stroke="var(--ifm-color-emphasis-800)" strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => (
          <polygon key={i} points={`${corners[i].x},${corners[i].y} ${P[i].x},${P[i].y} ${P[(i + 3) % 4].x},${P[(i + 3) % 4].y}`} fill="rgba(74,144,217,0.35)" stroke="var(--ifm-color-emphasis-800)" />
        ))}
        <polygon points={P.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(224,36,94,0.25)" stroke="#e0245e" strokeWidth="2" />
        <text x={W / 2} y={y0 + s / 2 + 5} fontSize="14" textAnchor="middle" fill="var(--ifm-font-color-base)">c²</text>
        <text x={x0 + (a * u) / 2} y={y0 - 4} fontSize="12" textAnchor="middle" fill="var(--ifm-font-color-base)">a</text>
        <text x={x0 + a * u + (b * u) / 2} y={y0 - 4} fontSize="12" textAnchor="middle" fill="var(--ifm-font-color-base)">b</text>
      </g>
    );
  }
  return (
    <CEBlock title="勾股定理：a² + b² = c²" subtitle="改变两条直角边，看三个正方形的面积">
      <CEBlock.Section>
        <ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, v) => v && setMode(v)}>
          <ToggleButton value="sq">三边上的正方形</ToggleButton>
          <ToggleButton value="zs">拼图证明</ToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" spacing={2} sx={{ my: 1 }} flexWrap="wrap" useFlexGap>
          <label>
            a = {a} <input type="range" min={1} max={8} value={a} onChange={(e) => setA(Number(e.target.value))} />
          </label>
          <label>
            b = {b} <input type="range" min={1} max={8} value={b} onChange={(e) => setB(Number(e.target.value))} />
          </label>
        </Stack>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
          {fig}
        </svg>
        <Typography sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {a}² + {b}² = {a * a} + {b * b} = {c2} = c²，c = {Number.isInteger(c) ? c : `√${c2} ≈ ${c.toFixed(2)}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {mode === 'sq'
            ? '两个小正方形的面积之和总是等于大正方形的面积。试试 a = 3、b = 4，或 a = 6、b = 8：斜边是整数（勾股数）。'
            : '大正方形边长 a + b。面积算两次：(a + b)² = 4 × ½ab + c²，化简得 a² + b² = c²。'}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

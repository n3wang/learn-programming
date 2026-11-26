import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

/**
 * 26.2 一次函数 y = kx + b：拖动滑块改变 k、b，看直线的倾斜方向、与坐标轴的交点、
 * 经过的象限；可同时显示 y = kx（看平移关系）。
 */
const N = 6;
const S = 26;
const W = (2 * N) * S;
const X = (x) => (x + N) * S;
const Y = (y) => (N - y) * S;
const f2 = (v) => String(Number(v.toFixed(2)));

export default function LinearFunctionSimulator() {
  const [k, setK] = useState(2);
  const [b, setB] = useState(-1);
  const [ref0, setRef0] = useState(true);
  const quads = k === 0 ? '' : k > 0 ? (b > 0 ? '一、二、三' : b < 0 ? '一、三、四' : '一、三') : b > 0 ? '一、二、四' : b < 0 ? '二、三、四' : '二、四';
  const line = (kk, bb, color, w = 2.5, dash) => <line x1={X(-N)} y1={Y(kk * -N + bb)} x2={X(N)} y2={Y(kk * N + bb)} stroke={color} strokeWidth={w} strokeDasharray={dash} />;
  return (
    <CEBlock title="一次函数 y = kx + b 的图象" subtitle="k 决定倾斜方向和陡峭程度，b 决定与 y 轴的交点">
      <CEBlock.Section>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          <label>
            k = {f2(k)} <input type="range" min={-4} max={4} step={0.5} value={k} onChange={(e) => setK(Number(e.target.value) || 0.5)} />
          </label>
          <label>
            b = {b} <input type="range" min={-5} max={5} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} />
          </label>
          <ToggleButton value="r" size="small" selected={ref0} onClick={() => setRef0(!ref0)}>
            显示 y = kx
          </ToggleButton>
        </Stack>
        <svg viewBox={`0 0 ${W} ${W}`} style={{ width: '100%', maxWidth: 320, display: 'block' }}>
          <defs>
            <clipPath id="lfclip">
              <rect x="0" y="0" width={W} height={W} />
            </clipPath>
          </defs>
          {Array.from({ length: 2 * N + 1 }, (_, i) => i - N).map((g) => (
            <g key={g}>
              <line x1={X(g)} x2={X(g)} y1={0} y2={W} stroke="var(--ifm-color-emphasis-200)" />
              <line y1={Y(g)} y2={Y(g)} x1={0} x2={W} stroke="var(--ifm-color-emphasis-200)" />
            </g>
          ))}
          <line x1={0} x2={W} y1={Y(0)} y2={Y(0)} stroke="var(--ifm-color-emphasis-700)" />
          <line y1={0} y2={W} x1={X(0)} x2={X(0)} stroke="var(--ifm-color-emphasis-700)" />
          <text x={W - 10} y={Y(0) - 5} fontSize="11" fill="var(--ifm-font-color-base)">x</text>
          <text x={X(0) + 5} y={11} fontSize="11" fill="var(--ifm-font-color-base)">y</text>
          <text x={X(0) - 10} y={Y(0) + 12} fontSize="10" fill="var(--ifm-font-color-base)">O</text>
          {[-4, -2, 2, 4].map((g) => (
            <g key={`t${g}`} fontSize="9" fill="var(--ifm-color-emphasis-600)">
              <text x={X(g)} y={Y(0) + 12} textAnchor="middle">{g}</text>
              <text x={X(0) - 4} y={Y(g) + 3} textAnchor="end">{g}</text>
            </g>
          ))}
          <g clipPath="url(#lfclip)">
            {ref0 ? line(k, 0, '#8a9bb0', 1.5, '6 4') : null}
            {line(k, b, '#e0245e')}
          </g>
          <circle cx={X(0)} cy={Y(b)} r="4" fill="#4a90d9" />
          {k !== 0 && Math.abs(-b / k) <= N ? <circle cx={X(-b / k)} cy={Y(0)} r="4" fill="#2a9d8f" /> : null}
        </svg>
        <Typography sx={{ mt: 1 }}>
          y = {f2(k)}x {b >= 0 ? '+' : '−'} {Math.abs(b)}：与 y 轴交于 <b style={{ color: '#4a90d9' }}>(0, {b})</b>，与 x 轴交于{' '}
          <b style={{ color: '#2a9d8f' }}>({f2(-b / k)}, 0)</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          k {k > 0 ? '> 0：直线从左到右上升，y 随 x 的增大而增大' : '< 0：直线从左到右下降，y 随 x 的增大而减小'}；经过第{quads}象限。
          {ref0 ? ` 直线 y = kx + b 由 y = kx 向${b >= 0 ? '上' : '下'}平移 ${Math.abs(b)} 个单位得到（两直线平行）。` : ''}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

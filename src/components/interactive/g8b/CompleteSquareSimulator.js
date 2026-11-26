import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

/**
 * 27.2 配方法的几何意义：x² + bx = 一个 x × x 的正方形 + 两条 x × (b/2) 的长条，
 * 补上角上 (b/2)² 的小正方形，就拼成 (x + b/2)²。
 */
const W = 340;

export default function CompleteSquareSimulator() {
  const [b, setB] = useState(6);
  const [c, setC] = useState(16);
  const [fill, setFill] = useState(false);
  const h = b / 2;
  const x = 5; // drawing size of x
  const u = 180 / (x + h);
  const x0 = 60;
  const y0 = 30;
  const q = c + h * h;
  const root = Math.sqrt(q);
  const rect = (rx, ry, w, hh, f, label, dash) => (
    <g>
      <rect x={rx} y={ry} width={w} height={hh} fill={f} stroke="var(--ifm-color-emphasis-800)" strokeWidth="1.3" strokeDasharray={dash} />
      <text x={rx + w / 2} y={ry + hh / 2 + 5} fontSize="13" textAnchor="middle" fill="var(--ifm-font-color-base)">
        {label}
      </text>
    </g>
  );
  return (
    <CEBlock title="配方：把 x² + bx 补成完全平方" subtitle={`解方程 x² + ${b}x = ${c}`}>
      <CEBlock.Section>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          <label>
            b = {b} <input type="range" min={2} max={12} step={2} value={b} onChange={(e) => setB(Number(e.target.value))} />
          </label>
          <label>
            右边 = {c} <input type="range" min={0} max={40} value={c} onChange={(e) => setC(Number(e.target.value))} />
          </label>
          <ToggleButton value="f" size="small" selected={fill} onClick={() => setFill(!fill)}>
            {fill ? '已补上小正方形' : '补上角上的小正方形'}
          </ToggleButton>
        </Stack>
        <svg viewBox={`0 0 ${W} 250`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
          {rect(x0, y0, x * u, x * u, 'rgba(74,144,217,0.35)', 'x²')}
          {rect(x0 + x * u, y0, h * u, x * u, 'rgba(42,157,143,0.35)', `${h}x`)}
          {rect(x0, y0 + x * u, x * u, h * u, 'rgba(42,157,143,0.35)', `${h}x`)}
          {fill ? rect(x0 + x * u, y0 + x * u, h * u, h * u, 'rgba(224,36,94,0.35)', `${h * h}`) : rect(x0 + x * u, y0 + x * u, h * u, h * u, 'none', '?', '4 3')}
          <text x={x0 + (x * u) / 2} y={y0 - 6} fontSize="12" textAnchor="middle" fill="var(--ifm-font-color-base)">x</text>
          <text x={x0 + x * u + (h * u) / 2} y={y0 - 6} fontSize="12" textAnchor="middle" fill="var(--ifm-font-color-base)">{h}</text>
          <text x={x0 - 12} y={y0 + (x * u) / 2} fontSize="12" fill="var(--ifm-font-color-base)">x</text>
          <text x={x0 - 12} y={y0 + x * u + (h * u) / 2 + 4} fontSize="12" fill="var(--ifm-font-color-base)">{h}</text>
        </svg>
        <Typography sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {fill ? (
            <>
              x² + {b}x + {h * h} = {c} + {h * h}，即 (x + {h})² = {q}，x + {h} = ±{Number.isInteger(root) ? root : `√${q}`}，x₁ = {Number.isInteger(root) ? root - h : `−${h} + √${q}`}，x₂ = {Number.isInteger(root) ? -root - h : `−${h} − √${q}`}
            </>
          ) : (
            `x² + ${b}x 是一个正方形加两条长条，缺一个角就是完整的大正方形。`
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          配方的关键：两边都加上<b>一次项系数一半的平方</b>（这里是 ({b} ÷ 2)² = {h * h}），左边就变成 (x + {h})²。
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

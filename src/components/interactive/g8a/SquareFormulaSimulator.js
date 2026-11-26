import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

/**
 * 21.2 乘法公式的几何意义（图 21.2-1 / 21.2-2 的思路）：
 *  完全平方：边长 a + b 的正方形 = a² + ab + ab + b²；
 *  平方差：  a² 的正方形挖去 b²，剩下的部分剪开拼成 (a + b)(a − b) 的长方形。
 */
const W = 340;
const H = 250;

export default function SquareFormulaSimulator() {
  const [mode, setMode] = useState('sq');
  const [a, setA] = useState(6);
  const [b, setB] = useState(3);
  const bb = Math.min(b, mode === 'diff' ? a - 1 : 9);
  const u = Math.min(190 / (mode === 'sq' ? a + bb : a + bb), 22);
  const lab = (x, y, t, c = 'var(--ifm-font-color-base)') => (
    <text x={x} y={y} fontSize="13" textAnchor="middle" fill={c}>
      {t}
    </text>
  );
  const rect = (x, y, w, h, fill, label) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke="var(--ifm-color-emphasis-800)" strokeWidth="1.3" />
      {label ? lab(x + w / 2, y + h / 2 + 5, label) : null}
    </g>
  );
  let fig;
  let text;
  if (mode === 'sq') {
    const A = a * u;
    const Bv = bb * u;
    const x0 = 30;
    const y0 = 20;
    fig = (
      <g>
        {rect(x0, y0, A, A, 'rgba(74,144,217,0.35)', 'a²')}
        {rect(x0 + A, y0, Bv, A, 'rgba(42,157,143,0.35)', 'ab')}
        {rect(x0, y0 + A, A, Bv, 'rgba(42,157,143,0.35)', 'ab')}
        {rect(x0 + A, y0 + A, Bv, Bv, 'rgba(224,36,94,0.35)', 'b²')}
        {lab(x0 + A / 2, y0 - 5, 'a')}
        {lab(x0 + A + Bv / 2, y0 - 5, 'b')}
        {lab(x0 - 10, y0 + A / 2, 'a')}
        {lab(x0 - 10, y0 + A + Bv / 2, 'b')}
      </g>
    );
    text = `(${a} + ${bb})² = ${a}² + 2×${a}×${bb} + ${bb}² = ${a * a} + ${2 * a * bb} + ${bb * bb} = ${(a + bb) ** 2}`;
  } else {
    const A = a * u;
    const Bv = bb * u;
    const x0 = 20;
    const y0 = 20;
    const x1 = x0 + A + 30;
    fig = (
      <g>
        {rect(x0, y0, A - Bv, A, 'rgba(74,144,217,0.35)', '')}
        {rect(x0 + A - Bv, y0, Bv, A - Bv, 'rgba(42,157,143,0.35)', '')}
        <rect x={x0 + A - Bv} y={y0 + A - Bv} width={Bv} height={Bv} fill="none" stroke="#e0245e" strokeDasharray="4 3" />
        {lab(x0 + A - Bv / 2, y0 + A - Bv / 2 + 5, 'b²', '#e0245e')}
        {lab(x0 + A / 2, y0 - 5, 'a')}
        {lab(x0 - 9, y0 + A / 2, 'a')}
        {lab(x1 - 15, y0 + A / 2, '→')}
        {rect(x1, y0, A - Bv, A, 'rgba(74,144,217,0.35)', '')}
        {rect(x1, y0 + A, A - Bv, Bv, 'rgba(42,157,143,0.35)', '')}
        {lab(x1 + (A - Bv) / 2, y0 - 5, 'a − b')}
        {lab(x1 + A - Bv + 18, y0 + (A + Bv) / 2, 'a + b')}
      </g>
    );
    text = `(${a} + ${bb})(${a} − ${bb}) = ${a}² − ${bb}² = ${a * a} − ${bb * bb} = ${a * a - bb * bb}`;
  }
  return (
    <CEBlock title="用面积看乘法公式" subtitle="改变 a、b，图形面积和公式两边一起变">
      <CEBlock.Section>
        <ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, v) => v && setMode(v)}>
          <ToggleButton value="sq">完全平方 (a + b)²</ToggleButton>
          <ToggleButton value="diff">平方差 (a + b)(a − b)</ToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ my: 1 }}>
          <label>
            a = {a}{' '}
            <input type="range" min={3} max={9} value={a} onChange={(e) => setA(Number(e.target.value))} />
          </label>
          <label>
            b = {bb}{' '}
            <input type="range" min={1} max={mode === 'diff' ? a - 1 : 6} value={bb} onChange={(e) => setB(Number(e.target.value))} />
          </label>
        </Stack>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
          {fig}
        </svg>
        <Typography sx={{ mt: 1, fontVariantNumeric: 'tabular-nums' }}>{text}</Typography>
        <Typography variant="body2" color="text.secondary">
          {mode === 'sq'
            ? '大正方形由 4 块组成：a²、两块 ab、b²。所以 (a + b)² = a² + 2ab + b²，中间的 2ab 不能漏。'
            : '从 a² 里挖去 b²，把右边那一条剪下来放到下面，正好拼成长 a + b、宽 a − b 的长方形。'}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

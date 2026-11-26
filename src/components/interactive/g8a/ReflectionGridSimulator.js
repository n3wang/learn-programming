import React, { useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import { useSvgPointer } from './svgDrag';

/**
 * 20.2 画轴对称图形：在方格纸上依次点出 A′、B′、C′，画出 △ABC 关于对称轴的对称图形。
 * 对称轴可选 x 轴、y 轴，或直线 x = 1 / y = −1（习题 20.2 第 7 题）。
 */
const N = 6; // grid from −N to N
const S = 24; // px per unit
const W = (2 * N + 1) * S;
const X = (x) => (x + N + 0.5) * S;
const Y = (y) => (N + 0.5 - y) * S;
const AXES = {
  x: { label: 'x 轴', map: ([x, y]) => [x, -y] },
  y: { label: 'y 轴', map: ([x, y]) => [-x, y] },
  vx: { label: '直线 x = 1', map: ([x, y]) => [2 - x, y] },
  hy: { label: '直线 y = −1', map: ([x, y]) => [x, -2 - y] },
};
const NAMES = ['A', 'B', 'C'];

function randTri(axis) {
  for (;;) {
    const pts = NAMES.map(() => [Math.floor(Math.random() * 9) - 4, Math.floor(Math.random() * 9) - 4]);
    const img = pts.map(AXES[axis].map);
    const inside = [...pts, ...img].every(([x, y]) => Math.abs(x) <= N && Math.abs(y) <= N);
    const area = Math.abs((pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[2][0] - pts[0][0]) * (pts[1][1] - pts[0][1]));
    const offAxis = pts.every((p, i) => p[0] !== img[i][0] || p[1] !== img[i][1]);
    if (inside && area >= 4 && offAxis) return pts;
  }
}

export default function ReflectionGridSimulator() {
  const [axis, setAxis] = useState('y');
  const [tri, setTri] = useState(() => [[-4, 1], [-1, 1], [-2, 4]]);
  const [placed, setPlaced] = useState([]);
  const [show, setShow] = useState(false);
  const target = tri.map(AXES[axis].map);
  const done = placed.length === 3;
  const correct = done && placed.every((p, i) => p[0] === target[i][0] && p[1] === target[i][1]);
  const { ref, bind } = useSvgPointer(({ x, y }, kind) => {
    if (kind !== 'down' || placed.length >= 3) return;
    const gx = Math.round(x / S - N - 0.5);
    const gy = Math.round(N + 0.5 - y / S);
    if (Math.abs(gx) > N || Math.abs(gy) > N) return;
    setPlaced((p) => [...p, [gx, gy]]);
  });
  const fresh = (ax = axis) => {
    setTri(randTri(ax));
    setPlaced([]);
    setShow(false);
  };
  const poly = (pts, color, dash) => (
    <polygon points={pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill={`${color}22`} stroke={color} strokeWidth="2" strokeDasharray={dash ? '6 4' : undefined} />
  );
  const axisLine =
    axis === 'x' ? [0, Y(0), W, Y(0)] : axis === 'y' ? [X(0), 0, X(0), W] : axis === 'vx' ? [X(1), 0, X(1), W] : [0, Y(-1), W, Y(-1)];
  const next = NAMES[placed.length];
  return (
    <CEBlock title="画关于直线对称的图形" subtitle="在方格纸上依次点出 A′、B′、C′">
      <CEBlock.Section>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          <ToggleButtonGroup exclusive size="small" value={axis} onChange={(_, v) => v && (setAxis(v), fresh(v))}>
            {Object.entries(AXES).map(([k, a]) => (
              <ToggleButton key={k} value={k}>
                {a.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Button size="small" variant="outlined" onClick={() => setPlaced((p) => p.slice(0, -1))} disabled={!placed.length}>
            撤销
          </Button>
          <Button size="small" variant="outlined" onClick={() => fresh()}>
            换一个三角形
          </Button>
          <Button size="small" variant="text" onClick={() => setShow(!show)}>
            {show ? '隐藏答案' : '看答案'}
          </Button>
        </Stack>
        <svg ref={ref} viewBox={`0 0 ${W} ${W}`} style={{ width: '100%', maxWidth: 340, display: 'block', ...bind.style }} {...bind}>
          {Array.from({ length: 2 * N + 1 }, (_, i) => i - N).map((g) => (
            <g key={g}>
              <line x1={X(g)} x2={X(g)} y1={X(-N)} y2={X(N)} stroke="var(--ifm-color-emphasis-200)" />
              <line y1={Y(g)} y2={Y(g)} x1={X(-N)} x2={X(N)} stroke="var(--ifm-color-emphasis-200)" />
            </g>
          ))}
          <line x1={X(-N)} x2={X(N)} y1={Y(0)} y2={Y(0)} stroke="var(--ifm-color-emphasis-700)" />
          <line y1={Y(-N)} y2={Y(N)} x1={X(0)} x2={X(0)} stroke="var(--ifm-color-emphasis-700)" />
          <text x={X(N) - 4} y={Y(0) - 5} fontSize="11" fill="var(--ifm-font-color-base)">x</text>
          <text x={X(0) + 5} y={Y(N) + 4} fontSize="11" fill="var(--ifm-font-color-base)">y</text>
          <text x={X(0) - 11} y={Y(0) + 13} fontSize="10" fill="var(--ifm-font-color-base)">O</text>
          {[-6, -4, -2, 2, 4, 6].map((g) => (
            <g key={`t${g}`} fontSize="9" fill="var(--ifm-color-emphasis-600)" style={{ pointerEvents: 'none' }}>
              <text x={X(g)} y={Y(0) + 12} textAnchor="middle">{g}</text>
              <text x={X(0) - 4} y={Y(g) + 3} textAnchor="end">{g}</text>
            </g>
          ))}
          <line x1={axisLine[0]} y1={axisLine[1]} x2={axisLine[2]} y2={axisLine[3]} stroke="#e0245e" strokeWidth="2.2" strokeDasharray="7 4" />
          {poly(tri, '#4a90d9')}
          {tri.map(([x, y], i) => (
            <g key={i}>
              <circle cx={X(x)} cy={Y(y)} r="3.5" fill="#4a90d9" />
              <text x={X(x) + 5} y={Y(y) - 5} fontSize="12" fontWeight="700" fill="#4a90d9">{NAMES[i]}</text>
            </g>
          ))}
          {show ? poly(target, '#2e7d32', true) : null}
          {done ? poly(placed, correct ? '#2e7d32' : '#e0245e') : placed.length >= 2 ? <polyline points={placed.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill="none" stroke="#2a9d8f" strokeWidth="2" /> : null}
          {placed.map(([x, y], i) => {
            const ok = x === target[i][0] && y === target[i][1];
            return (
              <g key={`p${i}`}>
                <circle cx={X(x)} cy={Y(y)} r="5" fill={done ? (ok ? '#2e7d32' : '#e0245e') : '#2a9d8f'} />
                <text x={X(x) + 6} y={Y(y) - 6} fontSize="12" fontWeight="700" fill="var(--ifm-font-color-base)">{NAMES[i]}′</text>
              </g>
            );
          })}
        </svg>
        <Typography sx={{ mt: 1 }}>
          {done
            ? correct
              ? '✓ 全对！对应点所连线段都被对称轴垂直平分。'
              : `有 ${placed.filter((p, i) => p[0] !== target[i][0] || p[1] !== target[i][1]).length} 个点不对（红色）。点「撤销」改一改，或者看答案。`
            : `点出 ${next}′：${next}${tri[placed.length] ? `(${tri[placed.length].join(', ')})` : ''} 关于${AXES[axis].label}的对称点。`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          方法：从每个顶点向对称轴作垂线，在另一侧截取相等的距离。关于 x 轴：(x, y)→(x, −y)；关于 y 轴：(x, y)→(−x, y)。
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

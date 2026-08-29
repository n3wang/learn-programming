import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const W = 360;
const H = 280;
const OX = W / 2;
const OY = H / 2;
const SCALE = 28;

const PRESETS = [
  {id: 'acute', label: 'Acute', a: [3, 1], b: [2, 2]},
  {id: 'right', label: 'Orthogonal', a: [3, 0], b: [0, 2]},
  {id: 'obtuse', label: 'Obtuse', a: [3, 1], b: [-1, 2]},
  {id: 'parallel', label: 'Parallel', a: [2, 1], b: [4, 2]},
  {id: 'cw', label: 'Clockwise', a: [3, 0], b: [1, -2]},
];

const LEGEND = [
  {key: 'A', label: 'Vector a', color: '#1976d2', desc: 'First vector from the origin'},
  {key: 'B', label: 'Vector b', color: '#e65100', desc: 'Second vector from the origin'},
  {key: 'P', label: 'Projection', color: '#43a047', desc: 'Projection of b onto a (dot view)'},
  {key: 'X', label: 'Parallelogram', color: '#8e24aa33', desc: 'Area |a × b| (cross view)'},
];

function toSvg([x, y]) {
  return [OX + x * SCALE, OY - y * SCALE];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

function norm(a) {
  return Math.hypot(a[0], a[1]);
}

function Arrow({from, to, color, label}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ah = 10;
  const tipX = x2;
  const tipY = y2;
  const baseX = tipX - ux * ah;
  const baseY = tipY - uy * ah;
  const lx = -uy;
  const ly = ux;
  const p1 = `${tipX},${tipY}`;
  const p2 = `${baseX + lx * 5},${baseY + ly * 5}`;
  const p3 = `${baseX - lx * 5},${baseY - ly * 5}`;
  const midX = (x1 + x2) / 2 + lx * 12;
  const midY = (y1 + y2) / 2 + ly * 12;
  return (
    <g>
      <line x1={x1} y1={y1} x2={baseX} y2={baseY} stroke={color} strokeWidth={2.5} />
      <polygon points={`${p1} ${p2} ${p3}`} fill={color} />
      {label && (
        <text x={midX} y={midY} fill={color} fontSize="13" fontWeight="700">
          {label}
        </text>
      )}
    </g>
  );
}

export default function BasicGeometrySimulator() {
  const [presetId, setPresetId] = useState('acute');
  const [mode, setMode] = useState('dot');
  const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[0];
  const a = preset.a;
  const b = preset.b;

  const stats = useMemo(() => {
    const d = dot(a, b);
    const c = cross(a, b);
    const na = norm(a);
    const nb = norm(b);
    const cos = na && nb ? d / (na * nb) : 0;
    const angleDeg = (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
    const projLen = na ? d / na : 0;
    const projPoint = na
      ? [(a[0] / na) * projLen, (a[1] / na) * projLen]
      : [0, 0];
    return {d, c, na, nb, angleDeg, projLen, projPoint};
  }, [a, b]);

  const oa = toSvg([0, 0]);
  const sa = toSvg(a);
  const sb = toSvg(b);
  const sp = toSvg(stats.projPoint);
  const sSum = toSvg([a[0] + b[0], a[1] + b[1]]);

  let relation = 'acute angle';
  if (Math.abs(stats.d) < 1e-9) relation = 'orthogonal (right angle)';
  else if (stats.d < 0) relation = 'obtuse angle';
  if (Math.abs(stats.c) < 1e-9) relation = 'collinear / parallel';

  let turn = 'counter-clockwise (LEFT)';
  if (stats.c < -1e-9) turn = 'clockwise (RIGHT)';
  else if (Math.abs(stats.c) < 1e-9) turn = 'collinear (TOUCH)';

  return (
    <CEBlock
      title="Dot & cross playground"
      subtitle="Pick a preset. Switch modes to see projection (dot) vs oriented area (cross)."
      legend={<ColorLegend items={LEGEND} />}
    >
      <CEBlock.Section label="Preset">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {PRESETS.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              size="small"
              color={p.id === presetId ? 'primary' : 'default'}
              variant={p.id === presetId ? 'filled' : 'outlined'}
              onClick={() => setPresetId(p.id)}
            />
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="View">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{mb: 1.5}}
        >
          <ToggleButton value="dot">Dot product</ToggleButton>
          <ToggleButton value="cross">Cross (2D)</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{overflowX: 'auto'}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vector plane">
            <rect x="0" y="0" width={W} height={H} fill="#fafafa" />
            <line x1={0} y1={OY} x2={W} y2={OY} stroke="#cfd8dc" strokeWidth={1} />
            <line x1={OX} y1={0} x2={OX} y2={H} stroke="#cfd8dc" strokeWidth={1} />
            {[-4, -3, -2, -1, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line
                  x1={OX + i * SCALE}
                  y1={OY - 3}
                  x2={OX + i * SCALE}
                  y2={OY + 3}
                  stroke="#90a4ae"
                />
                <line
                  x1={OX - 3}
                  y1={OY - i * SCALE}
                  x2={OX + 3}
                  y2={OY - i * SCALE}
                  stroke="#90a4ae"
                />
              </g>
            ))}

            {mode === 'cross' && Math.abs(stats.c) > 1e-9 && (
              <polygon
                points={`${oa.join(',')} ${sa.join(',')} ${sSum.join(',')} ${sb.join(',')}`}
                fill="#8e24aa33"
                stroke="#8e24aa"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            )}

            {mode === 'dot' && (
              <>
                <line
                  x1={sb[0]}
                  y1={sb[1]}
                  x2={sp[0]}
                  y2={sp[1]}
                  stroke="#90a4ae"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <circle cx={sp[0]} cy={sp[1]} r={4} fill="#43a047" />
                <Arrow from={oa} to={sp} color="#43a047" label="proj" />
              </>
            )}

            <Arrow from={oa} to={sa} color="#1976d2" label="a" />
            <Arrow from={oa} to={sb} color="#e65100" label="b" />
            <circle cx={OX} cy={OY} r={3.5} fill="#37474f" />
          </svg>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="Numbers">
        <Typography variant="body2" sx={{fontFamily: 'monospace', mb: 0.5}}>
          a = ({a[0]}, {a[1]}) &nbsp; b = ({b[0]}, {b[1]})
        </Typography>
        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
          a · b = {stats.d} &nbsp;|&nbsp; a × b = {stats.c} &nbsp;|&nbsp; ∠ ≈{' '}
          {stats.angleDeg.toFixed(1)}°
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
          {mode === 'dot'
            ? `Dot sign → ${relation}. Projection length of b onto a ≈ ${stats.projLen.toFixed(2)}.`
            : `2D cross sign → turn from a to b is ${turn}. |a × b| = parallelogram area = ${Math.abs(
                stats.c,
              ).toFixed(2)}.`}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

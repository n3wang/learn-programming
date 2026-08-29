import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const PTS = [
  {x: 0, y: 0, label: 'A'},
  {x: 3, y: 1, label: 'B'},
  {x: 1, y: 4, label: 'C'},
  {x: 5, y: 2, label: 'D'},
  {x: -1, y: 2, label: 'E'},
];

const MODES = {
  path: {label: 'Taxicab path'},
  farthest: {label: 'Farthest pair'},
  rotate: {label: '→ Chebyshev'},
};

const LEGEND = [
  {key: 'P', label: 'Point', color: '#5e35b1', desc: 'Input point'},
  {key: 'H', label: 'Highlighted', color: '#ffb74d', desc: 'Extremal / endpoints'},
  {key: 'E', label: 'Edge / path', color: '#4fc3f7', desc: 'Manhattan segment or link'},
];

const W = 360;
const H = 300;
const OX = 160;
const OY = 200;
const S = 28;

function toSvg(x, y) {
  return [OX + x * S, OY - y * S];
}

function man(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function alpha(p) {
  return {x: p.x + p.y, y: p.y - p.x, label: p.label};
}

function cheb(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function buildPathFrames() {
  const a = PTS[0];
  const b = PTS[3]; // (0,0) → (5,2), dist 7
  const frames = [];
  frames.push({
    mode: 'path',
    hi: [0, 3],
    path: [],
    msg: `Manhattan d(A,D)=|5−0|+|2−0|=7. Any monotone grid path has the same length.`,
  });
  const path1 = [
    [0, 0],
    [5, 0],
    [5, 2],
  ];
  frames.push({
    mode: 'path',
    hi: [0, 3],
    path: path1,
    msg: `Path right×5 then up×2 — length 7.`,
  });
  const path2 = [
    [0, 0],
    [0, 2],
    [5, 2],
  ];
  frames.push({
    mode: 'path',
    hi: [0, 3],
    path: path2,
    msg: `Path up×2 then right×5 — also length 7.`,
  });
  const path3 = [
    [0, 0],
    [2, 0],
    [2, 1],
    [5, 1],
    [5, 2],
  ];
  frames.push({
    mode: 'path',
    hi: [0, 3],
    path: path3,
    msg: `Mixed staircase — still |Δx|+|Δy|=7.`,
  });
  return frames;
}

function buildFarthestFrames() {
  const frames = [];
  const masks = [
    {msk: 0b11, name: '+x +y'},
    {msk: 0b01, name: '+x −y'},
    {msk: 0b10, name: '−x +y'},
    {msk: 0b00, name: '−x −y'},
  ];
  frames.push({
    mode: 'farthest',
    hi: [],
    path: [],
    vals: null,
    msg: `Farthest Manhattan pair = max over 4 sign patterns of (max cur − min cur).`,
  });
  let best = 0;
  let bestHi = [];
  for (const {msk, name} of masks) {
    const vals = PTS.map((p, i) => {
      let cur = 0;
      cur += msk & 1 ? p.x : -p.x;
      cur += msk & 2 ? p.y : -p.y;
      return {i, cur, label: p.label};
    });
    let mx = -Infinity;
    let mn = Infinity;
    let imx = 0;
    let imn = 0;
    for (const v of vals) {
      if (v.cur > mx) {
        mx = v.cur;
        imx = v.i;
      }
      if (v.cur < mn) {
        mn = v.cur;
        imn = v.i;
      }
    }
    const diff = mx - mn;
    if (diff > best) {
      best = diff;
      bestHi = [imn, imx];
    }
    frames.push({
      mode: 'farthest',
      hi: [imn, imx],
      path: [],
      vals,
      msg: `Mask ${name}: values [${vals.map((v) => v.cur).join(', ')}]. max−min=${diff}. Best so far=${best}.`,
    });
  }
  frames.push({
    mode: 'farthest',
    hi: bestHi,
    path: [],
    vals: null,
    msg: `Answer = ${best} (pair ${PTS[bestHi[0]].label}–${PTS[bestHi[1]].label}). Matches brute force.`,
  });
  return frames;
}

function buildRotateFrames() {
  const frames = [];
  frames.push({
    mode: 'rotate',
    hi: [],
    path: [],
    transformed: false,
    msg: `|m|+|n| = max(|m+n|, |m−n|). Map α:(x,y)→(x+y, y−x) turns Manhattan into Chebyshev.`,
  });
  frames.push({
    mode: 'rotate',
    hi: [0, 3],
    path: [],
    transformed: false,
    msg: `Before: d_M(A,D)=${man(PTS[0], PTS[3])}.`,
  });
  frames.push({
    mode: 'rotate',
    hi: [0, 3],
    path: [],
    transformed: true,
    msg: `After α: d_∞(α(A),α(D))=${cheb(alpha(PTS[0]), alpha(PTS[3]))}. Same number; geometry is rotated 45° & scaled √2.`,
  });
  return frames;
}

function buildFrames(mode) {
  if (mode === 'path') return buildPathFrames();
  if (mode === 'farthest') return buildFarthestFrames();
  return buildRotateFrames();
}

export default function ManhattanDistanceSimulator() {
  const [mode, setMode] = useState('path');
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];
  const showT = frame.transformed;

  const drawPts = showT ? PTS.map(alpha) : PTS;

  return (
    <CEBlock
      title="Manhattan geometry"
      subtitle="Taxicab paths, farthest pair via signs, rotate to Chebyshev."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(MODES).map(([k, v]) => (
              <Chip
                key={k}
                size="small"
                label={v.label}
                color={mode === k ? 'primary' : 'default'}
                onClick={() => {
                  setMode(k);
                  setStep(0);
                }}
              />
            ))}
          </Stack>
          <StepControls
            step={step}
            max={frames.length - 1}
            onStep={setStep}
            label="Step"
          />
        </Stack>
      }
    >
      <CEBlock.Section label={showT ? 'α(points) plane' : 'Plane'}>
        <Box sx={{overflowX: 'auto'}}>
          <svg width={W} height={H} style={{display: 'block', maxWidth: '100%'}}>
            <line x1={20} y1={OY} x2={W - 20} y2={OY} stroke="#b0bec5" />
            <line x1={OX} y1={20} x2={OX} y2={H - 20} stroke="#b0bec5" />
            {frame.path &&
              frame.path.length > 1 &&
              frame.path.slice(0, -1).map((p, i) => {
                const [x1, y1] = toSvg(p[0], p[1]);
                const [x2, y2] = toSvg(frame.path[i + 1][0], frame.path[i + 1][1]);
                return (
                  <line
                    key={`e${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#4fc3f7"
                    strokeWidth={3}
                  />
                );
              })}
            {frame.hi?.length === 2 && !frame.path?.length && (
              <line
                x1={toSvg(drawPts[frame.hi[0]].x, drawPts[frame.hi[0]].y)[0]}
                y1={toSvg(drawPts[frame.hi[0]].x, drawPts[frame.hi[0]].y)[1]}
                x2={toSvg(drawPts[frame.hi[1]].x, drawPts[frame.hi[1]].y)[0]}
                y2={toSvg(drawPts[frame.hi[1]].x, drawPts[frame.hi[1]].y)[1]}
                stroke="#4fc3f7"
                strokeWidth={2}
                strokeDasharray="5 4"
              />
            )}
            {drawPts.map((p, i) => {
              const [cx, cy] = toSvg(p.x, p.y);
              const hi = frame.hi?.includes(i);
              return (
                <g key={p.label}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={hi ? 8 : 6}
                    fill={hi ? '#ffb74d' : '#5e35b1'}
                    stroke="#37474f"
                    strokeWidth={1}
                  />
                  <text x={cx + 10} y={cy - 8} fontSize="12" fontWeight="700" fill="#37474f">
                    {p.label}
                    {frame.vals ? `:${frame.vals[i].cur}` : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const P0 = [
  {x: 0, y: 0},
  {x: 2, y: 0},
  {x: 1, y: 2},
];
const Q0 = [
  {x: 0, y: 0},
  {x: 1, y: 0},
  {x: 0, y: 1},
];

const LEGEND = [
  {key: 'P', label: 'Polygon P', color: '#5e35b1', desc: 'First convex polygon'},
  {key: 'Q', label: 'Polygon Q', color: '#e65100', desc: 'Second convex polygon'},
  {key: 'S', label: 'P + Q', color: '#2e7d32', desc: 'Minkowski sum vertices'},
  {key: 'C', label: 'Current Pi+Qj', color: '#ffb74d', desc: 'Vertex appended this step'},
];

const W = 400;
const H = 300;
const OX = 80;
const OY = 240;
const S = 36;

function toSvg(p) {
  return [OX + p.x * S, OY - p.y * S];
}

function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

function sub(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

function add(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
}

function reorder(P) {
  let pos = 0;
  for (let i = 1; i < P.length; i += 1) {
    if (P[i].y < P[pos].y || (P[i].y === P[pos].y && P[i].x < P[pos].x)) pos = i;
  }
  return P.slice(pos).concat(P.slice(0, pos));
}

function buildFrames() {
  const frames = [];
  let P = reorder(P0.map((p) => ({...p})));
  let Q = reorder(Q0.map((p) => ({...p})));
  frames.push({
    P,
    Q,
    result: [],
    i: 0,
    j: 0,
    msg: 'Reorder so first vertex is lowest (then leftmost). Edges become sorted by polar angle.',
  });

  P = [...P, P[0], P[1]];
  Q = [...Q, Q[0], Q[1]];
  const result = [];
  let i = 0;
  let j = 0;

  frames.push({
    P: P.slice(0, -2),
    Q: Q.slice(0, -2),
    result: [],
    i: 0,
    j: 0,
    msg: 'Two pointers i,j at 0. While either polygon has unused edges, append Pi+Qj and advance by smaller polar angle (cross test).',
  });

  while (i < P.length - 2 || j < Q.length - 2) {
    const v = add(P[i], Q[j]);
    result.push(v);
    const cr = cross(sub(P[i + 1], P[i]), sub(Q[j + 1], Q[j]));
    const advP = cr >= 0 && i < P.length - 2;
    const advQ = cr <= 0 && j < Q.length - 2;
    frames.push({
      P: P.slice(0, -2),
      Q: Q.slice(0, -2),
      result: result.map((p) => ({...p})),
      i,
      j,
      last: v,
      msg: `Append (${v.x},${v.y}) = P[${i}]+Q[${j}]. cross=${cr} → advance ${
        advP && advQ ? 'both (parallel)' : advP ? 'i (P edge)' : 'j (Q edge)'
      }.`,
    });
    if (advP) i += 1;
    if (advQ) j += 1;
  }

  frames.push({
    P: P.slice(0, -2),
    Q: Q.slice(0, -2),
    result: result.map((p) => ({...p})),
    i: null,
    j: null,
    last: null,
    msg: `Done. |P+Q|=${result.length} ≤ |P|+|Q|=${P0.length + Q0.length}. Convex.`,
  });

  return frames;
}

function polyPath(pts) {
  if (!pts.length) return '';
  return (
    pts
      .map((p, idx) => {
        const [x, y] = toSvg(p);
        return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ') + ' Z'
  );
}

export default function MinkowskiSumSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const [show, setShow] = useState({P: true, Q: true, S: true});
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Minkowski sum merge"
      subtitle="Merge edge polar angles with two pointers; vertices are Pi + Qj."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            {['P', 'Q', 'S'].map((k) => (
              <Chip
                key={k}
                size="small"
                label={k === 'S' ? 'P+Q' : k}
                color={show[k] ? 'primary' : 'default'}
                onClick={() => setShow((s) => ({...s, [k]: !s[k]}))}
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
      <CEBlock.Section label="Plane">
        <svg width={W} height={H} style={{display: 'block', maxWidth: '100%'}}>
          <line x1={20} y1={OY} x2={W - 20} y2={OY} stroke="#b0bec5" />
          <line x1={OX} y1={20} x2={OX} y2={H - 20} stroke="#b0bec5" />
          {show.P && (
            <path d={polyPath(frame.P)} fill="#5e35b133" stroke="#5e35b1" strokeWidth={2} />
          )}
          {show.Q && (
            <path d={polyPath(frame.Q)} fill="#e6510033" stroke="#e65100" strokeWidth={2} />
          )}
          {show.S && frame.result.length > 1 && (
            <path
              d={polyPath(frame.result)}
              fill="#2e7d3233"
              stroke="#2e7d32"
              strokeWidth={2.5}
            />
          )}
          {frame.last && (
            <circle
              cx={toSvg(frame.last)[0]}
              cy={toSvg(frame.last)[1]}
              r={7}
              fill="#ffb74d"
              stroke="#ef6c00"
            />
          )}
        </svg>
      </CEBlock.Section>

      <CEBlock.Section label="Pointers">
        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
          i={frame.i ?? '—'} · j={frame.j ?? '—'} · |result|={frame.result.length}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

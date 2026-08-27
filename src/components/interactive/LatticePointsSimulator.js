import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Demo: Σ_{x=0}^{n-1} ⌊k x + b⌋ with k=3/2, b=1/5, n=8 → 40. */
const K = 1.5;
const B = 0.2;
const N = 8;

const LEGEND = [
  {key: 'L', label: 'On/under line', color: '#4fc3f7', desc: '0 < y ≤ ⌊kx+b⌋'},
  {key: 'F', label: 'Floor strip', color: '#81c784', desc: 'Counted via ⌊k⌋, ⌊b⌋ closed form'},
  {key: 'R', label: 'Remainder band', color: '#ffb74d', desc: 'Needs fractional k′,b′ / reciprocity'},
];

const CELL = 28;
const PAD = 24;

function floorSumNaive(k, b, n) {
  let s = 0;
  const cols = [];
  for (let x = 0; x < n; x += 1) {
    const h = Math.floor(k * x + b);
    cols.push(h);
    s += h;
  }
  return {s, cols};
}

function buildFrames() {
  const frames = [];
  const {s, cols} = floorSumNaive(K, B, N);
  const maxY = Math.max(...cols, 1);

  frames.push({
    phase: 'all',
    cols,
    maxY,
    fk: null,
    fb: null,
    remCols: null,
    cnt: 0,
    msg: `Count lattice points with 0 ≤ x < ${N} and 0 < y ≤ ⌊(${K})x + ${B}⌋. Naive sum = ${s}.`,
  });

  const fk = Math.floor(K);
  const fb = Math.floor(B);
  const floorCnt = ((fk * (N - 1) + 2 * fb) * N) / 2;
  const floorCols = cols.map((_, x) => fk * x + fb);
  const remCols = cols.map((h, x) => h - (fk * x + fb));

  frames.push({
    phase: 'floor',
    cols,
    maxY,
    fk,
    fb,
    remCols: null,
    floorCols,
    cnt: floorCnt,
    msg: `⌊k⌋=${fk}, ⌊b⌋=${fb}. Closed form counts green strip: (${fk}·(n−1)+2·${fb})·n/2 = ${floorCnt}.`,
  });

  frames.push({
    phase: 'rem',
    cols,
    maxY,
    fk,
    fb,
    remCols,
    floorCols,
    cnt: floorCnt,
    msg: `Left: heights rem[x]=⌊k′x+b′⌋ with k′=${K - fk}, b′=${B - fb} (both < 1). Orange = remainder band.`,
  });

  const k2 = K - fk;
  const b2 = B - fb;
  const t = k2 * N + b2;
  const ft = Math.floor(t);
  frames.push({
    phase: 'recip',
    cols,
    maxY,
    fk,
    fb,
    remCols,
    floorCols,
    cnt: floorCnt,
    ft,
    msg: `t = k′n+b′ = ${t.toFixed(3)}, ⌊t⌋=${ft}. Reciprocity: recurse with k″=1/k′, n″=⌊t⌋ (axes flip).`,
  });

  frames.push({
    phase: 'done',
    cols,
    maxY,
    fk,
    fb,
    remCols,
    floorCols,
    cnt: s,
    msg: `Recursion finishes in O(log n). Total = ${s}. Edge sums with signs assemble polygon lattice counts.`,
  });

  return frames;
}

function Grid({frame}) {
  const w = PAD * 2 + N * CELL;
  const h = PAD * 2 + (frame.maxY + 1) * CELL;
  const points = [];
  for (let x = 0; x < N; x += 1) {
    for (let y = 1; y <= frame.cols[x]; y += 1) {
      const inFloor =
        frame.floorCols != null && y <= frame.floorCols[x];
      const inRem =
        frame.remCols != null && y > (frame.floorCols?.[x] ?? 0) && y <= frame.cols[x];
      let fill = '#4fc3f7';
      if (frame.phase === 'floor' && inFloor) fill = '#81c784';
      if (frame.phase === 'rem' || frame.phase === 'recip' || frame.phase === 'done') {
        if (inFloor) fill = '#81c784';
        else if (inRem) fill = '#ffb74d';
      }
      if (frame.phase === 'all') fill = '#4fc3f7';
      points.push({x, y, fill});
    }
  }

  const x0 = PAD;
  const y0 = h - PAD;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{maxWidth: 420, display: 'block'}}>
      {/* axes */}
      <line x1={x0} y1={y0} x2={x0 + N * CELL} y2={y0} stroke="#90a4ae" strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - (frame.maxY + 1) * CELL} stroke="#90a4ae" strokeWidth={1.5} />
      {/* line y = kx+b */}
      <line
        x1={x0}
        y1={y0 - B * CELL}
        x2={x0 + (N - 0.001) * CELL}
        y2={y0 - (K * (N - 0.001) + B) * CELL}
        stroke="#5e35b1"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      {points.map((p) => (
        <circle
          key={`${p.x}-${p.y}`}
          cx={x0 + (p.x + 0.5) * CELL}
          cy={y0 - p.y * CELL}
          r={5}
          fill={p.fill}
          stroke="#37474f"
          strokeWidth={0.8}
        />
      ))}
      {Array.from({length: N}, (_, x) => (
        <text
          key={`tx${x}`}
          x={x0 + (x + 0.5) * CELL}
          y={y0 + 14}
          textAnchor="middle"
          fontSize="10"
          fill="#607d8b"
        >
          {x}
        </text>
      ))}
    </svg>
  );
}

export default function LatticePointsSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Floor-sum under a line"
      subtitle={`k=${K}, b=${B}, n=${N} → Σ ⌊kx+b⌋ = ${floorSumNaive(K, B, N).s}`}
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Lattice under y = kx + b">
        <Grid frame={frame} />
      </CEBlock.Section>

      <CEBlock.Section label="Running total">
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
            counted ≈ {frame.cnt}
          </Typography>
          {frame.ft != null && (
            <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
              ⌊t⌋ = {frame.ft}
            </Typography>
          )}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

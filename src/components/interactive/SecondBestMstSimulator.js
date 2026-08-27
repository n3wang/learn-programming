import React, {useMemo, useState} from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Path graph MST + a few chords. */
const NODES = [
  {id: 1, x: 40, y: 120},
  {id: 2, x: 140, y: 40},
  {id: 3, x: 240, y: 120},
  {id: 4, x: 340, y: 40},
];

const EDGES = [
  {a: 1, b: 2, w: 1, mst: true},
  {a: 2, b: 3, w: 2, mst: true},
  {a: 3, b: 4, w: 3, mst: true},
  {a: 1, b: 3, w: 4, mst: false},
  {a: 2, b: 4, w: 5, mst: false},
  {a: 1, b: 4, w: 10, mst: false},
];

const LEGEND = [
  {key: 'M', label: 'MST edge', color: '#2e7d32', desc: 'In the minimum spanning tree'},
  {key: 'N', label: 'Candidate e_new', color: '#ef6c00', desc: 'Non-tree edge being added'},
  {key: 'K', label: 'e_old (max on cycle)', color: '#c62828', desc: 'Heaviest MST edge on the cycle'},
  {key: 'C', label: 'Other edges', color: '#90a4ae', desc: 'Not involved this step'},
];

function pos(id) {
  return NODES.find((n) => n.id === id);
}

function buildFrames() {
  const frames = [];
  frames.push({
    highlight: null,
    remove: null,
    delta: null,
    best: null,
    msg: 'MST (green) has weight 1+2+3 = 6. Second-best differs by replacing exactly one MST edge.',
  });

  const trials = [
    {add: {a: 1, b: 3, w: 4}, rem: {a: 2, b: 3, w: 2}, delta: 2, weight: 8},
    {add: {a: 2, b: 4, w: 5}, rem: {a: 3, b: 4, w: 3}, delta: 2, weight: 8},
    {add: {a: 1, b: 4, w: 10}, rem: {a: 3, b: 4, w: 3}, delta: 7, weight: 13},
  ];

  let best = Infinity;
  for (const t of trials) {
    best = Math.min(best, t.weight);
    frames.push({
      highlight: t.add,
      remove: t.rem,
      delta: t.delta,
      best,
      msg: `Add ${t.add.a}–${t.add.b} (w=${t.add.w}). Cycle max MST edge is ${t.rem.a}–${t.rem.b} (w=${t.rem.w}). δ=${t.delta} → tree weight ${t.weight}. Best so far ${best}.`,
    });
  }

  frames.push({
    highlight: {a: 1, b: 3, w: 4},
    remove: {a: 2, b: 3, w: 2},
    delta: 2,
    best: 8,
    msg: 'Minimum δ is 2 → second-best MST weight = 8 (e.g. edges 1–2, 1–3, 3–4).',
  });

  return frames;
}

function sameUndirected(e, f) {
  if (!e || !f) return false;
  return (e.a === f.a && e.b === f.b) || (e.a === f.b && e.b === f.a);
}

export default function SecondBestMstSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Second-best MST via edge swap"
      subtitle="Add a non-tree edge, drop the heaviest MST edge on the created cycle."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Graph">
        <svg width={380} height={170} style={{display: 'block', maxWidth: '100%'}}>
          {EDGES.map((e) => {
            const p = pos(e.a);
            const q = pos(e.b);
            const isAdd = sameUndirected(e, frame.highlight);
            const isRem = sameUndirected(e, frame.remove);
            let stroke = e.mst ? '#2e7d32' : '#90a4ae';
            let width = e.mst ? 3 : 1.5;
            if (isAdd) {
              stroke = '#ef6c00';
              width = 4;
            }
            if (isRem) {
              stroke = '#c62828';
              width = 4;
            }
            const mx = (p.x + q.x) / 2;
            const my = (p.y + q.y) / 2;
            return (
              <g key={`${e.a}-${e.b}`}>
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke={stroke}
                  strokeWidth={width}
                  strokeDasharray={e.mst || isAdd ? undefined : '4 3'}
                />
                <text x={mx + 4} y={my - 4} fontSize="11" fill="#37474f">
                  {e.w}
                </text>
              </g>
            );
          })}
          {NODES.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={14} fill="#eceff1" stroke="#455a64" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fontWeight="700">
                {n.id}
              </text>
            </g>
          ))}
        </svg>
        <Stack direction="row" spacing={1} sx={{mt: 1}} flexWrap="wrap" useFlexGap>
          <Chip size="small" label="MST weight = 6" />
          {frame.delta != null && <Chip size="small" color="warning" label={`δ = ${frame.delta}`} />}
          {frame.best != null && (
            <Chip size="small" color="success" label={`best 2nd = ${frame.best}`} />
          )}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

import React, {useMemo, useState} from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const MODES = {
  cycle: {label: 'Bridgeless cycle'},
  bridge: {label: 'Has a bridge'},
};

const LEGEND = [
  {key: 'T', label: 'Tree edge →', color: '#2e7d32', desc: 'DFS tree: parent → child (away from root)'},
  {key: 'B', label: 'Back edge ←', color: '#0288d1', desc: 'Points toward ancestor'},
  {key: 'X', label: 'Bridge', color: '#c62828', desc: 'Forces a cut; blocks strong orientation'},
  {key: 'R', label: 'DFS root', color: '#6a1b9a', desc: 'Reachable from / can reach all in bridgeless case'},
];

/** Cycle 0-1-2-3-0, DFS from 0: tree 0→1→2→3, back 3→0 (and maybe 2-0 if present — use C4). */
const CYCLE = {
  nodes: [
    {id: 0, x: 80, y: 100},
    {id: 1, x: 200, y: 40},
    {id: 2, x: 320, y: 100},
    {id: 3, x: 200, y: 160},
  ],
  // undirected edges with eventual orientation
  edges: [
    {u: 0, v: 1, kind: 'tree'},
    {u: 1, v: 2, kind: 'tree'},
    {u: 2, v: 3, kind: 'tree'},
    {u: 3, v: 0, kind: 'back'},
  ],
};

/** Path 0-1-2 with bridge 1-2; also edge 0-1. */
const BRIDGE = {
  nodes: [
    {id: 0, x: 80, y: 100},
    {id: 1, x: 200, y: 100},
    {id: 2, x: 320, y: 100},
  ],
  edges: [
    {u: 0, v: 1, kind: 'tree'},
    {u: 1, v: 2, kind: 'bridge'},
  ],
};

function buildFrames(mode) {
  if (mode === 'cycle') {
    return [
      {
        oriented: false,
        reveal: 0,
        msg: 'C₄ is bridgeless and connected → Robbins: a strong orientation exists.',
      },
      {
        oriented: true,
        reveal: 3,
        msg: 'DFS from root 0: tree edges 0→1→2→3 (away from root).',
      },
      {
        oriented: true,
        reveal: 4,
        msg: 'Non-tree edge 3→0 points to an ancestor. From any v you can climb to root via backs; from root you can reach all via the tree.',
      },
      {
        oriented: true,
        reveal: 4,
        scc: 1,
        msg: 'Result is strongly connected (1 SCC).',
      },
    ];
  }
  return [
    {
      oriented: false,
      reveal: 0,
      msg: 'Path 0—1—2 has bridge 1—2. Orienting it makes one direction impossible.',
    },
    {
      oriented: true,
      reveal: 2,
      msg: 'Orient 0→1→2. Cannot go from 2 back to 0 → not strongly connected.',
    },
    {
      oriented: true,
      reveal: 2,
      scc: 2,
      msg: 'Min #SCCs = (#undirected components) + (#bridges) = 1 + 1 = 2. Orient bridges arbitrarily; strongly orient each 2-edge-connected piece.',
    },
  ];
}

function arrowPoints(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const tipX = x2 - ux * 18;
  const tipY = y2 - uy * 18;
  const ax = tipX - ux * 10 - uy * 6;
  const ay = tipY - uy * 10 + ux * 6;
  const bx = tipX - ux * 10 + uy * 6;
  const by = tipY - uy * 10 - ux * 6;
  return {tipX, tipY, ax, ay, bx, by, mx: (x1 + x2) / 2, my: (y1 + y2) / 2};
}

export default function StrongOrientationSimulator() {
  const [mode, setMode] = useState('cycle');
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];
  const g = mode === 'cycle' ? CYCLE : BRIDGE;

  return (
    <CEBlock
      title="Strong orientation"
      subtitle="DFS tree away from root; back edges toward ancestors. Bridges block a single SCC."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Graph">
        <Stack direction="row" spacing={1} sx={{mb: 1}} flexWrap="wrap" useFlexGap>
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
          {frame.scc != null && <Chip size="small" color="warning" label={`SCCs = ${frame.scc}`} />}
        </Stack>
        <svg width={400} height={200} style={{display: 'block', maxWidth: '100%'}}>
          {g.edges.map((e, i) => {
            if (frame.oriented && i >= frame.reveal) return null;
            const a = g.nodes.find((n) => n.id === e.u);
            const b = g.nodes.find((n) => n.id === e.v);
            let stroke = '#90a4ae';
            if (e.kind === 'tree') stroke = '#2e7d32';
            if (e.kind === 'back') stroke = '#0288d1';
            if (e.kind === 'bridge') stroke = '#c62828';
            if (!frame.oriented) stroke = '#90a4ae';
            const pts = arrowPoints(a.x, a.y, b.x, b.y);
            return (
              <g key={`${e.u}-${e.v}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={stroke}
                  strokeWidth={3}
                />
                {frame.oriented && (
                  <polygon
                    points={`${pts.tipX},${pts.tipY} ${pts.ax},${pts.ay} ${pts.bx},${pts.by}`}
                    fill={stroke}
                  />
                )}
              </g>
            );
          })}
          {g.nodes.map((n) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={16}
                fill={n.id === 0 ? '#e1bee7' : '#eceff1'}
                stroke="#455a64"
              />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="13" fontWeight="700">
                {n.id}
              </text>
            </g>
          ))}
        </svg>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

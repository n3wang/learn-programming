import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

// CSES-style example: 1-2-3-4 and 3-5  (n=5, centroid = 3)
const EDGES = [
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
];

const POS = {
  1: {x: 70, y: 70},
  2: {x: 150, y: 70},
  3: {x: 230, y: 70},
  4: {x: 310, y: 70},
  5: {x: 230, y: 140},
};

const LEGEND = [
  {key: 'C', label: 'Current / centroid', color: '#ffb74d', desc: 'Vertex under inspection or chosen centroid'},
  {key: 'A', label: 'Active component', color: '#4fc3f7', desc: 'Nodes still in the current subtree'},
  {key: 'R', label: 'Removed', color: '#ef9a9a', desc: 'Centroid already removed at a prior level'},
  {key: 'H', label: 'Heavy child', color: '#ce93d8', desc: 'Child subtree with size > N/2 — walk here'},
];

function buildAdj(edges) {
  const adj = {};
  edges.forEach(([a, b]) => {
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b);
    adj[b].push(a);
  });
  return adj;
}

function dfsSize(v, p, adj, removed, sizes) {
  sizes[v] = 1;
  for (const u of adj[v] || []) {
    if (u === p || removed[u]) continue;
    dfsSize(u, v, adj, removed, sizes);
    sizes[v] += sizes[u];
  }
}

function findCentroid(v, treeSize, p, adj, removed, sizes) {
  for (const u of adj[v] || []) {
    if (u === p || removed[u]) continue;
    if (sizes[u] * 2 > treeSize) {
      return findCentroid(u, treeSize, v, adj, removed, sizes);
    }
  }
  return v;
}

function buildFindCentroidFrames() {
  const adj = buildAdj(EDGES);
  const n = 5;
  const frames = [];

  const sizes = {};
  dfsSize(1, -1, adj, {}, sizes);
  frames.push({
    phase: 'sizes',
    current: null,
    heavy: null,
    centroid: null,
    removed: {},
    sizes: {...sizes},
    msg: `DFS subtree sizes from node 1. Total N=${n}. Need every component ≤ ⌊N/2⌋ = ${Math.floor(n / 2)} after removal.`,
  });

  let v = 1;
  while (true) {
    frames.push({
      phase: 'walk',
      current: v,
      heavy: null,
      centroid: null,
      removed: {},
      sizes: {...sizes},
      msg: `At node ${v} (subtree size ${sizes[v]}). Check each child: any subtree > ${n / 2}?`,
    });

    let heavy = null;
    for (const u of adj[v]) {
      if (sizes[u] * 2 > n) {
        heavy = u;
        break;
      }
    }

    if (heavy != null) {
      frames.push({
        phase: 'walk',
        current: v,
        heavy,
        centroid: null,
        removed: {},
        sizes: {...sizes},
        msg: `Child ${heavy} has subtree size ${sizes[heavy]} > N/2 = ${n / 2}. Move into the heavy child.`,
      });
      v = heavy;
    } else {
      frames.push({
        phase: 'done',
        current: v,
        heavy: null,
        centroid: v,
        removed: {},
        sizes: {...sizes},
        msg: `No child exceeds N/2. Node ${v} is a centroid. Removing it leaves components of size ≤ ${Math.floor(n / 2)}.`,
      });
      break;
    }
  }
  return frames;
}

function buildDecomposeFrames() {
  const adj = buildAdj(EDGES);
  const removed = {};
  const frames = [];

  const decompose = (entry) => {
    const sizes = {};
    dfsSize(entry, -1, adj, removed, sizes);
    const treeSize = sizes[entry];
    const centroid = findCentroid(entry, treeSize, -1, adj, removed, sizes);

    frames.push({
      phase: 'decompose',
      current: centroid,
      heavy: null,
      centroid,
      removed: {...removed},
      sizes: {...sizes},
      msg: `Component rooted at ${entry} (size ${treeSize}). Centroid = ${centroid}. Process paths through it, then remove.`,
    });

    removed[centroid] = true;
    frames.push({
      phase: 'removed',
      current: centroid,
      heavy: null,
      centroid,
      removed: {...removed},
      sizes: {...sizes},
      msg: `Removed centroid ${centroid}. Recurse on each remaining subtree attached to it.`,
    });

    for (const u of adj[centroid]) {
      if (!removed[u]) decompose(u);
    }
  };

  decompose(1);
  frames.push({
    phase: 'done',
    current: null,
    heavy: null,
    centroid: null,
    removed: {...removed},
    sizes: {},
    msg: 'Decomposition complete. Depth is O(log N); each original path passes through some centroid exactly once when processed.',
  });
  return frames;
}

function nodeColor(id, frame) {
  if (frame.removed[id]) return '#ffcdd2';
  if (frame.centroid === id) return '#ffb74d';
  if (frame.current === id) return '#ffb74d';
  if (frame.heavy === id) return '#ce93d8';
  if (frame.phase === 'sizes' || frame.phase === 'walk' || frame.phase === 'decompose') {
    return '#bbdefb';
  }
  return '#eceff1';
}

export default function CentroidDecompositionSimulator() {
  const [mode, setMode] = useState('find');
  const [step, setStep] = useState(0);

  const findFrames = useMemo(buildFindCentroidFrames, []);
  const decomposeFrames = useMemo(buildDecomposeFrames, []);
  const frames = mode === 'find' ? findFrames : decomposeFrames;
  const frame = frames[Math.min(step, frames.length - 1)];

  const onMode = (m) => {
    setMode(m);
    setStep(0);
  };

  return (
    <CEBlock
      title="Centroid decomposition"
      subtitle="CSES example tree (n=5). Step through finding a centroid or full recursive decomposition."
      legend={<ColorLegend items={LEGEND} />}
    >
      <CEBlock.Section label="Mode">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mb: 1}}>
          <Chip
            label="Find centroid"
            size="small"
            color={mode === 'find' ? 'primary' : 'default'}
            variant={mode === 'find' ? 'filled' : 'outlined'}
            onClick={() => onMode('find')}
          />
          <Chip
            label="Full decomposition"
            size="small"
            color={mode === 'decompose' ? 'primary' : 'default'}
            variant={mode === 'decompose' ? 'filled' : 'outlined'}
            onClick={() => onMode('decompose')}
          />
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Tree">
        <Box sx={{overflowX: 'auto'}}>
          <svg width="380" height="180" viewBox="0 0 380 180" role="img" aria-label="Tree for centroid decomposition">
            {EDGES.map(([a, b]) => {
              const pa = POS[a];
              const pb = POS[b];
              const cut = frame.removed[a] || frame.removed[b];
              return (
                <line
                  key={`${a}-${b}`}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={cut ? '#ef9a9a' : '#78909c'}
                  strokeWidth={cut ? 1.5 : 2}
                  strokeDasharray={cut ? '4 3' : undefined}
                />
              );
            })}
            {Object.entries(POS).map(([id, p]) => {
              const nid = Number(id);
              const sz = frame.sizes[nid];
              return (
                <g key={id}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={22}
                    fill={nodeColor(nid, frame)}
                    stroke="#37474f"
                    strokeWidth={frame.current === nid || frame.centroid === nid ? 3 : 1.5}
                  />
                  <text x={p.x} y={p.y - 4} textAnchor="middle" fontSize="13" fontWeight="700">
                    {id}
                  </text>
                  {sz != null && (
                    <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="10" fill="#37474f">
                      sz={sz}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
          {frame.msg}
        </Typography>
      </CEBlock.Section>

      <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
    </CEBlock>
  );
}

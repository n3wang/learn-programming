import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/**
 * Tiny offline dynamic connectivity demo.
 * Timeline T=4 leaves: times 0..3
 * Edge A: (0-1) alive [0, 3)  → covers most of the tree
 * Edge B: (1-2) alive [1, 2)  → only mid leaves
 * Queries at each leaf ask #components on 3 vertices {0,1,2}
 */

const VERTICES = 3;

const LEGEND = [
  {key: 'A', label: 'Add / enter', color: '#4fc3f7', desc: 'Unite edges stored on this segtree node'},
  {key: 'Q', label: 'Query leaf', color: '#81c784', desc: 'Answer #components at this time'},
  {key: 'R', label: 'Rollback', color: '#ef9a9a', desc: 'Undo unites when leaving the node'},
  {key: 'N', label: 'Current node', color: '#ffb74d', desc: 'DFS position in the time segment tree'},
];

// Segment tree nodes over times [0,3]
// ids: 1=[0,3], 2=[0,1], 3=[2,3], 4=[0,0], 5=[1,1], 6=[2,2], 7=[3,3]
const NODES = {
  1: {l: 0, r: 3, x: 200, y: 28, edges: ['A']},
  2: {l: 0, r: 1, x: 100, y: 90, edges: []},
  3: {l: 2, r: 3, x: 300, y: 90, edges: []},
  4: {l: 0, r: 0, x: 50, y: 160, edges: []},
  5: {l: 1, r: 1, x: 150, y: 160, edges: ['B']},
  6: {l: 2, r: 2, x: 250, y: 160, edges: []},
  7: {l: 3, r: 3, x: 350, y: 160, edges: []},
};

const CHILDREN = {1: [2, 3], 2: [4, 5], 3: [6, 7]};

function find(parent, v) {
  while (parent[v] !== v) v = parent[v];
  return v;
}

function unite(parent, rank, comps, u, v, stack) {
  u = find(parent, u);
  v = find(parent, v);
  if (u === v) return false;
  if (rank[u] > rank[v]) [u, v] = [v, u];
  stack.push({u, v, rankU: rank[u], rankV: rank[v], comps});
  parent[u] = v;
  if (rank[u] === rank[v]) rank[v] += 1;
  return true;
}

function rollback(parent, rank, stack) {
  const x = stack.pop();
  parent[x.u] = x.u;
  rank[x.u] = x.rankU;
  rank[x.v] = x.rankV;
  return x.comps;
}

function edgeEndpoints(name) {
  return name === 'A' ? [0, 1] : [1, 2];
}

function buildFrames() {
  const frames = [];
  const parent = [0, 1, 2];
  const rank = [0, 0, 0];
  let comps = VERTICES;
  const stack = [];
  const answers = Array(4).fill(null);
  const path = [];

  function snapshot(msg, extra = {}) {
    frames.push({
      path: [...path],
      comps,
      answers: [...answers],
      stackDepth: stack.length,
      parent: [...parent],
      msg,
      ...extra,
    });
  }

  function dfs(v) {
    const node = NODES[v];
    path.push(v);
    const addedHere = [];
    for (const e of node.edges) {
      const [u, w] = edgeEndpoints(e);
      const before = comps;
      const did = unite(parent, rank, comps, u, w, stack);
      if (did) comps -= 1;
      addedHere.push({e, did, compsBefore: before});
    }
    snapshot(
      `Enter node ${v} covering [${node.l}, ${node.r}]. Add edges [${node.edges.join(', ') || '∅'}]. comps=${comps}.`,
      {phase: 'enter', node: v, addedHere},
    );

    if (node.l === node.r) {
      answers[node.l] = comps;
      snapshot(
        `Leaf time t=${node.l}: query → ${comps} component(s).`,
        {phase: 'query', node: v, queryT: node.l},
      );
    } else {
      for (const c of CHILDREN[v]) dfs(c);
    }

    for (let i = addedHere.length - 1; i >= 0; i -= 1) {
      if (addedHere[i].did) comps = rollback(parent, rank, stack);
    }
    snapshot(
      `Leave node ${v}: rollback ${addedHere.filter((a) => a.did).length} unite(s). comps=${comps}.`,
      {phase: 'leave', node: v},
    );
    path.pop();
  }

  snapshot('Start DFS on the time segment tree. DSU has 3 vertices, 3 components. Edge A lives [0,3); edge B lives [1,1].');
  dfs(1);
  snapshot(`Done. Answers by time: [${answers.join(', ')}].`);
  return frames;
}

export default function OfflineDeletionSimulator() {
  const frames = useMemo(buildFrames, []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];
  const current = frame.node ?? null;

  return (
    <CEBlock
      title="Offline deletion via time segment tree"
      subtitle="DFS add → recurse/query → rollback. Dynamic connectivity on 3 vertices."
      legend={<ColorLegend items={LEGEND} />}
    >
      <CEBlock.Section label="Time segment tree">
        <Box sx={{overflowX: 'auto'}}>
          <svg width="400" height="210" viewBox="0 0 400 210" role="img" aria-label="Segment tree over time">
            {[
              [1, 2],
              [1, 3],
              [2, 4],
              [2, 5],
              [3, 6],
              [3, 7],
            ].map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke="#90a4ae"
                strokeWidth={2}
              />
            ))}
            {Object.entries(NODES).map(([id, n]) => {
              const nid = Number(id);
              const onPath = frame.path.includes(nid);
              const isCur = current === nid;
              let fill = '#eceff1';
              if (isCur) fill = '#ffb74d';
              else if (onPath) fill = '#bbdefb';
              if (frame.phase === 'query' && isCur) fill = '#a5d6a7';
              if (frame.phase === 'leave' && isCur) fill = '#ef9a9a';
              return (
                <g key={id}>
                  <rect
                    x={n.x - 28}
                    y={n.y - 18}
                    width={56}
                    height={36}
                    rx={6}
                    fill={fill}
                    stroke="#37474f"
                    strokeWidth={isCur ? 2.5 : 1.2}
                  />
                  <text x={n.x} y={n.y - 2} textAnchor="middle" fontSize="11" fontWeight="700">
                    [{n.l},{n.r}]
                  </text>
                  <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize="10" fill="#455a64">
                    {n.edges.length ? n.edges.join(',') : '—'}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{mt: 1}}>
          <Chip size="small" label={`comps = ${frame.comps}`} color="primary" />
          <Chip size="small" label={`rollback stack = ${frame.stackDepth}`} variant="outlined" />
          <Chip
            size="small"
            label={`answers: [${frame.answers.map((a) => (a == null ? '?' : a)).join(', ')}]`}
            variant="outlined"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
          {frame.msg}
        </Typography>
      </CEBlock.Section>

      <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
    </CEBlock>
  );
}

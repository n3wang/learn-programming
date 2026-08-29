import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const INF = 99;

const NODES = [
  {id: 0, x: 48, y: 88},
  {id: 1, x: 168, y: 36},
  {id: 2, x: 168, y: 148},
  {id: 3, x: 300, y: 88},
];

const EDGES = [
  {from: 0, to: 1, w: 1},
  {from: 0, to: 2, w: 0},
  {from: 2, to: 1, w: 0},
  {from: 1, to: 3, w: 1},
  {from: 2, to: 3, w: 1},
];

const LEGEND = [
  {key: 'S', label: 'Source / current', color: '#ffb74d', desc: 'Vertex just popped from the front of the deque'},
  {key: 'Q', label: 'In the deque', color: '#4fc3f7', desc: 'Waiting to be processed'},
  {key: '0', label: 'Weight 0 (front)', color: '#81c784', desc: 'Relax with 0 → push_front'},
  {key: '1', label: 'Weight 1 (back)', color: '#ce93d8', desc: 'Relax with 1 → push_back'},
];

function clone(d, q) {
  return {d: [...d], q: [...q]};
}

function buildFrames() {
  const n = NODES.length;
  const adj = Array.from({length: n}, () => []);
  EDGES.forEach((e) => adj[e.from].push(e));

  const d = Array(n).fill(INF);
  d[0] = 0;
  const q = [0];
  const frames = [
    {
      ...clone(d, q),
      current: null,
      edge: null,
      msg: 'Start at source 0. Distance 0. Deque = [0].',
    },
  ];

  while (q.length) {
    const v = q.shift();
    frames.push({
      ...clone(d, q),
      current: v,
      edge: null,
      msg: `Pop front → ${v}. Now relax its edges.`,
    });
    for (const edge of adj[v]) {
      const {to: u, w} = edge;
      if (d[v] + w < d[u]) {
        d[u] = d[v] + w;
        if (w === 1) {
          q.push(u);
        } else {
          q.unshift(u);
        }
        frames.push({
          ...clone(d, q),
          current: v,
          edge,
          msg:
            w === 0
              ? `Edge ${v} → ${u} weight 0: d[${u}] = ${d[u]}. push_front.`
              : `Edge ${v} → ${u} weight 1: d[${u}] = ${d[u]}. push_back.`,
        });
      } else {
        frames.push({
          ...clone(d, q),
          current: v,
          edge,
          msg: `Edge ${v} → ${u} weight ${w}: no better path (d[${u}] = ${d[u] === INF ? '∞' : d[u]}).`,
        });
      }
    }
  }

  frames.push({
    ...clone(d, q),
    current: null,
    edge: null,
    msg: 'Deque empty. Shortest 0-1 distances are final.',
  });
  return frames;
}

function distLabel(x) {
  return x === INF ? '∞' : String(x);
}

function nodeColor(id, frame) {
  if (frame.current === id) {
    return '#ffb74d';
  }
  if (frame.q.includes(id)) {
    return '#4fc3f7';
  }
  if (frame.d[id] !== INF) {
    return '#c8e6c9';
  }
  return '#eceff1';
}

export default function ZeroOneBfsSimulator() {
  const frames = useMemo(buildFrames, []);
  const [step, setStep] = useState(0);
  const frame = frames[step];

  return (
    <CEBlock
      title="0-1 BFS deque"
      subtitle="Step through pops and relaxes. Weight 0 goes to the front; weight 1 goes to the back."
    >
      <CEBlock.Section label="Graph (source = 0)">
        <Box sx={{overflowX: 'auto'}}>
          <svg width="360" height="196" viewBox="0 0 360 196" role="img" aria-label="0-1 BFS graph">
            {EDGES.map((e) => {
              const a = NODES[e.from];
              const b = NODES[e.to];
              const active =
                frame.edge && frame.edge.from === e.from && frame.edge.to === e.to;
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              return (
                <g key={`${e.from}-${e.to}-${e.w}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={active ? (e.w === 0 ? '#81c784' : '#ce93d8') : '#90a4ae'}
                    strokeWidth={active ? 4 : 2}
                    markerEnd="url(#arrow)"
                  />
                  <circle cx={mx} cy={my} r="11" fill={e.w === 0 ? '#81c784' : '#ce93d8'} />
                  <text x={mx} y={my + 4} textAnchor="middle" fontSize="11" fontWeight="700">
                    {e.w}
                  </text>
                </g>
              );
            })}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#90a4ae" />
              </marker>
            </defs>
            {NODES.map((n) => (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="20"
                  fill={nodeColor(n.id, frame)}
                  stroke="#37474f"
                  strokeWidth={frame.current === n.id ? 3 : 1.5}
                />
                <text x={n.x} y={n.y - 2} textAnchor="middle" fontSize="13" fontWeight="700">
                  {n.id}
                </text>
                <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize="10" fill="#37474f">
                  d={distLabel(frame.d[n.id])}
                </text>
              </g>
            ))}
          </svg>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="Deque (front → back)">
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" sx={{fontFamily: 'monospace', mr: 0.5}}>
            front
          </Typography>
          {frame.q.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              empty
            </Typography>
          ) : (
            frame.q.map((id, i) => (
              <Box
                key={`${id}-${i}`}
                sx={{
                  minWidth: 36,
                  height: 36,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  backgroundColor: '#4fc3f7',
                  border: '1px solid #0277bd',
                }}>
                {id}
              </Box>
            ))
          )}
          <Typography variant="caption" sx={{fontFamily: 'monospace', ml: 0.5}}>
            back
          </Typography>
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="This step">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Legend">
        <ColorLegend items={LEGEND} />
      </CEBlock.Section>

      <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
    </CEBlock>
  );
}

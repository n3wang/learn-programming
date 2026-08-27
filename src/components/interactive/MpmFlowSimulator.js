import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Tiny network: s=0 → {1,2} → t=3. Max flow = 5. */
const LABELS = ['s', 'a', 'b', 't'];
const POS = [
  [40, 110],
  [160, 50],
  [160, 170],
  [280, 110],
];

const LEGEND = [
  {key: 'R', label: 'Reference node', color: '#ffb74d', desc: 'Minimal potential p(v)'},
  {key: 'L', label: 'Layered arc', color: '#4fc3f7', desc: 'Residual edge with level[u]=level[v]+1'},
  {key: 'S', label: 'Saturated / deleted', color: '#bdbdbd', desc: 'Removed within the phase'},
];

/**
 * Conceptual MPM phase walkthrough (not a full residual sim).
 * Levels: s:0, a:1, b:1, t:2
 * Layered caps: s→a:3, s→b:2, a→b:1, a→t:2, b→t:3
 */
function buildFrames() {
  const frames = [];

  frames.push({
    levels: [0, 1, 1, 2],
    pin: [null, 3, 3, 5],
    pout: [5, 3, 3, null],
    pot: [5, 3, 3, 5],
    ref: null,
    dead: [],
    flow: 0,
    highlightEdges: ['s-a', 's-b', 'a-b', 'a-t', 'b-t'],
    msg: 'Phase: BFS levels on residual graph. Build layered network L (only edges that advance a level toward t).',
  });

  frames.push({
    levels: [0, 1, 1, 2],
    pin: ['∞', 3, 3, 5],
    pout: [5, 3, 3, '∞'],
    pot: [5, 3, 3, 5],
    ref: null,
    dead: [],
    flow: 0,
    highlightEdges: ['s-a', 's-b', 'a-b', 'a-t', 'b-t'],
    msg: 'p_in(v)=Σ residual into v, p_out(v)=Σ residual out of v. Set p_in(s)=p_out(t)=∞. p(v)=min(p_in,p_out).',
  });

  frames.push({
    levels: [0, 1, 1, 2],
    pin: ['∞', 3, 3, 5],
    pout: [5, 3, 3, '∞'],
    pot: [5, 3, 3, 5],
    ref: 1,
    dead: [],
    flow: 0,
    highlightEdges: ['s-a', 's-b', 'a-b', 'a-t', 'b-t'],
    msg: 'Reference node r = argmin p(v). Here a and b both have p=3; pick a. Claim: can push p(r)=3 through r from s to t.',
  });

  frames.push({
    levels: [0, 1, 1, 2],
    pin: ['∞', 0, 2, 3],
    pout: [2, 0, 2, '∞'],
    pot: [2, 0, 2, 3],
    ref: 1,
    dead: [1],
    flow: 3,
    highlightEdges: ['s-b', 'a-b', 'b-t'],
    msg: 'Pull 3 from s into a, push 3 toward t (saturating a’s layered arcs). Delete saturated arcs; remove a (p=0). Total flow += 3.',
  });

  frames.push({
    levels: [0, 1, 1, 2],
    pin: ['∞', 0, 2, 2],
    pout: [2, 0, 2, '∞'],
    pot: [2, 0, 2, 2],
    ref: 2,
    dead: [1],
    flow: 3,
    highlightEdges: ['s-b', 'b-t'],
    msg: 'New reference: b with p=2. Push 2 through b (s→b→t).',
  });

  frames.push({
    levels: [0, 1, 1, 2],
    pin: ['∞', 0, 0, 0],
    pout: [0, 0, 0, '∞'],
    pot: [0, 0, 0, 0],
    ref: 2,
    dead: [1, 2],
    flow: 5,
    highlightEdges: [],
    msg: 'Layered network blocked (no useful residual advancing levels). Phase ends. Flow=5 = max flow on this instance; next BFS would fail.',
  });

  return frames;
}

const EDGE_GEOM = {
  's-a': [POS[0], POS[1]],
  's-b': [POS[0], POS[2]],
  'a-b': [POS[1], POS[2]],
  'a-t': [POS[1], POS[3]],
  'b-t': [POS[2], POS[3]],
};

export default function MpmFlowSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="MPM phase (conceptual)"
      subtitle="Layered network → potentials → reference node → push p(r)."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Layered network">
        <svg width="320" height="220" style={{display: 'block', maxWidth: '100%'}}>
          {Object.entries(EDGE_GEOM).map(([key, [a, b]]) => {
            const on = frame.highlightEdges.includes(key);
            return (
              <line
                key={key}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke={on ? '#4fc3f7' : '#e0e0e0'}
                strokeWidth={on ? 3 : 1.5}
                markerEnd={on ? 'url(#arrow)' : undefined}
              />
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#0288d1" />
            </marker>
          </defs>
          {LABELS.map((lab, i) => {
            const [x, y] = POS[i];
            const isRef = frame.ref === i;
            const dead = frame.dead.includes(i);
            return (
              <g key={lab}>
                <circle
                  cx={x}
                  cy={y}
                  r={isRef ? 22 : 18}
                  fill={dead ? '#eeeeee' : isRef ? '#ffb74d' : '#ede7f6'}
                  stroke={isRef ? '#ef6c00' : '#5e35b1'}
                  strokeWidth={2}
                  opacity={dead ? 0.45 : 1}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#311b92"
                >
                  {lab}
                </text>
                <text x={x} y={y + 34} textAnchor="middle" fontSize="10" fill="#546e7a">
                  L{frame.levels[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </CEBlock.Section>

      <CEBlock.Section label="Potentials">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {LABELS.map((lab, i) => (
            <Box
              key={lab}
              sx={{
                border: '1.5px solid',
                borderColor: frame.ref === i ? '#ef6c00' : '#90a4ae',
                backgroundColor: frame.ref === i ? '#ffe0b2' : '#f5f5f5',
                borderRadius: 1,
                px: 1,
                py: 0.75,
                fontFamily: 'monospace',
                fontSize: 12,
                minWidth: 72,
              }}
            >
              <strong>{lab}</strong>
              <div>pᵢₙ={frame.pin[i] ?? '—'}</div>
              <div>pₒᵤₜ={frame.pout[i] ?? '—'}</div>
              <div>p={frame.pot[i]}</div>
            </Box>
          ))}
        </Stack>
        <Typography variant="body2" sx={{mt: 1, fontFamily: 'monospace'}}>
          flow so far = {frame.flow}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

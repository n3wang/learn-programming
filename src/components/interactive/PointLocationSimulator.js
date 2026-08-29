import React, {useMemo, useState} from 'react';
import Typography from '@site/src/components/ui/Typography';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Simple subdivision: square with a diagonal. Faces: below diag, above diag, outer. */
const EDGES = [
  {id: 'bot', a: [0, 0], b: [4, 0]},
  {id: 'right', a: [4, 0], b: [4, 4]},
  {id: 'top', a: [4, 4], b: [0, 4]},
  {id: 'left', a: [0, 4], b: [0, 0]},
  {id: 'diag', a: [0, 0], b: [4, 4]},
];

const QUERY = {x: 2, y: 1}; // below diagonal

const LEGEND = [
  {key: 'S', label: 'Sweep x', color: '#0288d1', desc: 'Current vertical line'},
  {key: 'A', label: 'Active edges', color: '#2e7d32', desc: 'In set t at this x'},
  {key: 'Q', label: 'Query', color: '#ef6c00', desc: 'Point to locate'},
  {key: 'E', label: 'Answer edge', color: '#c62828', desc: 'Highest edge below / containing q'},
];

const W = 360;
const H = 280;
const PAD = 36;
const X0 = 0;
const X1 = 4;
const Y0 = 0;
const Y1 = 4;

function toSvg(x, y) {
  const sx = (W - 2 * PAD) / (X1 - X0);
  const sy = (H - 2 * PAD) / (Y1 - Y0);
  return [PAD + (x - X0) * sx, H - PAD - (y - Y0) * sy];
}

function buildFrames() {
  const frames = [];
  const xs = [0, 2, 4];

  frames.push({
    x: null,
    active: [],
    answer: null,
    events: [],
    msg: 'Goal: for query q, find the edge that contains q, or the highest edge intersecting x=q.x strictly below q.',
  });

  frames.push({
    x: 0,
    active: [],
    answer: null,
    events: ['VERT left', 'ADD bot', 'ADD diag', 'ADD top'],
    msg: 'x=0: process VERT / ADD. Vertical left goes to vert; non-vertical edges enter active set t.',
  });

  frames.push({
    x: 2,
    active: ['bot', 'diag', 'top'],
    answer: null,
    events: ['GET q'],
    msg: `x=2: GET query (${QUERY.x},${QUERY.y}). Binary-search t (ordered by edge_cmp) for highest edge below q.`,
  });

  frames.push({
    x: 2,
    active: ['bot', 'diag', 'top'],
    answer: 'bot',
    events: ['GET → bot'],
    msg: 'Answer edge = bottom (y=0). Point is above it and below the diagonal → face “below diag”.',
  });

  frames.push({
    x: 4,
    active: ['bot', 'diag', 'top'],
    answer: 'bot',
    events: ['DEL …', 'VERT right'],
    msg: 'x=4: DEL ending edges, VERT right. Sweep done. Offline: all queries answered in O((n+q) log n).',
  });

  return frames;
}

export default function PointLocationSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];
  const [qx, qy] = toSvg(QUERY.x, QUERY.y);

  return (
    <CEBlock
      title="Sweep-line point location"
      subtitle="Find supporting edge under the query, then map to the face above it."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Subdivision">
        <svg width={W} height={H} style={{display: 'block', maxWidth: '100%'}}>
          {EDGES.map((e) => {
            const [x1, y1] = toSvg(e.a[0], e.a[1]);
            const [x2, y2] = toSvg(e.b[0], e.b[1]);
            const active = frame.active.includes(e.id);
            const ans = frame.answer === e.id;
            return (
              <line
                key={e.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={ans ? '#c62828' : active ? '#2e7d32' : '#90a4ae'}
                strokeWidth={ans ? 4 : active ? 3 : 1.5}
              />
            );
          })}
          {frame.x != null && (
            <line
              x1={toSvg(frame.x, Y0)[0]}
              y1={toSvg(frame.x, Y0)[1]}
              x2={toSvg(frame.x, Y1)[0]}
              y2={toSvg(frame.x, Y1)[1]}
              stroke="#0288d1"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          )}
          <circle cx={qx} cy={qy} r={6} fill="#ef6c00" stroke="#bf360c" />
          <text x={qx + 8} y={qy - 6} fontSize="12" fontWeight="700" fill="#e65100">
            q
          </text>
        </svg>
      </CEBlock.Section>

      <CEBlock.Section label="Events at this x">
        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
          {frame.events.length ? frame.events.join(' · ') : '(none)'}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

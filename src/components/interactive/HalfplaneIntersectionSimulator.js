import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/**
 * Demo half-planes (left of directed edge). Sorted by polar angle of pq.
 * Together with a soft bounding box they form a convex polygon.
 */
const HALFPLANES = [
  {id: 'A', p: [0, 0], q: [4, 0], color: '#1976d2'}, // rightward → allow above
  {id: 'B', p: [4, 0], q: [3, 3], color: '#e65100'},
  {id: 'C', p: [3, 3], q: [1, 3.5], color: '#2e7d32'},
  {id: 'D', p: [1, 3.5], q: [0, 0], color: '#6a1b9a'},
];

const LEGEND = [
  {key: 'N', label: 'New half-plane', color: '#ffb74d', desc: 'About to insert (angle order)'},
  {key: 'D', label: 'In deque', color: '#4fc3f7', desc: 'Currently part of the intersection'},
  {key: 'R', label: 'Popped redundant', color: '#ef9a9a', desc: 'Removed from front or back'},
  {key: 'P', label: 'Intersection polygon', color: '#81c784', desc: 'Vertices from adjacent lines'},
];

function angle(hp) {
  const dx = hp.q[0] - hp.p[0];
  const dy = hp.q[1] - hp.p[1];
  return Math.atan2(dy, dx);
}

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function out(hp, r) {
  const pq = sub(hp.q, hp.p);
  return cross(pq, sub(r, hp.p)) < -1e-9;
}

function inter(s, t) {
  const spq = sub(s.q, s.p);
  const tpq = sub(t.q, t.p);
  const alpha = cross(sub(t.p, s.p), tpq) / cross(spq, tpq);
  return [s.p[0] + spq[0] * alpha, s.p[1] + spq[1] * alpha];
}

function polygonFromDeque(dq) {
  if (dq.length < 3) return [];
  const pts = [];
  for (let i = 0; i < dq.length; i += 1) {
    pts.push(inter(dq[i], dq[(i + 1) % dq.length]));
  }
  return pts;
}

function buildFrames() {
  const sorted = [...HALFPLANES].sort((a, b) => angle(a) - angle(b));
  const frames = [];
  const dq = [];

  frames.push({
    dq: [],
    current: null,
    popped: [],
    poly: [],
    msg: 'Sort half-planes by polar angle of direction vector. Insert one-by-one into a deque.',
  });

  for (const hp of sorted) {
    const popped = [];
    // pop back while redundant
    while (dq.length > 1 && out(hp, inter(dq[dq.length - 1], dq[dq.length - 2]))) {
      popped.push(dq.pop().id);
    }
    // pop front while redundant
    while (dq.length > 1 && out(hp, inter(dq[0], dq[1]))) {
      popped.push(dq.shift().id);
    }
    dq.push(hp);
    frames.push({
      dq: [...dq],
      current: hp.id,
      popped: [...popped],
      poly: polygonFromDeque(dq),
      msg:
        popped.length > 0
          ? `Insert ${hp.id}: pop redundant [${popped.join(', ')}] from ends, then push ${hp.id}.`
          : `Insert ${hp.id}: no pops needed. Deque = [${dq.map((h) => h.id).join(', ')}].`,
    });
  }

  const poly = polygonFromDeque(dq);
  frames.push({
    dq: [...dq],
    current: null,
    popped: [],
    poly,
    msg: `Done. Final deque [${dq.map((h) => h.id).join(', ')}] → ${poly.length} polygon vertices.`,
  });
  return frames;
}

const W = 420;
const H = 280;
const PAD = 28;

function toSvg([x, y], xs, ys) {
  const [xmin, xmax] = xs;
  const [ymin, ymax] = ys;
  const sx = PAD + ((x - xmin) / (xmax - xmin)) * (W - 2 * PAD);
  const sy = H - PAD - ((y - ymin) / (ymax - ymin)) * (H - 2 * PAD);
  return [sx, sy];
}

function lineClip(hp, xs, ys) {
  // Extend segment a bit for drawing
  const dx = hp.q[0] - hp.p[0];
  const dy = hp.q[1] - hp.p[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const a = [hp.p[0] - ux * 2, hp.p[1] - uy * 2];
  const b = [hp.q[0] + ux * 2, hp.q[1] + uy * 2];
  return [toSvg(a, xs, ys), toSvg(b, xs, ys)];
}

export default function HalfplaneIntersectionSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const xs = [-0.5, 4.5];
  const ys = [-0.5, 4.2];
  const inDeque = new Set(frame.dq.map((h) => h.id));

  return (
    <CEBlock
      title="Sort-and-Incremental half-plane intersection"
      subtitle="Angle-sorted insert; only pop front/back of the deque."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Plane">
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <svg width={W} height={H} style={{border: '1px solid #e0e0e0', borderRadius: 8}}>
            {HALFPLANES.map((hp) => {
              const [[x1, y1], [x2, y2]] = lineClip(hp, xs, ys);
              const active = inDeque.has(hp.id) || frame.current === hp.id;
              const isNew = frame.current === hp.id;
              const wasPopped = frame.popped.includes(hp.id);
              return (
                <g key={hp.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      isNew ? '#ffb74d' : wasPopped ? '#ef9a9a' : active ? hp.color : '#bdbdbd'
                    }
                    strokeWidth={isNew || active ? 3 : 1.5}
                    strokeDasharray={wasPopped ? '4 3' : undefined}
                    opacity={active || isNew || wasPopped ? 1 : 0.35}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill={hp.color}
                    fontSize="12"
                    fontWeight="700"
                  >
                    {hp.id}
                  </text>
                </g>
              );
            })}
            {frame.poly.length >= 3 && (
              <polygon
                points={frame.poly.map((p) => toSvg(p, xs, ys).join(',')).join(' ')}
                fill="#81c78455"
                stroke="#2e7d32"
                strokeWidth={2}
              />
            )}
            {frame.poly.map((p, i) => {
              const [sx, sy] = toSvg(p, xs, ys);
              return <circle key={i} cx={sx} cy={sy} r={4} fill="#2e7d32" />;
            })}
          </svg>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="Deque (front → back)">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {frame.dq.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              (empty)
            </Typography>
          )}
          {frame.dq.map((h) => (
            <Box
              key={h.id}
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                bgcolor: '#e3f2fd',
                border: '1px solid #90caf9',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              {h.id}
            </Box>
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

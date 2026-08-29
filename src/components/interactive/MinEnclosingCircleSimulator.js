import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Fixed shuffle order (as if already randomized). */
const PTS = [
  {x: 1, y: 1, label: '0'},
  {x: 5, y: 1, label: '1'},
  {x: 3, y: 4, label: '2'},
  {x: 0, y: 3, label: '3'},
  {x: 6, y: 3, label: '4'},
  {x: 2, y: 0, label: '5'},
];

const LEGEND = [
  {key: 'C', label: 'Current MEC', color: '#4fc3f7', desc: 'Candidate circle (2 or 3 defining pts)'},
  {key: 'N', label: 'New point', color: '#ffb74d', desc: 'Point being tested / forcing rebuild'},
  {key: 'B', label: 'Boundary pts', color: '#81c784', desc: 'Points that define the MEC'},
  {key: 'I', label: 'Inside', color: '#ce93d8', desc: 'Already covered by C'},
];

const W = 380;
const H = 300;
const PAD = 30;

function bounds(pts) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    minX: Math.min(...xs) - 0.5,
    maxX: Math.max(...xs) + 0.5,
    minY: Math.min(...ys) - 0.5,
    maxY: Math.max(...ys) + 0.5,
  };
}

function toSvg(p, b) {
  const sx = (W - 2 * PAD) / (b.maxX - b.minX);
  const sy = (H - 2 * PAD) / (b.maxY - b.minY);
  const s = Math.min(sx, sy);
  return [
    PAD + (p.x - b.minX) * s,
    H - PAD - (p.y - b.minY) * s,
    s,
  ];
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function circleFrom2(a, b) {
  return {
    cx: (a.x + b.x) / 2,
    cy: (a.y + b.y) / 2,
    r: dist(a, b) / 2,
    def: [a, b],
  };
}

function circleFrom3(a, b, c) {
  const D =
    2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(D) < 1e-9) return circleFrom2(a, b);
  const a2 = a.x * a.x + a.y * a.y;
  const b2 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;
  const cx = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / D;
  const cy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / D;
  return {cx, cy, r: Math.hypot(cx - a.x, cy - a.y), def: [a, b, c]};
}

function inside(C, p) {
  return Math.hypot(p.x - C.cx, p.y - C.cy) <= C.r + 1e-9;
}

function buildFrames() {
  const frames = [];
  const p = PTS;
  const n = p.length;
  let C = circleFrom2(p[0], p[1]);

  frames.push({
    C,
    i: 1,
    j: null,
    k: null,
    msg: 'After shuffle: start with C = mec(p0,p1) — diameter circle.',
  });

  for (let i = 0; i < n; i += 1) {
    frames.push({
      C: {...C},
      i,
      j: null,
      k: null,
      msg: `Outer i=${i}: is p${i} inside C? ${inside(C, p[i]) ? 'yes → keep C' : 'no → rebuild with pᵢ on boundary'}.`,
    });
    if (!inside(C, p[i])) {
      C = circleFrom2(p[i], p[0]);
      frames.push({
        C: {...C},
        i,
        j: 0,
        k: null,
        msg: `C ← mec(p${i}, p0). Inner j-loop: circles through p${i}.`,
      });
      for (let j = 0; j < i; j += 1) {
        frames.push({
          C: {...C},
          i,
          j,
          k: null,
          msg: `j=${j}: p${j} inside C (through p${i})? ${inside(C, p[j]) ? 'yes' : 'no → mec(pᵢ,pⱼ)'}`,
        });
        if (!inside(C, p[j])) {
          C = circleFrom2(p[i], p[j]);
          frames.push({
            C: {...C},
            i,
            j,
            k: null,
            msg: `C ← mec(p${i}, p${j}). Innermost k-loop (≤2 “unlucky” j in expectation).`,
          });
          for (let k = 0; k < j; k += 1) {
            frames.push({
              C: {...C},
              i,
              j,
              k,
              msg: `k=${k}: p${k} inside? ${inside(C, p[k]) ? 'yes' : 'no → circumcircle of pᵢ,pⱼ,pₖ'}`,
            });
            if (!inside(C, p[k])) {
              C = circleFrom3(p[i], p[j], p[k]);
              frames.push({
                C: {...C},
                i,
                j,
                k,
                msg: `C ← mec(p${i}, p${j}, p${k}).`,
              });
            }
          }
        }
      }
    }
  }

  frames.push({
    C: {...C},
    i: null,
    j: null,
    k: null,
    msg: `Done. Unique MEC radius ≈ ${C.r.toFixed(3)}. Boundary defined by ${C.def.length} points.`,
  });

  return frames;
}

export default function MinEnclosingCircleSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];
  const b = useMemo(() => bounds(PTS), []);
  const [, , scale] = toSvg({x: 0, y: 0}, b);
  const [ccx, ccy] = toSvg({x: frame.C.cx, y: frame.C.cy}, b);

  return (
    <CEBlock
      title="Welzl’s algorithm (fixed shuffle)"
      subtitle="Nested rebuilds when a point falls outside the current MEC."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Points & candidate circle">
        <svg width={W} height={H} style={{display: 'block', maxWidth: '100%'}}>
          <circle
            cx={ccx}
            cy={ccy}
            r={frame.C.r * scale}
            fill="#4fc3f733"
            stroke="#0288d1"
            strokeWidth={2}
          />
          {PTS.map((p, idx) => {
            const [x, y] = toSvg(p, b);
            const onDef = frame.C.def.some((d) => d.x === p.x && d.y === p.y);
            const isNew = frame.i === idx || frame.j === idx || frame.k === idx;
            const inn = inside(frame.C, p);
            let fill = '#ce93d8';
            if (onDef) fill = '#81c784';
            if (isNew) fill = '#ffb74d';
            if (!inn && !onDef) fill = '#ef9a9a';
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r={7} fill={fill} stroke="#37474f" />
                <text x={x + 9} y={y - 8} fontSize="11" fontWeight="700" fill="#455a64">
                  {idx}
                </text>
              </g>
            );
          })}
        </svg>
      </CEBlock.Section>

      <CEBlock.Section label="State">
        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
          r≈{frame.C.r.toFixed(3)} · center≈({frame.C.cx.toFixed(2)}, {frame.C.cy.toFixed(2)}) ·
          def={frame.C.def.length} pts
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

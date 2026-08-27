import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Lines added with increasing slopes (classic CHT setup). */
const LINES = [
  {k: -3, b: 10, label: 'y = −3x + 10'},
  {k: -1, b: 6, label: 'y = −x + 6'},
  {k: 0, b: 4, label: 'y = 4'},
  {k: 1, b: 2, label: 'y = x + 2'},
  {k: 2, b: 1, label: 'y = 2x + 1'},
];

const QUERY_XS = [0, 1, 2, 3, 4, 5];

const LEGEND = [
  {key: 'H', label: 'On hull', color: '#4fc3f7', desc: 'Line currently on the lower envelope'},
  {key: 'N', label: 'New line', color: '#ffb74d', desc: 'Line being inserted'},
  {key: 'D', label: 'Dropped', color: '#ef9a9a', desc: 'Popped — not on lower hull'},
  {key: 'Q', label: 'Query x', color: '#81c784', desc: 'Vertical line where we evaluate min'},
];

function cross(o, a, b) {
  // (a - o) × (b - o) for points (k,b)
  return (a.k - o.k) * (b.b - o.b) - (a.b - o.b) * (b.k - o.k);
}

function buildHull(lines) {
  const hull = [];
  for (const line of lines) {
    while (
      hull.length >= 2 &&
      cross(hull[hull.length - 2], hull[hull.length - 1], line) <= 0
    ) {
      hull.pop();
    }
    hull.push(line);
  }
  return hull;
}

function evalLine(line, x) {
  return line.k * x + line.b;
}

function queryHull(hull, x) {
  if (!hull.length) return null;
  let best = hull[0];
  let bestVal = evalLine(best, x);
  for (let i = 1; i < hull.length; i += 1) {
    const v = evalLine(hull[i], x);
    if (v < bestVal) {
      bestVal = v;
      best = hull[i];
    }
  }
  return {line: best, value: bestVal};
}

function buildFrames() {
  const frames = [];
  frames.push({
    added: 0,
    hull: [],
    dropped: [],
    queryX: null,
    msg: 'Start empty. We add lines with non-decreasing slopes k and keep the lower envelope.',
  });

  for (let i = 0; i < LINES.length; i += 1) {
    const added = LINES.slice(0, i + 1);
    const prevHull = buildHull(LINES.slice(0, i));
    const hull = buildHull(added);
    const dropped = prevHull.filter((l) => !hull.includes(l) && l !== LINES[i]);
    // also mark lines that were in added but not on new hull except current
    const notOnHull = added.filter((l) => !hull.includes(l));

    frames.push({
      added: i + 1,
      hull,
      dropped: notOnHull,
      newLine: LINES[i],
      queryX: null,
      msg: `Add ${LINES[i].label}. Pop while last turn is not CCW (keep lower hull). Hull size = ${hull.length}.`,
    });
  }

  for (const x of QUERY_XS) {
    const hull = buildHull(LINES);
    const ans = queryHull(hull, x);
    frames.push({
      added: LINES.length,
      hull,
      dropped: LINES.filter((l) => !hull.includes(l)),
      newLine: null,
      queryX: x,
      answer: ans,
      msg: `Query x = ${x}: min is ${ans.value} from ${ans.line.label} (binary-search normals on the hull).`,
    });
  }

  return frames;
}

const W = 420;
const H = 240;
const X_MIN = -0.5;
const X_MAX = 5.5;
const Y_MIN = -6;
const Y_MAX = 12;

function toSvg(x, y) {
  const sx = ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 40) + 20;
  const sy = H - 20 - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 40);
  return [sx, sy];
}

export default function ConvexHullTrickSimulator() {
  const frames = useMemo(buildFrames, []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];
  const visible = LINES.slice(0, frame.added);

  return (
    <CEBlock
      title="Convex hull trick"
      subtitle="Insert lines with increasing slope; query min kx+b at x. Lower envelope stays convex."
      legend={<ColorLegend items={LEGEND} />}
    >
      <CEBlock.Section label="Lines on the plane">
        <Box sx={{overflowX: 'auto'}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="CHT lower hull">
            {/* axes */}
            <line
              x1={toSvg(X_MIN, 0)[0]}
              y1={toSvg(X_MIN, 0)[1]}
              x2={toSvg(X_MAX, 0)[0]}
              y2={toSvg(X_MAX, 0)[1]}
              stroke="#b0bec5"
            />
            <line
              x1={toSvg(0, Y_MIN)[0]}
              y1={toSvg(0, Y_MIN)[1]}
              x2={toSvg(0, Y_MAX)[0]}
              y2={toSvg(0, Y_MAX)[1]}
              stroke="#b0bec5"
            />

            {visible.map((line) => {
              const onHull = frame.hull.includes(line);
              const isNew = frame.newLine === line;
              const dropped = frame.dropped.includes(line);
              let stroke = '#90a4ae';
              let width = 1.5;
              if (isNew) {
                stroke = '#ff9800';
                width = 3;
              } else if (onHull) {
                stroke = '#0288d1';
                width = 2.5;
              } else if (dropped) {
                stroke = '#e57373';
                width = 1;
              }
              const [x1, y1] = toSvg(X_MIN, evalLine(line, X_MIN));
              const [x2, y2] = toSvg(X_MAX, evalLine(line, X_MAX));
              return (
                <line
                  key={line.label}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={width}
                  strokeDasharray={dropped ? '4 3' : undefined}
                  opacity={dropped ? 0.5 : 1}
                />
              );
            })}

            {frame.queryX != null && (
              <>
                <line
                  x1={toSvg(frame.queryX, Y_MIN)[0]}
                  y1={toSvg(frame.queryX, Y_MIN)[1]}
                  x2={toSvg(frame.queryX, Y_MAX)[0]}
                  y2={toSvg(frame.queryX, Y_MAX)[1]}
                  stroke="#43a047"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
                {frame.answer && (
                  <circle
                    cx={toSvg(frame.queryX, frame.answer.value)[0]}
                    cy={toSvg(frame.queryX, frame.answer.value)[1]}
                    r={5}
                    fill="#43a047"
                  />
                )}
              </>
            )}
          </svg>
        </Box>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mt: 1}}>
          {visible.map((line) => {
            const onHull = frame.hull.includes(line);
            return (
              <Chip
                key={line.label}
                size="small"
                label={line.label}
                color={onHull ? 'primary' : 'default'}
                variant={onHull ? 'filled' : 'outlined'}
              />
            );
          })}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
          {frame.msg}
        </Typography>
      </CEBlock.Section>

      <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
    </CEBlock>
  );
}

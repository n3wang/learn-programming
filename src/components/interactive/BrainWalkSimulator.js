import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Brain-style diffusion: many colored 2D walks, optional circular obstacles
 * that either block (stop) or bounce (reflect by rejecting the step).
 */
export default function BrainWalkSimulator({compact, embedded, refNote} = {}) {
  const [steps, setSteps] = useState(400);
  const [walks, setWalks] = useState(24);
  const [mode, setMode] = useState(0); // 0 free, 1 stop, 2 bounce
  const [seed, setSeed] = useState(5);

  const {paths, obstacles, Rrms, freeRrms} = useMemo(() => {
    const obs = placeObstacles(seed, 14);
    const colors = ['#c62828', '#1565c0', '#2e7d32', '#6a1b9a', '#ef6c00', '#00838f'];
    const paths = [];
    let sumR2 = 0;
    let sumFree = 0;
    for (let w = 0; w < walks; w += 1) {
      const free = walk2d(seed + 101 * (w + 1), steps, [], 0);
      sumFree += free.R * free.R;
      const blocked = walk2d(seed + 101 * (w + 1), steps, obs, mode);
      sumR2 += blocked.R * blocked.R;
      paths.push({pts: blocked.pts, color: colors[w % colors.length]});
    }
    return {
      paths,
      obstacles: obs,
      Rrms: Math.sqrt(sumR2 / walks),
      freeRrms: Math.sqrt(sumFree / walks),
    };
  }, [steps, walks, mode, seed]);

  const W = compact ? 280 : 380;
  const H = compact ? 230 : 310;
  const pad = 24;
  const span = Math.max(10, Math.sqrt(steps) * 1.35);
  const toX = (x) => pad + ((x + span) / (2 * span)) * (W - 2 * pad);
  const toY = (y) => pad + ((span - y) / (2 * span)) * (H - 2 * pad);
  const rScale = (W - 2 * pad) / (2 * span);

  const modeLabel = mode === 0 ? 'free' : mode === 1 ? 'stop on hit' : 'bounce (reject step)';

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Multiple 2D walks with optional circular obstacles"
    >
      <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="#fafafa" stroke="var(--ifm-color-emphasis-300)" />
      {mode > 0
        ? obstacles.map((o, i) => (
            <circle
              key={i}
              cx={toX(o.x)}
              cy={toY(o.y)}
              r={o.r * rScale}
              fill="#eceff1"
              stroke="#78909c"
              strokeWidth="1"
            />
          ))
        : null}
      {paths.map((p, wi) =>
        p.pts.slice(0, -1).map((a, i) => {
          const b = p.pts[i + 1];
          return (
            <line
              key={`${wi}-${i}`}
              x1={toX(a.x)}
              y1={toY(a.y)}
              x2={toX(b.x)}
              y2={toY(b.y)}
              stroke={p.color}
              strokeWidth="1.1"
              opacity="0.7"
            />
          );
        }),
      )}
      <circle cx={toX(0)} cy={toY(0)} r={3.5} fill="#212121" />
      <text x={10} y={16} fontSize="11" fill="currentColor">
        {walks} walks · {modeLabel}
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="Diffusion with obstacles"
      subtitle="Many colored walks · free, stop-on-hit, or bounce"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="Walks"
      chart={chart}
      params={[
        {
          key: 'steps',
          label: 'N steps',
          meaning: 'Steps per walk. Free diffusion R_rms grows like √N.',
          min: 100,
          max: 1200,
          step: 50,
          value: steps,
          onChange: setSteps,
          display: String(steps),
        },
        {
          key: 'walks',
          label: 'walks',
          meaning: 'Number of independent trajectories drawn and averaged.',
          min: 6,
          max: 50,
          step: 2,
          value: walks,
          onChange: setWalks,
          display: String(walks),
        },
        {
          key: 'mode',
          label: 'obstacles',
          meaning: '0 = free. 1 = freeze on hit. 2 = reject step (bounce).',
          min: 0,
          max: 2,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeLabel,
        },
        {
          key: 'seed',
          label: 'seed',
          meaning: 'PRNG seed for obstacle placement and walks.',
          min: 1,
          max: 40,
          step: 1,
          value: seed,
          onChange: setSeed,
          display: String(seed),
        },
      ]}
      stats={[
        {label: 'free R_rms', value: freeRrms.toFixed(2)},
        {label: 'mode R_rms', value: Rrms.toFixed(2)},
        {label: '√N', value: Math.sqrt(steps).toFixed(2)},
      ]}
    />
  );
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function placeObstacles(seed, n) {
  const rnd = mulberry32(seed + 999);
  const obs = [];
  for (let i = 0; i < n; i += 1) {
    const ang = rnd() * Math.PI * 2;
    const rad = 3 + rnd() * 14;
    obs.push({
      x: rad * Math.cos(ang),
      y: rad * Math.sin(ang),
      r: 0.8 + rnd() * 1.8,
    });
  }
  return obs;
}

function hitsObstacle(x, y, obs) {
  for (const o of obs) {
    if (Math.hypot(x - o.x, y - o.y) < o.r) return true;
  }
  return false;
}

function walk2d(seed, steps, obs, mode) {
  const rnd = mulberry32(seed);
  const pts = [{x: 0, y: 0}];
  let x = 0;
  let y = 0;
  for (let i = 0; i < steps; i += 1) {
    let dx = rnd() * 2 - 1;
    let dy = rnd() * 2 - 1;
    const L = Math.hypot(dx, dy) || 1;
    dx /= L;
    dy /= L;
    const nx = x + dx;
    const ny = y + dy;
    if (mode === 0 || obs.length === 0) {
      x = nx;
      y = ny;
      pts.push({x, y});
      continue;
    }
    if (hitsObstacle(nx, ny, obs)) {
      if (mode === 1) {
        // stop: freeze at last free point for remaining steps
        pts.push({x, y});
        continue;
      }
      // bounce: reject step (stay put this beat)
      pts.push({x, y});
      continue;
    }
    x = nx;
    y = ny;
    pts.push({x, y});
  }
  return {pts, R: Math.hypot(x, y)};
}

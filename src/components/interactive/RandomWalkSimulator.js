import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * 2D unit-step random walk: pick Δx′,Δy′ in [-1,1], normalize to length 1.
 * Shows one path plus R vs √N theory band from many trials.
 */
export default function RandomWalkSimulator({compact, embedded, refNote} = {}) {
  const [steps, setSteps] = useState(200);
  const [seed, setSeed] = useState(7);
  const [trials, setTrials] = useState(40);

  const {path, R, Rrms, theory} = useMemo(() => {
    const pathPts = walkPath(seed, steps);
    const end = pathPts[pathPts.length - 1];
    const R = Math.hypot(end.x, end.y);
    let sumR2 = 0;
    for (let t = 0; t < trials; t += 1) {
      const p = walkPath(seed + 17 * (t + 1), steps);
      const e = p[p.length - 1];
      sumR2 += e.x * e.x + e.y * e.y;
    }
    const Rrms = Math.sqrt(sumR2 / trials);
    return {path: pathPts, R, Rrms, theory: Math.sqrt(steps)};
  }, [steps, seed, trials]);

  const W = compact ? 280 : 360;
  const H = compact ? 220 : 300;
  const pad = 28;
  const span = Math.max(8, Math.sqrt(steps) * 1.6);
  const toX = (x) => pad + ((x + span) / (2 * span)) * (W - 2 * pad);
  const toY = (y) => pad + ((span - y) / (2 * span)) * (H - 2 * pad);

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="2D random walk path with RMS theory circle"
    >
      <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="none" stroke="var(--ifm-color-emphasis-300)" />
      <line x1={toX(0)} y1={pad} x2={toX(0)} y2={H - pad} stroke="var(--ifm-color-emphasis-300)" strokeDasharray="3 3" />
      <line x1={pad} y1={toY(0)} x2={W - pad} y2={toY(0)} stroke="var(--ifm-color-emphasis-300)" strokeDasharray="3 3" />
      <circle
        cx={toX(0)}
        cy={toY(0)}
        r={theory * ((W - 2 * pad) / (2 * span))}
        fill="none"
        stroke="#2e7d32"
        strokeWidth="1.2"
        opacity="0.55"
      />
      {path.slice(0, -1).map((p, i) => {
        const a = path[i];
        const b = path[i + 1];
        return (
          <line
            key={i}
            x1={toX(a.x)}
            y1={toY(a.y)}
            x2={toX(b.x)}
            y2={toY(b.y)}
            stroke="#1565c0"
            strokeWidth="1.2"
            opacity={0.75}
          />
        );
      })}
      <circle cx={toX(0)} cy={toY(0)} r={3.5} fill="#c62828" />
      <circle cx={toX(path[path.length - 1].x)} cy={toY(path[path.length - 1].y)} r={3.2} fill="#1565c0" />
      <text x={12} y={16} fontSize="11" fill="currentColor">
        green circle ≈ R_rms theory √N · red = start
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="2D random walk"
      subtitle="Unit steps with random direction · R vs √N theory"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="Path"
      chart={chart}
      params={[
        {
          key: 'steps',
          label: 'N steps',
          meaning: 'Length of the walk (theory R_rms scales as √N).',
          min: 20,
          max: 1000,
          step: 10,
          value: steps,
          onChange: setSteps,
          display: String(steps),
        },
        {
          key: 'seed',
          label: 'path seed',
          meaning: 'PRNG seed for the displayed path (trials use offsets).',
          min: 1,
          max: 40,
          step: 1,
          value: seed,
          onChange: setSeed,
          display: String(seed),
        },
        {
          key: 'trials',
          label: 'trials for R_rms',
          meaning: 'How many independent walks feed the empirical ⟨R²⟩½.',
          min: 10,
          max: 120,
          step: 5,
          value: trials,
          onChange: setTrials,
          display: String(trials),
        },
      ]}
      stats={[
        {label: 'this R', value: R.toFixed(2)},
        {label: '⟨R²⟩½', value: Rrms.toFixed(2)},
        {label: '√N', value: theory.toFixed(2)},
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

function walkPath(seed, steps) {
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
    x += dx;
    y += dy;
    pts.push({x, y});
  }
  return pts;
}

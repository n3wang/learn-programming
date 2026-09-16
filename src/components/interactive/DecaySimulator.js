import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Stochastic radioactive decay vs smooth exponential N0 e^{-λt}.
 * Semilog N(t) for one Monte Carlo run; Geiger-like click rate ≈ ΔN.
 */
export default function DecaySimulator({compact, embedded, refNote} = {}) {
  const [N0, setN0] = useState(200);
  const [lambda, setLambda] = useState(0.05);
  const [seed, setSeed] = useState(7);

  const {series, clicks, tEnd} = useMemo(() => simulate(N0, lambda, seed), [N0, lambda, seed]);

  const W = compact ? 280 : 380;
  const H = compact ? 220 : 300;
  const padL = 42;
  const padR = 16;
  const padT = 28;
  const padB = 36;
  const tMax = Math.max(tEnd, 1);
  const yMin = Math.log10(0.5);
  const yMax = Math.log10(Math.max(N0, 1));
  const toX = (t) => padL + (t / tMax) * (W - padL - padR);
  const toY = (n) => {
    const y = Math.log10(Math.max(n, 0.5));
    return padT + ((yMax - y) / (yMax - yMin)) * (H - padT - padB);
  };

  const expPath = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = (i / 40) * tMax;
    const n = N0 * Math.exp(-lambda * t);
    if (n < 0.5) break;
    expPath.push(`${i === 0 ? 'M' : 'L'}${toX(t).toFixed(1)},${toY(n).toFixed(1)}`);
  }

  const stochPath = series
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.N).toFixed(1)}`)
    .join(' ');

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Semilog stochastic decay versus exponential"
    >
      <rect
        x={padL}
        y={padT}
        width={W - padL - padR}
        height={H - padT - padB}
        fill="#fafafa"
        stroke="var(--ifm-color-emphasis-300)"
      />
      <text x={W / 2} y={16} fontSize="12" textAnchor="middle" fill="currentColor">
        ln N vs t (blue stochastic · green exponential)
      </text>
      <path d={expPath.join(' ')} fill="none" stroke="#2e7d32" strokeWidth="1.8" strokeDasharray="4 3" />
      <path d={stochPath} fill="none" stroke="#1565c0" strokeWidth="1.6" />
      {series
        .filter((p) => p.Delta > 0)
        .slice(0, 80)
        .map((p, i) => (
          <circle key={i} cx={toX(p.t)} cy={toY(Math.max(p.N, 0.5))} r={1.6} fill="#c62828" opacity="0.55" />
        ))}
      <text x={W / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="currentColor">
        t (steps of Δt)
      </text>
      <text
        x={12}
        y={H / 2}
        fontSize="11"
        textAnchor="middle"
        fill="currentColor"
        transform={`rotate(-90 12 ${H / 2})`}
      >
        log₁₀ N
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="Radioactive decay"
      subtitle="Monte Carlo N(t) vs mean-field exponential on a semilog plot"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="Semilog N(t)"
      chart={chart}
      params={[
        {
          key: 'N0',
          label: 'N(0)',
          meaning: 'Initial number of nuclei. Large N₀ looks smooth; small N₀ is Geiger-like.',
          min: 20,
          max: 5000,
          step: 20,
          value: N0,
          onChange: setN0,
          display: String(N0),
        },
        {
          key: 'lambda',
          label: 'λ (per Δt)',
          meaning: 'Decay probability per nucleus per time step.',
          min: 0.01,
          max: 0.25,
          step: 0.005,
          value: lambda,
          onChange: setLambda,
          display: lambda.toFixed(3),
        },
        {
          key: 'seed',
          label: 'seed',
          meaning: 'PRNG seed for the Monte Carlo run.',
          min: 1,
          max: 40,
          step: 1,
          value: seed,
          onChange: setSeed,
          display: String(seed),
        },
      ]}
      stats={[
        {label: 'τ = 1/λ', value: `${(1 / lambda).toFixed(1)} Δt`},
        {label: 'clicks', value: String(clicks)},
        {label: 't end', value: String(tEnd)},
      ]}
      note="Large N₀ → smooth almost-straight semilog. Small N₀ → Geiger-like bumps; exponential is only the mean-field limit."
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

function simulate(N0, lambda, seed) {
  const rnd = mulberry32(seed);
  let N = N0;
  let t = 0;
  const series = [{t: 0, N, Delta: 0}];
  let clicks = 0;
  while (N > 0 && t < 5000) {
    let Delta = 0;
    for (let i = 0; i < N; i += 1) {
      if (rnd() < lambda) Delta += 1;
    }
    t += 1;
    N -= Delta;
    clicks += Delta;
    series.push({t, N: Math.max(N, 0), Delta});
  }
  return {series, clicks, tEnd: t};
}

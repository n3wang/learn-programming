import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Self-avoiding lattice walk depositing H/P monomers (protein-fold toy).
 * Energy E = -ε f with f = non-bonded H–H neighbor contacts.
 */
export default function ProteinFoldSimulator({compact, embedded, refNote} = {}) {
  const [maxLen, setMaxLen] = useState(36);
  const [pH, setPH] = useState(0.7);
  const [seed, setSeed] = useState(11);
  const [eps, setEps] = useState(1);

  const {chain, energy, f, trapped} = useMemo(() => fold(seed, maxLen, pH, eps), [seed, maxLen, pH, eps]);

  const W = compact ? 280 : 360;
  const H = compact ? 240 : 320;
  const pad = 28;
  const xs = chain.map((c) => c.x);
  const ys = chain.map((c) => c.y);
  const minX = Math.min(...xs, -2);
  const maxX = Math.max(...xs, 2);
  const minY = Math.min(...ys, -2);
  const maxY = Math.max(...ys, 2);
  const span = Math.max(maxX - minX, maxY - minY, 4);
  const toX = (x) => pad + ((x - minX) / span) * (W - 2 * pad);
  const toY = (y) => pad + ((maxY - y) / span) * (H - 2 * pad);

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Self-avoiding H/P lattice protein fold"
    >
      <rect width="100%" height="100%" fill="#fafafa" />
      {chain.slice(0, -1).map((a, i) => {
        const b = chain[i + 1];
        return (
          <line
            key={`b-${i}`}
            x1={toX(a.x)}
            y1={toY(a.y)}
            x2={toX(b.x)}
            y2={toY(b.y)}
            stroke="#90a4ae"
            strokeWidth="2"
          />
        );
      })}
      {hhContacts(chain).map(([i, j], k) => (
        <line
          key={`hh-${k}`}
          x1={toX(chain[i].x)}
          y1={toY(chain[i].y)}
          x2={toX(chain[j].x)}
          y2={toY(chain[j].y)}
          stroke="#ef6c00"
          strokeWidth="1.4"
          strokeDasharray="3 2"
          opacity="0.85"
        />
      ))}
      {chain.map((c, i) => (
        <circle
          key={i}
          cx={toX(c.x)}
          cy={toY(c.y)}
          r={c.kind === 'H' ? 5.5 : 3.2}
          fill={c.kind === 'H' ? '#1565c0' : '#c62828'}
          stroke="#fff"
          strokeWidth="0.8"
        />
      ))}
      <text x={10} y={18} fontSize="11" fill="currentColor">
        large blue = H · small red = P · dashed = non-bonded H–H
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="HP lattice fold"
      subtitle="Self-avoiding walk · E = −εf from non-bonded H–H contacts"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="Chain"
      chart={chart}
      params={[
        {
          key: 'maxLen',
          label: 'max length',
          meaning: 'Target chain length (may stop early if the tip is trapped).',
          min: 8,
          max: 60,
          step: 1,
          value: maxLen,
          onChange: setMaxLen,
          display: String(maxLen),
        },
        {
          key: 'pH',
          label: 'P(H)',
          meaning: 'Probability each monomer is hydrophobic (H) vs polar (P).',
          min: 0.4,
          max: 0.9,
          step: 0.05,
          value: pH,
          onChange: setPH,
          display: pH.toFixed(2),
        },
        {
          key: 'seed',
          label: 'seed',
          meaning: 'PRNG seed for the self-avoiding growth.',
          min: 1,
          max: 40,
          step: 1,
          value: seed,
          onChange: setSeed,
          display: String(seed),
        },
        {
          key: 'eps',
          label: 'ε',
          meaning: 'Contact energy scale. E = −ε f.',
          min: 0.5,
          max: 3,
          step: 0.5,
          value: eps,
          onChange: setEps,
          display: String(eps),
        },
      ]}
      stats={[
        {label: 'length', value: trapped ? `${chain.length} (trapped)` : String(chain.length)},
        {label: 'f', value: String(f)},
        {label: 'E = −εf', value: energy.toFixed(1)},
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

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function fold(seed, maxLen, pH, eps) {
  const rnd = mulberry32(seed);
  const occ = new Set(['0,0']);
  const chain = [{x: 0, y: 0, kind: rnd() < pH ? 'H' : 'P'}];
  let trapped = false;
  while (chain.length < maxLen) {
    const tip = chain[chain.length - 1];
    const free = DIRS.map(([dx, dy]) => ({x: tip.x + dx, y: tip.y + dy})).filter((p) => !occ.has(`${p.x},${p.y}`));
    if (free.length === 0) {
      trapped = true;
      break;
    }
    const pick = free[Math.floor(rnd() * free.length)];
    occ.add(`${pick.x},${pick.y}`);
    chain.push({x: pick.x, y: pick.y, kind: rnd() < pH ? 'H' : 'P'});
  }
  const f = countF(chain);
  return {chain, f, energy: -eps * f, trapped};
}

function countF(chain) {
  const index = new Map();
  chain.forEach((c, i) => index.set(`${c.x},${c.y}`, i));
  let f = 0;
  const seen = new Set();
  for (let i = 0; i < chain.length; i += 1) {
    if (chain[i].kind !== 'H') continue;
    for (const [dx, dy] of DIRS) {
      const j = index.get(`${chain[i].x + dx},${chain[i].y + dy}`);
      if (j == null || j <= i) continue;
      if (chain[j].kind !== 'H') continue;
      if (Math.abs(i - j) === 1) continue; // bonded along the backbone
      const key = `${i}-${j}`;
      if (seen.has(key)) continue;
      seen.add(key);
      f += 1;
    }
  }
  return f;
}

function hhContacts(chain) {
  const index = new Map();
  chain.forEach((c, i) => index.set(`${c.x},${c.y}`, i));
  const pairs = [];
  const seen = new Set();
  for (let i = 0; i < chain.length; i += 1) {
    if (chain[i].kind !== 'H') continue;
    for (const [dx, dy] of DIRS) {
      const j = index.get(`${chain[i].x + dx},${chain[i].y + dy}`);
      if (j == null || j <= i) continue;
      if (chain[j].kind !== 'H') continue;
      if (Math.abs(i - j) === 1) continue;
      const key = `${i}-${j}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([i, j]);
    }
  }
  return pairs;
}

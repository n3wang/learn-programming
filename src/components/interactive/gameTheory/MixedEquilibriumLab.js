import React, {useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import Bimatrix from './Bimatrix';
import {P1_COLOR, P2_COLOR, NE_COLOR, fmt, fx, btn, note} from './gtCore';

/**
 * 2×2 games: best-response correspondences in (q, p) space, where
 * p = Pr(Player 1 plays the first row), q = Pr(Player 2 plays the first column).
 */
const PRESETS = {
  pennies: {label: 'Matching pennies', rows: ['Heads', 'Tails'], cols: ['Heads', 'Tails'], u: [[[-1, 1], [1, -1]], [[1, -1], [-1, 1]]]},
  bos: {label: 'Battle of the Sexes', rows: ['Opera', 'Football'], cols: ['Opera', 'Football'], u: [[[2, 1], [0, 0]], [[0, 0], [1, 2]]]},
  chicken: {label: 'Hawk–Dove (V = 4, C = 8)', rows: ['Hawk', 'Dove'], cols: ['Hawk', 'Dove'], u: [[[-2, -2], [4, 0]], [[0, 4], [2, 2]]]},
  inspection: {label: 'Customs inspection', rows: ['Inspect', 'Skip'], cols: ['Smuggle', 'Comply'], u: [[[4, -6], [-1, 0]], [[-5, 3], [0, 0]]]},
  pd: {label: 'Prisoners’ Dilemma', rows: ['C', 'D'], cols: ['C', 'D'], u: [[[3, 3], [0, 5]], [[5, 0], [1, 1]]]},
};

function analyse(u) {
  // Player 1 prefers row 0 iff q*u[0][0]+(1-q)*u[0][1] > q*u[1][0]+(1-q)*u[1][1]
  const d1 = (q) => q * (u[0][0][0] - u[1][0][0]) + (1 - q) * (u[0][1][0] - u[1][1][0]);
  // Player 2 prefers col 0 iff p*u[0][0]+(1-p)*u[1][0] > p*u[0][1]+(1-p)*u[1][1] (second coord)
  const d2 = (p) => p * (u[0][0][1] - u[0][1][1]) + (1 - p) * (u[1][0][1] - u[1][1][1]);
  const qStar = (() => {
    const A = d1(1) - d1(0);
    if (Math.abs(A) < 1e-12) return null;
    const q = -d1(0) / A;
    return q > 1e-9 && q < 1 - 1e-9 ? q : null;
  })();
  const pStar = (() => {
    const A = d2(1) - d2(0);
    if (Math.abs(A) < 1e-12) return null;
    const p = -d2(0) / A;
    return p > 1e-9 && p < 1 - 1e-9 ? p : null;
  })();
  return {d1, d2, qStar, pStar};
}

/** Best-response correspondence as polyline points in (x = q, y = p) or (x = q from p). */
function brPolyline1(d1) {
  // P1: for each q, best p ∈ {0,1} or [0,1] at indifference
  const pts = [];
  for (let i = 0; i <= 400; i++) {
    const q = i / 400;
    const v = d1(q);
    pts.push([q, v > 1e-9 ? 1 : v < -1e-9 ? 0 : 0.5]);
  }
  return pts;
}

export default function MixedEquilibriumLab({preset = 'pennies'}) {
  const [key, setKey] = useState(preset);
  const G = PRESETS[key];
  const [p, setP] = useState(0.5);
  const [q, setQ] = useState(0.5);
  const {d1, d2, qStar, pStar} = analyse(G.u);

  const u = G.u;
  const eu1row = (r) => q * u[r][0][0] + (1 - q) * u[r][1][0];
  const eu2col = (c) => p * u[0][c][1] + (1 - p) * u[1][c][1];
  const U1 = p * eu1row(0) + (1 - p) * eu1row(1);
  const U2 = q * eu2col(0) + (1 - q) * eu2col(1);
  const best1 = Math.max(eu1row(0), eu1row(1));
  const best2 = Math.max(eu2col(0), eu2col(1));
  const isNE = best1 - U1 < 1e-6 && best2 - U2 < 1e-6;

  // pure equilibria and mixed
  const eqs = [];
  for (const pp of [0, 1]) {
    for (const qq of [0, 1]) {
      const r = pp === 1 ? 0 : 1;
      const c = qq === 1 ? 0 : 1;
      if (u[r][c][0] >= u[1 - r][c][0] - 1e-9 && u[r][c][1] >= u[r][1 - c][1] - 1e-9) eqs.push([pp, qq]);
    }
  }
  if (qStar !== null && pStar !== null) eqs.push([pStar, qStar]);

  const W = 300;
  const pad = 34;
  const X = (v) => pad + v * (W - 2 * pad);
  const Y = (v) => W - pad - v * (W - 2 * pad);

  // P1 BR: p as function of q (step). Draw as segments.
  const seg1 = brPolyline1(d1).map(([qq, pp]) => `${X(qq)},${Y(pp)}`).join(' ');
  const seg2 = (() => {
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const pp = i / 400;
      const v = d2(pp);
      pts.push([v > 1e-9 ? 1 : v < -1e-9 ? 0 : 0.5, pp]);
    }
    return pts.map(([qq, pp]) => `${X(qq)},${Y(pp)}`).join(' ');
  })();

  return (
    <CEBlock title="Mixed strategies: make the other player indifferent" subtitle="p = Pr(Player 1 plays the top row), q = Pr(Player 2 plays the left column). Equilibria are where the best-response curves cross.">
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6}}>
        {Object.entries(PRESETS).map(([k2, g]) => (
          <button key={k2} type="button" style={btn(key === k2)} onClick={() => setKey(k2)}>
            {g.label}
          </button>
        ))}
      </div>
      <Bimatrix rows={G.rows} cols={G.cols} payoffs={G.u} showBR />
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
        <svg viewBox={`0 0 ${W} ${W}`} style={{flex: '1 1 260px', maxWidth: W}}>
          <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} fill="none" stroke="var(--ifm-color-emphasis-400)" />
          <polyline points={seg1} fill="none" stroke={P1_COLOR} strokeWidth={3} />
          <polyline points={seg2} fill="none" stroke={P2_COLOR} strokeWidth={3} strokeDasharray="6 3" />
          {qStar !== null && <line x1={X(qStar)} y1={Y(0)} x2={X(qStar)} y2={Y(1)} stroke={P1_COLOR} strokeWidth={3} />}
          {pStar !== null && <line x1={X(0)} y1={Y(pStar)} x2={X(1)} y2={Y(pStar)} stroke={P2_COLOR} strokeWidth={3} strokeDasharray="6 3" />}
          {eqs.map(([pp, qq], i) => (
            <circle key={i} cx={X(qq)} cy={Y(pp)} r={7} fill={NE_COLOR} opacity={0.85} />
          ))}
          <circle cx={X(q)} cy={Y(p)} r={5} fill="#eab308" stroke="#000" strokeWidth={0.5} />
          <text x={W / 2} y={W - 6} fontSize="11" textAnchor="middle" fill="var(--ifm-font-color-base)">
            q = Pr({G.cols[0]})
          </text>
          <text x={10} y={W / 2} fontSize="11" textAnchor="middle" transform={`rotate(-90 10 ${W / 2})`} fill="var(--ifm-font-color-base)">
            p = Pr({G.rows[0]})
          </text>
          <text x={pad} y={W - pad + 14} fontSize="10" textAnchor="middle" fill="var(--ifm-font-color-base)">0</text>
          <text x={W - pad} y={W - pad + 14} fontSize="10" textAnchor="middle" fill="var(--ifm-font-color-base)">1</text>
        </svg>
        <div style={{flex: '1 1 260px', fontSize: 14}}>
          <label style={{display: 'block'}}>
            p = <b>{fx(p, 2)}</b> <input type="range" min={0} max={1} step={0.01} value={p} onChange={(e) => setP(Number(e.target.value))} style={{width: 150, verticalAlign: 'middle'}} />
          </label>
          <label style={{display: 'block'}}>
            q = <b>{fx(q, 2)}</b> <input type="range" min={0} max={1} step={0.01} value={q} onChange={(e) => setQ(Number(e.target.value))} style={{width: 150, verticalAlign: 'middle'}} />
          </label>
          <div style={{marginTop: 6, color: P1_COLOR}}>
            P1: {G.rows[0]} → {fx(eu1row(0), 3)}, {G.rows[1]} → {fx(eu1row(1), 3)}; mixing gives {fx(U1, 3)}
          </div>
          <div style={{color: P2_COLOR}}>
            P2: {G.cols[0]} → {fx(eu2col(0), 3)}, {G.cols[1]} → {fx(eu2col(1), 3)}; mixing gives {fx(U2, 3)}
          </div>
          <div style={{marginTop: 6, fontWeight: 700, color: isNE ? NE_COLOR : P2_COLOR}}>
            {isNE ? '✓ This profile is a Nash equilibrium.' : '✗ Not an equilibrium: someone gains by shifting weight to a better pure strategy.'}
          </div>
          <div style={{marginTop: 6}}>
            Equilibria (green dots):{' '}
            {eqs.map(([pp, qq]) => `(p = ${fmt(pp)}, q = ${fmt(qq)})`).join(', ') || 'none'}
          </div>
          {qStar !== null && pStar !== null && (
            <div style={note}>
              Mixed equilibrium: q* = {fmt(qStar)} makes Player 1 indifferent between rows; p* = {fmt(pStar)} makes Player 2 indifferent between columns. Each player’s mix is set
              by the <i>other</i> player’s payoffs.
            </div>
          )}
          <div style={{marginTop: 8}}>
            <button type="button" style={btn(false)} onClick={() => { if (pStar !== null) setP(pStar); if (qStar !== null) setQ(qStar); }}>
              Jump to the mixed equilibrium
            </button>
          </div>
        </div>
      </div>
    </CEBlock>
  );
}

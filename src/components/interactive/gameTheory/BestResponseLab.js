import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, btn, note} from './gtCore';

/**
 * Two-player games with a continuum of strategies.
 * Player 1 picks x (horizontal axis), Player 2 picks y (vertical axis).
 * br1(y, prm) → x, br2(x, prm) → y, ne(prm) → [x*, y*].
 */
const PRESETS = {
  cournot: {
    title: 'Cournot duopoly: best responses and iterated elimination',
    subtitle: 'Price P = a − q₁ − q₂, unit cost c. Each firm’s best output falls as the rival produces more.',
    xLabel: 'q₁',
    yLabel: 'q₂',
    params: [
      {key: 'a', label: 'Demand intercept a', min: 4, max: 20, step: 1, def: 10},
      {key: 'c', label: 'Unit cost c', min: 0, max: 3, step: 0.5, def: 1},
    ],
    domain: (p) => [0, p.a - p.c],
    br1: (y, p) => Math.max(0, (p.a - p.c - y) / 2),
    br2: (x, p) => Math.max(0, (p.a - p.c - x) / 2),
    ne: (p) => [(p.a - p.c) / 3, (p.a - p.c) / 3],
    u1: (x, y, p) => x * (p.a - x - y - p.c),
    u2: (x, y, p) => y * (p.a - x - y - p.c),
    brFormula: 'q₁*(q₂) = max{0, (a − c − q₂)/2}',
  },
  partnership: {
    title: 'Partnership: efforts that reinforce each other',
    subtitle: 'Each partner’s payoff is eᵢ(1 + b·eⱼ) − eᵢ². More effort from the other raises your own best effort (strategic complements).',
    xLabel: 'e₁',
    yLabel: 'e₂',
    params: [{key: 'b', label: 'Complementarity b', min: 0, max: 1.6, step: 0.1, def: 0.8}],
    domain: () => [0, 5],
    br1: (y, p) => Math.min(5, (1 + p.b * y) / 2),
    br2: (x, p) => Math.min(5, (1 + p.b * x) / 2),
    ne: (p) => {
      const e = 1 / (2 - p.b);
      return e <= 5 ? [e, e] : [5, 5];
    },
    u1: (x, y, p) => x * (1 + p.b * y) - x * x,
    u2: (x, y, p) => y * (1 + p.b * x) - y * y,
    brFormula: 'e₁*(e₂) = (1 + b·e₂)/2',
  },
  software: {
    title: 'Software standards: your ideal spec vs compatibility',
    subtitle: 'Developer i pays (xᵢ − θᵢ)² for leaving its ideal spec and (xᵢ − xⱼ)² for incompatibility.',
    xLabel: 'x₁',
    yLabel: 'x₂',
    params: [
      {key: 't1', label: 'Developer 1 ideal θ₁', min: 0, max: 10, step: 0.5, def: 2},
      {key: 't2', label: 'Developer 2 ideal θ₂', min: 0, max: 10, step: 0.5, def: 8},
    ],
    domain: () => [0, 10],
    br1: (y, p) => (p.t1 + y) / 2,
    br2: (x, p) => (p.t2 + x) / 2,
    ne: (p) => [(2 * p.t1 + p.t2) / 3, (p.t1 + 2 * p.t2) / 3],
    u1: (x, y, p) => 100 - (x - p.t1) ** 2 - (x - y) ** 2,
    u2: (x, y, p) => 100 - (y - p.t2) ** 2 - (x - y) ** 2,
    brFormula: 'x₁*(x₂) = (θ₁ + x₂)/2',
  },
  contest: {
    title: 'R&D race (Tullock contest)',
    subtitle: 'Spend x to win a prize V with probability x/(x + y). Spending is lost either way.',
    xLabel: 'x',
    yLabel: 'y',
    params: [{key: 'V', label: 'Prize V', min: 1, max: 20, step: 1, def: 8}],
    domain: (p) => [0, p.V / 2],
    br1: (y, p) => Math.max(0.0001, Math.sqrt(p.V * Math.max(y, 0.0001)) - Math.max(y, 0.0001)),
    br2: (x, p) => Math.max(0.0001, Math.sqrt(p.V * Math.max(x, 0.0001)) - Math.max(x, 0.0001)),
    ne: (p) => [p.V / 4, p.V / 4],
    u1: (x, y, p) => (x + y > 0 ? (p.V * x) / (x + y) : p.V / 2) - x,
    u2: (x, y, p) => (x + y > 0 ? (p.V * y) / (x + y) : p.V / 2) - y,
    brFormula: 'x*(y) = √(V·y) − y',
  },
  bertrand: {
    title: 'Price competition with differentiated products',
    subtitle: 'Demand for firm i is a − pᵢ + b·pⱼ, zero cost. A higher rival price raises your best price (strategic complements).',
    xLabel: 'p₁',
    yLabel: 'p₂',
    params: [
      {key: 'a', label: 'Base demand a', min: 2, max: 12, step: 1, def: 6},
      {key: 'b', label: 'Substitutability b', min: 0, max: 1.5, step: 0.1, def: 0.5},
    ],
    domain: (p) => [0, (p.a / (2 - p.b)) * 2],
    br1: (y, p) => (p.a + p.b * y) / 2,
    br2: (x, p) => (p.a + p.b * x) / 2,
    ne: (p) => [p.a / (2 - p.b), p.a / (2 - p.b)],
    u1: (x, y, p) => x * (p.a - x + p.b * y),
    u2: (x, y, p) => y * (p.a - y + p.b * x),
    brFormula: 'p₁*(p₂) = (a + b·p₂)/2',
  },
};

/** Image of an interval under a function, by dense sampling. */
function imageOf(f, lo, hi) {
  let mn = Infinity;
  let mx = -Infinity;
  for (let i = 0; i <= 200; i++) {
    const v = f(lo + ((hi - lo) * i) / 200);
    mn = Math.min(mn, v);
    mx = Math.max(mx, v);
  }
  return [mn, mx];
}

export default function BestResponseLab({preset = 'cournot'}) {
  const P = PRESETS[preset] || PRESETS.cournot;
  const [prm, setPrm] = useState(() => Object.fromEntries(P.params.map((x) => [x.key, x.def])));
  const [mode, setMode] = useState('dynamics');
  const [start, setStart] = useState(0.1);
  const [steps, setSteps] = useState(0);

  const [lo, hi] = P.domain(prm);
  const ne = P.ne(prm);

  const path = useMemo(() => {
    const pts = [];
    let x = lo + start * (hi - lo);
    let y = P.br2(x, prm);
    pts.push([x, lo]);
    pts.push([x, y]);
    for (let k = 0; k < 40; k++) {
      x = P.br1(y, prm);
      pts.push([x, y]);
      y = P.br2(x, prm);
      pts.push([x, y]);
    }
    return pts;
  }, [P, prm, start, lo, hi]);

  const rounds = useMemo(() => {
    const out = [{x: [lo, hi], y: [lo, hi]}];
    for (let k = 0; k < 12; k++) {
      const prev = out[out.length - 1];
      out.push({
        x: imageOf((y) => P.br1(y, prm), prev.y[0], prev.y[1]),
        y: imageOf((x) => P.br2(x, prm), prev.x[0], prev.x[1]),
      });
    }
    return out;
  }, [P, prm, lo, hi]);

  const W = 360;
  const pad = 36;
  const S = (v) => pad + ((v - lo) / (hi - lo || 1)) * (W - 2 * pad);
  const Yp = (v) => W - pad - ((v - lo) / (hi - lo || 1)) * (W - 2 * pad);
  const samples = Array.from({length: 121}, (_, i) => lo + ((hi - lo) * i) / 120);
  const br1Pts = samples.map((y) => `${S(Math.min(hi, P.br1(y, prm)))},${Yp(y)}`).join(' ');
  const br2Pts = samples.map((x) => `${S(x)},${Yp(Math.min(hi, P.br2(x, prm)))}`).join(' ');
  const shown = path.slice(0, 2 + 2 * steps);
  const box = rounds[Math.min(steps, rounds.length - 1)];

  return (
    <CEBlock title={P.title} subtitle={P.subtitle}>
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
        <div style={{flex: '1 1 240px'}}>
          {P.params.map((x) => (
            <label key={x.key} style={{display: 'block', fontSize: 14, marginBottom: 4}}>
              {x.label} = <b>{prm[x.key]}</b>{' '}
              <input
                type="range"
                min={x.min}
                max={x.max}
                step={x.step}
                value={prm[x.key]}
                onChange={(e) => {
                  setPrm((o) => ({...o, [x.key]: Number(e.target.value)}));
                  setSteps(0);
                }}
                style={{width: 160, verticalAlign: 'middle'}}
              />
            </label>
          ))}
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0'}}>
            <button type="button" style={btn(mode === 'dynamics')} onClick={() => { setMode('dynamics'); setSteps(0); }}>
              Best-response dynamics
            </button>
            <button type="button" style={btn(mode === 'ration')} onClick={() => { setMode('ration'); setSteps(0); }}>
              Iterated elimination
            </button>
          </div>
          {mode === 'dynamics' && (
            <label style={{display: 'block', fontSize: 14}}>
              Player 1 starts at {P.xLabel} = <b>{fx(lo + start * (hi - lo), 2)}</b>{' '}
              <input type="range" min={0} max={1} step={0.01} value={start} onChange={(e) => { setStart(Number(e.target.value)); setSteps(0); }} style={{width: 140, verticalAlign: 'middle'}} />
            </label>
          )}
          <div style={{display: 'flex', gap: 6, marginTop: 6}}>
            <button type="button" style={btn(false)} onClick={() => setSteps((s) => Math.min(s + 1, 12))}>
              Next round
            </button>
            <button type="button" style={btn(false)} onClick={() => setSteps(0)}>
              Reset
            </button>
          </div>
          <div style={{fontSize: 14, marginTop: 8}}>
            <div>
              Best response: <code>{P.brFormula}</code>
            </div>
            <div style={{color: NE_COLOR, fontWeight: 700}}>
              Nash equilibrium: ({fx(ne[0], 3)}, {fx(ne[1], 3)}) · payoffs ({fx(P.u1(ne[0], ne[1], prm), 2)}, {fx(P.u2(ne[0], ne[1], prm), 2)})
            </div>
            {mode === 'dynamics' && steps > 0 && (
              <div>
                After {steps} round{steps > 1 ? 's' : ''}: ({fx(shown[shown.length - 1][0], 3)}, {fx(shown[shown.length - 1][1], 3)})
              </div>
            )}
            {mode === 'ration' && (
              <div>
                Round {steps}: {P.xLabel} ∈ [{fx(box.x[0], 3)}, {fx(box.x[1], 3)}], {P.yLabel} ∈ [{fx(box.y[0], 3)}, {fx(box.y[1], 3)}]
              </div>
            )}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${W}`} style={{flex: '1 1 300px', maxWidth: W}}>
          <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} fill="none" stroke="var(--ifm-color-emphasis-400)" />
          {mode === 'ration' && (
            <rect
              x={S(box.x[0])}
              y={Yp(box.y[1])}
              width={Math.max(2, S(box.x[1]) - S(box.x[0]))}
              height={Math.max(2, Yp(box.y[0]) - Yp(box.y[1]))}
              fill="rgba(234,179,8,0.25)"
              stroke="#ca8a04"
            />
          )}
          <polyline points={br1Pts} fill="none" stroke={P1_COLOR} strokeWidth={2.5} />
          <polyline points={br2Pts} fill="none" stroke={P2_COLOR} strokeWidth={2.5} />
          {mode === 'dynamics' && shown.length > 1 && (
            <polyline points={shown.map(([x, y]) => `${S(x)},${Yp(y)}`).join(' ')} fill="none" stroke="#ca8a04" strokeWidth={1.8} strokeDasharray="4 3" />
          )}
          <circle cx={S(ne[0])} cy={Yp(ne[1])} r={6} fill={NE_COLOR} />
          <text x={W / 2} y={W - 8} textAnchor="middle" fontSize="12" fill="var(--ifm-font-color-base)">
            {P.xLabel} (Player 1)
          </text>
          <text x={12} y={W / 2} fontSize="12" fill="var(--ifm-font-color-base)" transform={`rotate(-90 12 ${W / 2})`} textAnchor="middle">
            {P.yLabel} (Player 2)
          </text>
          <text x={pad + 4} y={pad + 14} fontSize="11" fill={P1_COLOR}>
            — P1’s best response
          </text>
          <text x={pad + 4} y={pad + 28} fontSize="11" fill={P2_COLOR}>
            — P2’s best response
          </text>
          <text x={pad - 4} y={W - pad + 14} fontSize="10" textAnchor="end" fill="var(--ifm-font-color-base)">
            {fx(lo, 0)}
          </text>
          <text x={W - pad} y={W - pad + 14} fontSize="10" textAnchor="middle" fill="var(--ifm-font-color-base)">
            {fx(hi, 1)}
          </text>
        </svg>
      </div>
      <div style={note}>
        {mode === 'dynamics'
          ? 'Each round, Player 1 best-responds to Player 2’s last choice, then Player 2 responds to that. Where the two curves cross, nobody wants to move: the Nash equilibrium.'
          : 'Start with every strategy. Each round keeps only best responses to some surviving strategy of the opponent. The yellow box is what survives — watch whether it shrinks to the equilibrium.'}
      </div>
    </CEBlock>
  );
}

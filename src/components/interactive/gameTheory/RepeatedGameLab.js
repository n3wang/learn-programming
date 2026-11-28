import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, btn, note} from './gtCore';

/** Repeated Prisoners' Dilemma with discounting. R = reward, T = temptation, S = sucker, P = punishment. */
const R = 5;
const T = 7;
const S = 0;
const P = 1;
const stage = (a, b) => (a === 'C' ? (b === 'C' ? [R, R] : [S, T]) : b === 'C' ? [T, S] : [P, P]);

const STRATS = {
  allC: {label: 'Always cooperate', move: () => 'C'},
  allD: {label: 'Always defect', move: () => 'D'},
  grim: {label: 'Grim trigger', move: (me, them) => (them.includes('D') ? 'D' : 'C')},
  tft: {label: 'Tit-for-tat', move: (me, them) => (them.length === 0 ? 'C' : them[them.length - 1])},
  cheat5: {label: 'Grim, but cheat in round 5', move: (me, them, t) => (t === 4 ? 'D' : me.includes('D') || them.includes('D') ? 'D' : 'C')},
};

export default function RepeatedGameLab() {
  const [delta, setDelta] = useState(0.6);
  const [s1, setS1] = useState('cheat5');
  const [s2, setS2] = useState('grim');
  const N = 20;

  const hist = useMemo(() => {
    const a = [];
    const b = [];
    for (let t = 0; t < N; t++) {
      const x = STRATS[s1].move(a, b, t);
      const y = STRATS[s2].move(b, a, t);
      a.push(x);
      b.push(y);
    }
    return {a, b};
  }, [s1, s2]);

  const pv = (who) => {
    let s = 0;
    for (let t = 0; t < 400; t++) {
      const x = t < N ? hist.a[t] : hist.a[N - 1];
      const y = t < N ? hist.b[t] : hist.b[N - 1];
      s += Math.pow(delta, t) * stage(x, y)[who];
    }
    return s;
  };
  const v1 = pv(0);
  const v2 = pv(1);
  const coop = R / (1 - delta);
  const dev = T + (delta * P) / (1 - delta);
  const thr = (T - R) / (T - P);

  const cell = (m, color) => (
    <span
      style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        lineHeight: '18px',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 700,
        margin: 1,
        borderRadius: 3,
        color: '#fff',
        background: m === 'C' ? NE_COLOR : color,
      }}
    >
      {m}
    </span>
  );

  // folk-theorem picture
  const W = 220;
  const pad = 24;
  const X = (u) => pad + (u / 7) * (W - 2 * pad);
  const Y = (u) => W - pad - (u / 7) * (W - 2 * pad);
  const avg1 = (1 - delta) * v1;
  const avg2 = (1 - delta) * v2;

  return (
    <CEBlock title="The repeated Prisoners’ Dilemma" subtitle={`Stage payoffs: both C → ${R} each; both D → ${P} each; D against C → ${T} vs ${S}. Future rounds are discounted by δ.`}>
      <label style={{display: 'block', fontSize: 14}}>
        Discount factor δ = <b>{fx(delta, 2)}</b>{' '}
        <input type="range" min={0} max={0.99} step={0.01} value={delta} onChange={(e) => setDelta(Number(e.target.value))} style={{width: 200, verticalAlign: 'middle'}} />
      </label>
      {[
        ['You', s1, setS1, P1_COLOR],
        ['Opponent', s2, setS2, P2_COLOR],
      ].map(([who, val, set, color]) => (
        <div key={who} style={{display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', margin: '4px 0'}}>
          <b style={{color, minWidth: 70, fontSize: 14}}>{who}</b>
          {Object.entries(STRATS).map(([k, s]) => (
            <button key={k} type="button" style={btn(val === k)} onClick={() => set(k)}>
              {s.label}
            </button>
          ))}
        </div>
      ))}
      <div style={{marginTop: 8, overflowX: 'auto', whiteSpace: 'nowrap'}}>
        <div>
          <span style={{display: 'inline-block', width: 70, fontSize: 12, color: P1_COLOR}}>You</span>
          {hist.a.map((m, i) => (
            <React.Fragment key={i}>{cell(m, P1_COLOR)}</React.Fragment>
          ))}
        </div>
        <div>
          <span style={{display: 'inline-block', width: 70, fontSize: 12, color: P2_COLOR}}>Opponent</span>
          {hist.b.map((m, i) => (
            <React.Fragment key={i}>{cell(m, P2_COLOR)}</React.Fragment>
          ))}
        </div>
        <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-700)', marginLeft: 70}}>rounds 1–{N} (the last moves continue forever)</div>
      </div>
      <div style={{fontSize: 14, marginTop: 6}}>
        Present value: <b style={{color: P1_COLOR}}>you {fx(v1, 2)}</b>, <b style={{color: P2_COLOR}}>opponent {fx(v2, 2)}</b> (always cooperating together would give each {fx(coop, 2)}).
      </div>

      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10}}>
        <div style={{flex: '1 1 260px', fontSize: 14, padding: 8, border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6}}>
          <b>Single-deviation test for grim trigger</b>
          <div>Stay with C forever: R/(1 − δ) = {fx(coop, 2)}</div>
          <div>Deviate once, then punished: T + δP/(1 − δ) = {fx(dev, 2)}</div>
          <div style={{fontWeight: 700, color: coop >= dev - 1e-9 ? NE_COLOR : P2_COLOR}}>
            {coop >= dev - 1e-9 ? '✓ Cooperation is sustainable' : '✗ Cheating pays — cooperation collapses'} (need δ ≥ (T − R)/(T − P) = {fx(thr, 3)})
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${W}`} style={{flex: '0 1 220px', maxWidth: W}}>
          <polygon points={[[R, R], [T, S], [P, P], [S, T]].map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')} fill="rgba(37,99,235,0.12)" stroke={P1_COLOR} />
          <polygon
            points={[[P, P], [6.6, P], [R, R], [P, 6.6]].map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')}
            fill="rgba(22,163,74,0.18)"
            stroke="none"
          />
          <line x1={X(P)} y1={Y(0)} x2={X(P)} y2={Y(7)} stroke="var(--ifm-color-emphasis-500)" strokeDasharray="3 3" />
          <line x1={X(0)} y1={Y(P)} x2={X(7)} y2={Y(P)} stroke="var(--ifm-color-emphasis-500)" strokeDasharray="3 3" />
          <circle cx={X(avg1)} cy={Y(avg2)} r={5} fill="#eab308" stroke="#000" strokeWidth={0.5} />
          <text x={W / 2} y={W - 4} fontSize="10" textAnchor="middle" fill="var(--ifm-font-color-base)">your average payoff</text>
          <text x={X(R) + 4} y={Y(R) - 4} fontSize="10" fill="var(--ifm-font-color-base)">(5,5)</text>
        </svg>
      </div>
      <div style={note}>
        Blue: feasible average payoffs. Green: feasible and above each player’s minmax payoff of {P}. The folk theorem says every green point is an equilibrium outcome when δ is close
        enough to 1. Yellow dot: the average payoffs, (1 − δ) × present value, of the profile above.
      </div>
    </CEBlock>
  );
}

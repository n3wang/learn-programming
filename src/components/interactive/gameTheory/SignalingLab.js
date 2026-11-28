import React, {useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, btn, note} from './gtCore';

/**
 * Job-market signaling. Worker productivity θ ∈ {θL, θH}; education e costs e/θ.
 * Firms pay expected productivity given beliefs. Off-path beliefs: any other e ⇒ low type.
 */
function Bayes() {
  const [prior, setPrior] = useState(0.3);
  const [pH, setPH] = useState(0.9);
  const [pL, setPL] = useState(0.2);
  const post = (prior * pH) / (prior * pH + (1 - prior) * pL || 1);
  return (
    <div style={{padding: 8, border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6, marginTop: 10}}>
      <b>Bayes’ rule calculator</b>
      {[
        ['Prior Pr(high type)', prior, setPrior],
        ['Pr(signal | high)', pH, setPH],
        ['Pr(signal | low)', pL, setPL],
      ].map(([l, v, s]) => (
        <label key={l} style={{display: 'block', fontSize: 14}}>
          {l} = <b>{fx(v, 2)}</b> <input type="range" min={0} max={1} step={0.01} value={v} onChange={(e) => s(Number(e.target.value))} style={{width: 150, verticalAlign: 'middle'}} />
        </label>
      ))}
      <div style={{fontSize: 14}}>
        Pr(high | signal) = {fx(prior, 2)}·{fx(pH, 2)} / ({fx(prior, 2)}·{fx(pH, 2)} + {fx(1 - prior, 2)}·{fx(pL, 2)}) = <b style={{color: NE_COLOR}}>{fx(post, 4)}</b>
      </div>
      <div style={note}>If only one type ever sends the signal, the posterior jumps to 0 or 1. If a signal is never sent, Bayes’ rule is silent — beliefs there must be chosen, and they matter.</div>
    </div>
  );
}

export default function SignalingLab() {
  const [tL, setTL] = useState(1);
  const [tH, setTH] = useState(2);
  const [p, setP] = useState(0.5);
  const [kind, setKind] = useState('separating');
  const [e, setE] = useState(1.5);

  const gap = tH - tL;
  const sepLo = tL * gap;
  const sepHi = tH * gap;
  const wbar = p * tH + (1 - p) * tL;
  const poolHi = tL * p * gap;

  let rowsOut;
  if (kind === 'separating') {
    const uHigh = tH - e / tH;
    const uHighDev = tL;
    const uLow = tL;
    const uLowDev = tH - e / tL;
    rowsOut = [
      {who: 'High type gets education e', eq: uHigh, dev: uHighDev, devLabel: 'skip school, paid θL', ok: uHigh >= uHighDev - 1e-9},
      {who: 'Low type skips school', eq: uLow, dev: uLowDev, devLabel: 'mimic: get e, paid θH', ok: uLow >= uLowDev - 1e-9},
    ];
  } else {
    const uH = wbar - e / tH;
    const uL = wbar - e / tL;
    rowsOut = [
      {who: 'High type pools at e', eq: uH, dev: tL, devLabel: 'deviate to e = 0, believed low', ok: uH >= tL - 1e-9},
      {who: 'Low type pools at e', eq: uL, dev: tL, devLabel: 'deviate to e = 0, believed low', ok: uL >= tL - 1e-9},
    ];
  }
  const allOk = rowsOut.every((r) => r.ok);

  return (
    <CEBlock title="Signaling: education as a costly message" subtitle="Firms cannot see productivity, only education. Education doesn’t raise productivity here — it costs the able less, so it can reveal who is who.">
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
        <div style={{flex: '1 1 260px'}}>
          {[
            ['Low productivity θL', tL, setTL, 0.5, 3, 0.5],
            ['High productivity θH', tH, setTH, 1, 5, 0.5],
            ['Share of high types p', p, setP, 0.05, 0.95, 0.05],
          ].map(([l, v, s, mn, mx, st]) => (
            <label key={l} style={{display: 'block', fontSize: 14}}>
              {l} = <b>{fx(v, 2)}</b> <input type="range" min={mn} max={mx} step={st} value={v} onChange={(ev) => s(Number(ev.target.value))} style={{width: 140, verticalAlign: 'middle'}} />
            </label>
          ))}
        </div>
        <div style={{flex: '1 1 260px'}}>
          <div style={{display: 'flex', gap: 6, marginBottom: 6}}>
            <button type="button" style={btn(kind === 'separating')} onClick={() => setKind('separating')}>
              Separating
            </button>
            <button type="button" style={btn(kind === 'pooling')} onClick={() => setKind('pooling')}>
              Pooling
            </button>
          </div>
          <label style={{display: 'block', fontSize: 14}}>
            Education level e = <b>{fx(e, 2)}</b> <input type="range" min={0} max={Math.max(4, sepHi + 1)} step={0.05} value={e} onChange={(ev) => setE(Number(ev.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
          </label>
          <div style={{fontSize: 13, marginTop: 4}}>
            {kind === 'separating'
              ? `Beliefs: e ⇒ high (wage ${fx(tH, 2)}); anything else ⇒ low (wage ${fx(tL, 2)}).`
              : `Beliefs: e ⇒ prior mix (wage ${fx(wbar, 2)}); anything else ⇒ low (wage ${fx(tL, 2)}).`}
          </div>
        </div>
      </div>
      <table style={{fontSize: 14, borderCollapse: 'collapse', display: 'table', marginTop: 8}}>
        <thead>
          <tr>
            <th style={{padding: '3px 8px', textAlign: 'left'}}>Incentive check</th>
            <th style={{padding: '3px 8px'}}>Equilibrium payoff</th>
            <th style={{padding: '3px 8px'}}>Best deviation</th>
            <th style={{padding: '3px 8px'}} />
          </tr>
        </thead>
        <tbody>
          {rowsOut.map((r) => (
            <tr key={r.who}>
              <td style={{padding: '3px 8px'}}>{r.who}</td>
              <td style={{padding: '3px 8px', textAlign: 'right'}}>{fx(r.eq, 3)}</td>
              <td style={{padding: '3px 8px', textAlign: 'right'}}>
                {fx(r.dev, 3)} <span style={{fontSize: 12, color: 'var(--ifm-color-emphasis-700)'}}>({r.devLabel})</span>
              </td>
              <td style={{padding: '3px 8px', color: r.ok ? NE_COLOR : P2_COLOR, fontWeight: 700}}>{r.ok ? '✓' : '✗'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{fontWeight: 700, fontSize: 14, marginTop: 6, color: allOk ? NE_COLOR : P2_COLOR}}>
        {allOk ? `✓ A ${kind} equilibrium at e = ${fx(e, 2)}.` : `✗ Not an equilibrium at e = ${fx(e, 2)}.`}
      </div>
      <div style={{fontSize: 14}}>
        {kind === 'separating'
          ? <>Separating levels: <span style={{color: P1_COLOR}}>θL(θH − θL) = {fx(sepLo, 2)}</span> ≤ e ≤ <span style={{color: P2_COLOR}}>θH(θH − θL) = {fx(sepHi, 2)}</span>. The cheapest, e = {fx(sepLo, 2)}, wastes least.</>
          : <>Pooling levels: 0 ≤ e ≤ θL·p·(θH − θL) = {fx(poolHi, 2)} (the low type’s constraint binds).</>}
      </div>
      <Bayes />
    </CEBlock>
  );
}

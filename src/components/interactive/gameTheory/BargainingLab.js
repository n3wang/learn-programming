import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, btn, note} from './gtCore';

/**
 * Alternating offers over a pie of size 1. Player 1 proposes in odd rounds,
 * Player 2 in even rounds. A share received in round t is worth δᵢ^(t−1).
 * If round T ends without agreement, both get 0.
 */
export default function BargainingLab({infinite = false}) {
  const [T, setT] = useState(4);
  const [d1, setD1] = useState(0.9);
  const [d2, setD2] = useState(0.8);
  const [inf, setInf] = useState(infinite);
  const [myShare, setMyShare] = useState(0.7);
  const [tried, setTried] = useState(null);

  // proposer's share (in that round's money) when round t is reached, backward from T
  const table = useMemo(() => {
    const rows = [];
    let next = null; // proposer share at t+1
    for (let t = T; t >= 1; t--) {
      const proposer = t % 2 === 1 ? 1 : 2;
      const dResp = proposer === 1 ? d2 : d1;
      const respValue = next === null ? 0 : dResp * next; // responder's value of rejecting
      const s = 1 - respValue;
      rows.unshift({t, proposer, keep: s, give: respValue});
      next = s;
    }
    return rows;
  }, [T, d1, d2]);

  const rub = (1 - d2) / (1 - d1 * d2);
  const r1 = inf ? {keep: rub, give: 1 - rub} : table[0];
  const p2Reject = inf ? d2 * ((1 - d1) / (1 - d1 * d2)) : table.length > 1 ? d2 * table[1].keep : 0;

  const tryOffer = () => {
    const give = 1 - myShare;
    setTried({accepted: give >= p2Reject - 1e-9, give});
  };

  const slider = (label, val, set, min, max, step) => (
    <label style={{display: 'block', fontSize: 14, marginBottom: 4}}>
      {label} = <b>{step < 1 ? fx(val, 2) : val}</b>{' '}
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => { set(Number(e.target.value)); setTried(null); }} style={{width: 170, verticalAlign: 'middle'}} />
    </label>
  );

  return (
    <CEBlock title="Alternating-offer bargaining" subtitle="Split a pie of 1. Player 1 offers first; if rejected, Player 2 counter-offers next round, and so on. Waiting shrinks the pie by each player’s discount factor.">
      {slider('Player 1 patience δ₁', d1, setD1, 0, 0.99, 0.01)}
      {slider('Player 2 patience δ₂', d2, setD2, 0, 0.99, 0.01)}
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0'}}>
        <button type="button" style={btn(!inf)} onClick={() => { setInf(false); setTried(null); }}>
          Finite deadline
        </button>
        <button type="button" style={btn(inf)} onClick={() => { setInf(true); setTried(null); }}>
          No deadline (infinite horizon)
        </button>
      </div>
      {!inf && slider('Number of rounds T', T, setT, 1, 12, 1)}

      {!inf ? (
        <div style={{overflowX: 'auto'}}>
          <table style={{fontSize: 14, borderCollapse: 'collapse', display: 'table'}}>
            <thead>
              <tr>
                <th style={{padding: '3px 8px'}}>Round</th>
                <th style={{padding: '3px 8px'}}>Proposer</th>
                <th style={{padding: '3px 8px'}}>Responder accepts if offered at least</th>
                <th style={{padding: '3px 8px'}}>Proposer keeps</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.t} style={{background: r.t === 1 ? 'rgba(22,163,74,0.12)' : 'transparent'}}>
                  <td style={{padding: '3px 8px', textAlign: 'center'}}>{r.t}</td>
                  <td style={{padding: '3px 8px', color: r.proposer === 1 ? P1_COLOR : P2_COLOR, fontWeight: 700}}>Player {r.proposer}</td>
                  <td style={{padding: '3px 8px', textAlign: 'right'}}>
                    {fx(r.give, 4)} {r.t === T ? '(rejecting gives 0)' : `= δ${r.proposer === 1 ? '₂' : '₁'} × ${fx(table[r.t] ? table[r.t].keep : 0, 4)}`}
                  </td>
                  <td style={{padding: '3px 8px', textAlign: 'right'}}>{fx(r.keep, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={note}>Read the table from the bottom up: in the last round the proposer takes everything; each earlier proposer offers the responder exactly what waiting would be worth to them.</div>
        </div>
      ) : (
        <div style={{fontSize: 14}}>
          Unique subgame-perfect split (Rubinstein): Player 1 gets <b style={{color: P1_COLOR}}>(1 − δ₂)/(1 − δ₁δ₂) = {fx(rub, 4)}</b>, Player 2 gets{' '}
          <b style={{color: P2_COLOR}}>{fx(1 - rub, 4)}</b>, agreed immediately.
        </div>
      )}

      <div style={{fontSize: 14, marginTop: 8, fontWeight: 700, color: NE_COLOR}}>
        Equilibrium: Player 1 offers Player 2 {fx(r1.give, 4)} in round 1, keeps {fx(r1.keep, 4)}, and Player 2 accepts.
      </div>

      <div style={{marginTop: 10, padding: 8, border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6}}>
        <b>Your turn as Player 1.</b> Choose how much to keep in round 1.
        <label style={{display: 'block', fontSize: 14}}>
          Keep = <b>{fx(myShare, 2)}</b>, offer Player 2 = <b>{fx(1 - myShare, 2)}</b>{' '}
          <input type="range" min={0} max={1} step={0.01} value={myShare} onChange={(e) => { setMyShare(Number(e.target.value)); setTried(null); }} style={{width: 180, verticalAlign: 'middle'}} />{' '}
          <button type="button" style={btn(false)} onClick={tryOffer}>
            Make the offer
          </button>
        </label>
        {tried && (
          <div style={{fontSize: 14, marginTop: 4, color: tried.accepted ? NE_COLOR : P2_COLOR}}>
            {tried.accepted
              ? `Accepted — Player 2 gets ${fx(tried.give, 3)} ≥ ${fx(p2Reject, 3)}, the value of rejecting. ${tried.give > p2Reject + 0.005 ? 'But you left money on the table.' : 'You extracted the maximum.'}`
              : `Rejected — waiting is worth ${fx(p2Reject, 3)} to Player 2 (in today’s terms), more than your offer of ${fx(tried.give, 3)}. Delay costs you too.`}
          </div>
        )}
      </div>
    </CEBlock>
  );
}

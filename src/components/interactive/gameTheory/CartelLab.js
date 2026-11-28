import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, btn, note} from './gtCore';

/**
 * Implicit cartels: n symmetric firms, P = 1 − Q, zero cost (so a − c = 1).
 * Trigger strategy: collude until someone cheats, then play the stage Nash equilibrium forever.
 */
function cournot(n) {
  const piN = 1 / (n + 1) ** 2;
  const qm = 1 / (2 * n);
  const piC = (q) => q * (1 - n * q);
  const qd = (q) => Math.max(0, (1 - (n - 1) * q) / 2);
  const piD = (q) => qd(q) ** 2;
  const thr = (q) => (piD(q) - piC(q)) / (piD(q) - piN);
  return {piN, qm, piC, qd, piD, thr, qN: 1 / (n + 1)};
}

export default function CartelLab() {
  const [n, setN] = useState(2);
  const [delta, setDelta] = useState(0.5);
  const [market, setMarket] = useState('cournot');

  const C = cournot(n);
  const thrFull = market === 'cournot' ? C.thr(C.qm) : 1 - 1 / n;
  const ok = delta >= thrFull - 1e-9;

  const best = useMemo(() => {
    if (market !== 'cournot') return null;
    for (let i = 0; i <= 2000; i++) {
      const q = C.qm + ((C.qN - C.qm) * i) / 2000;
      if (C.piC(q) >= (1 - delta) * C.piD(q) + delta * C.piN - 1e-12) return q;
    }
    return C.qN;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, delta, market]);

  const W = 420;
  const H = 180;
  const pad = 30;
  const X = (k) => pad + ((k - 1) / 11) * (W - 2 * pad);
  const Y = (d) => H - pad - d * (H - 2 * pad);
  const cPts = Array.from({length: 11}, (_, i) => i + 2).map((k) => `${X(k)},${Y(cournot(k).thr(cournot(k).qm))}`).join(' ');
  const bPts = Array.from({length: 11}, (_, i) => i + 2).map((k) => `${X(k)},${Y(1 - 1 / k)}`).join(' ');

  return (
    <CEBlock title="Can the cartel hold?" subtitle="Firms agree (tacitly) on the monopoly outcome and revert to competition forever if anyone cheats. Patience δ decides whether cheating pays.">
      <div style={{display: 'flex', gap: 6, marginBottom: 6}}>
        <button type="button" style={btn(market === 'cournot')} onClick={() => setMarket('cournot')}>
          Quantity competition (Cournot)
        </button>
        <button type="button" style={btn(market === 'bertrand')} onClick={() => setMarket('bertrand')}>
          Price competition (Bertrand)
        </button>
      </div>
      <label style={{display: 'block', fontSize: 14}}>
        Number of firms n = <b>{n}</b> <input type="range" min={2} max={12} value={n} onChange={(e) => setN(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Discount factor δ = <b>{fx(delta, 2)}</b> <input type="range" min={0} max={0.99} step={0.01} value={delta} onChange={(e) => setDelta(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>

      {market === 'cournot' ? (
        <div style={{fontSize: 14, marginTop: 6}}>
          <div>Monopoly share per firm qₘ = 1/(2n) = {fx(C.qm, 4)} → profit {fx(C.piC(C.qm), 4)} per period</div>
          <div>Best cheat against qₘ: produce (1 − (n − 1)qₘ)/2 = {fx(C.qd(C.qm), 4)} → profit {fx(C.piD(C.qm), 4)} once</div>
          <div>Punishment (Cournot–Nash forever): profit 1/(n + 1)² = {fx(C.piN, 4)}</div>
          <div style={{fontWeight: 700, marginTop: 4}}>
            Full collusion needs δ ≥ (π_cheat − π_cartel)/(π_cheat − π_Nash) = <span style={{color: NE_COLOR}}>{fx(thrFull, 4)}</span>{' '}
            {ok ? <span style={{color: NE_COLOR}}>✓ sustainable</span> : <span style={{color: P2_COLOR}}>✗ not sustainable</span>}
          </div>
          {!ok && best !== null && (
            <div style={{marginTop: 4}}>
              Best the cartel can do at this δ: each firm produces <b>{fx(best, 4)}</b> (between monopoly {fx(C.qm, 4)} and Cournot {fx(C.qN, 4)}), price{' '}
              {fx(1 - n * best, 4)}, profit {fx(C.piC(best), 4)} per firm.
            </div>
          )}
        </div>
      ) : (
        <div style={{fontSize: 14, marginTop: 6}}>
          <div>Cartel: each firm gets 1/n of monopoly profit. A cheater shaves the price slightly and takes the whole market once; then price = cost and profit 0 forever.</div>
          <div style={{fontWeight: 700, marginTop: 4}}>
            Need (1/n)·π/(1 − δ) ≥ π ⇔ δ ≥ 1 − 1/n = <span style={{color: NE_COLOR}}>{fx(thrFull, 4)}</span>{' '}
            {ok ? <span style={{color: NE_COLOR}}>✓ sustainable</span> : <span style={{color: P2_COLOR}}>✗ not sustainable</span>}
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: W, marginTop: 8}}>
        <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="none" stroke="var(--ifm-color-emphasis-400)" />
        <polyline points={cPts} fill="none" stroke={P1_COLOR} strokeWidth={2.5} />
        <polyline points={bPts} fill="none" stroke={P2_COLOR} strokeWidth={2.5} strokeDasharray="6 3" />
        <line x1={pad} y1={Y(delta)} x2={W - pad} y2={Y(delta)} stroke="#ca8a04" strokeDasharray="4 3" />
        <circle cx={X(n)} cy={Y(thrFull)} r={5} fill={NE_COLOR} />
        <text x={pad + 4} y={pad + 12} fontSize="10" fill={P1_COLOR}>— Cournot threshold</text>
        <text x={pad + 4} y={pad + 24} fontSize="10" fill={P2_COLOR}>-- Bertrand threshold</text>
        <text x={W - pad} y={Y(delta) - 4} fontSize="10" textAnchor="end" fill="#ca8a04">your δ</text>
        <text x={W / 2} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--ifm-font-color-base)">number of firms n (2 to 12)</text>
      </svg>
      <div style={note}>Collusion is easier with few, patient firms. Above the curve the monopoly outcome is a subgame-perfect equilibrium; below it the cartel must settle for a less profitable output, or collapse.</div>
    </CEBlock>
  );
}

import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, rng, btn, note} from './gtCore';

function SecondPrice() {
  const [v, setV] = useState(60);
  const [b, setB] = useState(45);
  const W = 420;
  const H = 200;
  const pad = 34;
  const X = (r) => pad + (r / 100) * (W - 2 * pad);
  const Y = (u) => H / 2 - (u / 100) * (H / 2 - pad / 2);
  const pay = (bid, r) => (bid > r ? v - r : 0);
  const pts = (bid) => Array.from({length: 201}, (_, i) => i / 2).map((r) => `${X(r)},${Y(pay(bid, r))}`).join(' ');
  const lo = Math.min(b, v);
  const hiB = Math.max(b, v);
  return (
    <CEBlock title="Second-price auction: why bidding your value is dominant" subtitle="Highest bid wins and pays the second-highest bid. r = the highest bid among your rivals (you don’t know it).">
      <label style={{display: 'block', fontSize: 14}}>
        Your value v = <b>{v}</b> <input type="range" min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} style={{width: 180, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Your bid b = <b>{b}</b> <input type="range" min={0} max={100} value={b} onChange={(e) => setB(Number(e.target.value))} style={{width: 180, verticalAlign: 'middle'}} />
      </label>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: W}}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="var(--ifm-color-emphasis-500)" />
        {b !== v && <rect x={X(lo)} y={pad / 2} width={X(hiB) - X(lo)} height={H - pad} fill="rgba(220,38,38,0.1)" />}
        <polyline points={pts(v)} fill="none" stroke={NE_COLOR} strokeWidth={4} opacity={0.6} />
        <polyline points={pts(b)} fill="none" stroke={P1_COLOR} strokeWidth={2} />
        <line x1={X(v)} y1={pad / 2} x2={X(v)} y2={H - pad / 2} stroke={NE_COLOR} strokeDasharray="3 3" />
        <text x={X(v) + 3} y={pad / 2 + 10} fontSize="10" fill={NE_COLOR}>v</text>
        <text x={W - pad} y={Y(0) + 14} fontSize="10" textAnchor="end" fill="var(--ifm-font-color-base)">rival’s highest bid r →</text>
        <text x={pad + 2} y={pad / 2 + 10} fontSize="10" fill="var(--ifm-font-color-base)">your payoff</text>
      </svg>
      <div style={{fontSize: 14}}>
        <span style={{color: NE_COLOR, fontWeight: 700}}>Thick green</span>: payoff from bidding v. <span style={{color: P1_COLOR, fontWeight: 700}}>Blue</span>: payoff from your bid b. You pay r, not b — your bid only decides <i>whether</i> you win.
      </div>
      <div style={note}>
        {b < v && `Shading to ${b}: whenever the rival bid r falls in the red zone (${b} < r < ${v}) you lose an auction you would have won at a profit of v − r > 0. You never gain.`}
        {b > v && `Overbidding to ${b}: whenever r falls in the red zone (${v} < r < ${b}) you win but pay r > v — a loss. You never gain.`}
        {b === v && 'Truthful bidding: you win exactly when winning is profitable (r < v). No other bid ever does better, and every other bid sometimes does worse — bidding v weakly dominates.'}
      </div>
    </CEBlock>
  );
}

function FirstPrice() {
  const [n, setN] = useState(2);
  const [v, setV] = useState(0.8);
  const [b, setB] = useState(0.6);
  const [sim, setSim] = useState(null);
  const k = (n - 1) / n;
  const prWin = (bid) => Math.min(1, bid / k) ** (n - 1);
  const eu = (bid) => (v - bid) * prWin(bid);
  const bStar = k * v;
  const W = 420;
  const H = 190;
  const pad = 34;
  const maxEU = Math.max(0.01, eu(bStar));
  const X = (x) => pad + x * (W - 2 * pad);
  const Y = (u) => H - pad - (Math.max(u, -0.05) / maxEU) * (H - 2 * pad) * 0.9;

  const simulate = () => {
    const r = rng(42 + n);
    let fp = 0;
    let sp = 0;
    const N = 4000;
    for (let t = 0; t < N; t++) {
      const vals = Array.from({length: n}, () => r()).sort((x, y) => y - x);
      fp += k * vals[0];
      sp += vals[1];
    }
    setSim({fp: fp / N, sp: sp / N});
  };

  const curve = useMemo(() => Array.from({length: 101}, (_, i) => (i / 100) * v).map((x) => `${X(x)},${Y(eu(x))}`).join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, v]);

  return (
    <CEBlock title="First-price auction: how much to shade?" subtitle="n bidders, values independent and uniform on [0, 1]. Rivals use the equilibrium rule b(v) = (n − 1)/n · v. Pick your best bid.">
      <label style={{display: 'block', fontSize: 14}}>
        Number of bidders n = <b>{n}</b> <input type="range" min={2} max={10} value={n} onChange={(e) => { setN(Number(e.target.value)); setSim(null); }} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Your value v = <b>{fx(v, 2)}</b> <input type="range" min={0.05} max={1} step={0.01} value={v} onChange={(e) => setV(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Your bid b = <b>{fx(Math.min(b, v), 2)}</b> <input type="range" min={0} max={1} step={0.01} value={b} onChange={(e) => setB(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: W}}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="var(--ifm-color-emphasis-500)" />
        <polyline points={curve} fill="none" stroke={P1_COLOR} strokeWidth={2.5} />
        <circle cx={X(bStar)} cy={Y(eu(bStar))} r={5} fill={NE_COLOR} />
        <circle cx={X(Math.min(b, v))} cy={Y(eu(Math.min(b, v)))} r={5} fill={P2_COLOR} />
        <text x={X(bStar)} y={Y(eu(bStar)) - 8} fontSize="10" textAnchor="middle" fill={NE_COLOR}>best bid</text>
        <text x={W - pad} y={Y(0) + 14} fontSize="10" textAnchor="end" fill="var(--ifm-font-color-base)">your bid (0 to v) →</text>
        <text x={pad + 2} y={pad - 6} fontSize="10" fill="var(--ifm-font-color-base)">expected payoff (v − b)·Pr(win)</text>
      </svg>
      <div style={{fontSize: 14}}>
        Bid {fx(Math.min(b, v), 2)}: Pr(win) = {fx(prWin(Math.min(b, v)), 3)}, expected payoff = <b>{fx(eu(Math.min(b, v)), 4)}</b>. Best bid (n − 1)/n · v = <b style={{color: NE_COLOR}}>{fx(bStar, 3)}</b>{' '}
        with expected payoff {fx(eu(bStar), 4)}.
      </div>
      <div style={{marginTop: 8}}>
        <button type="button" style={btn(false)} onClick={simulate}>
          Simulate 4,000 auctions: seller revenue
        </button>
      </div>
      {sim && (
        <div style={{fontSize: 14, marginTop: 6}}>
          Average revenue — first-price: <b>{fx(sim.fp, 4)}</b>, second-price (truthful bids): <b>{fx(sim.sp, 4)}</b>. Theory for both: (n − 1)/(n + 1) = <b>{fx((n - 1) / (n + 1), 4)}</b>.
        </div>
      )}
      <div style={note}>
        Raising your bid trades a bigger chance of winning against a smaller margin v − b. With more rivals you must shade less. Revenue equivalence: the two formats raise the
        same expected revenue — first-price bidders shade exactly enough to offset paying their own bid.
      </div>
    </CEBlock>
  );
}

export default function AuctionLab({mode = 'second'}) {
  return mode === 'first' ? <FirstPrice /> : <SecondPrice />;
}

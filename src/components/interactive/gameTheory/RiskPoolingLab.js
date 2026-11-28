import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, note} from './gtCore';

/** log of n choose k via lgamma-free summation (n ≤ 60). */
function logChoose(n, k) {
  let s = 0;
  for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i);
  return s;
}

/**
 * Distribution of the number of high payouts k among n assets.
 * With probability rho a single common coin drives every asset; otherwise independent.
 */
function dist(n, s, rho) {
  const out = new Array(n + 1).fill(0);
  for (let k = 0; k <= n; k++) {
    const lp = logChoose(n, k) + (k > 0 ? k * Math.log(s) : 0) + (n - k > 0 ? (n - k) * Math.log(1 - s) : 0);
    out[k] += (1 - rho) * (s === 0 ? (k === 0 ? 1 : 0) : s === 1 ? (k === n ? 1 : 0) : Math.exp(lp));
  }
  out[n] += rho * s;
  out[0] += rho * (1 - s);
  return out;
}

function stats(n, s, rho) {
  const d = dist(n, s, rho);
  let eu = 0;
  d.forEach((pk, k) => (eu += pk * Math.sqrt((100 * k) / n)));
  return {d, eu, ce: eu * eu};
}

export default function RiskPoolingLab() {
  const [n, setN] = useState(2);
  const [s, setS] = useState(0.5);
  const [rho, setRho] = useState(0);

  const cur = useMemo(() => stats(n, s, rho), [n, s, rho]);
  const solo = useMemo(() => stats(1, s, 0), [s]);
  const curve = useMemo(() => Array.from({length: 40}, (_, i) => stats(i + 1, s, rho).ce), [s, rho]);
  const EV = 100 * s;

  const W = 420;
  const H = 190;
  const pad = 30;

  const maxP = Math.max(...cur.d);
  const barW = (W - 2 * pad) / (n + 1);

  const cx = (i) => pad + (i / 39) * (W - 2 * pad);
  const cy = (v) => H - pad - (v / Math.max(EV, 1)) * (H - 2 * pad);

  return (
    <CEBlock
      title="Risk sharing: pool the assets, keep the mean, lose the risk"
      subtitle="Each of n people owns an asset paying 100 (prob s) or 0. They pool and each keeps 1/n of the total. Utility u(x) = √x."
    >
      <label style={{display: 'block', fontSize: 14}}>
        People in the pool n = <b>{n}</b>{' '}
        <input type="range" min={1} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} style={{width: 200, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Probability each asset pays s = <b>{fx(s, 2)}</b>{' '}
        <input type="range" min={0.05} max={0.95} step={0.05} value={s} onChange={(e) => setS(Number(e.target.value))} style={{width: 200, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Common-shock weight ρ (0 = independent, 1 = all move together) = <b>{fx(rho, 2)}</b>{' '}
        <input type="range" min={0} max={1} step={0.05} value={rho} onChange={(e) => setRho(Number(e.target.value))} style={{width: 200, verticalAlign: 'middle'}} />
      </label>

      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8}}>
        <div style={{flex: '1 1 300px'}}>
          <div style={{fontSize: 12, fontWeight: 700}}>Distribution of one person&apos;s share</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: W}}>
            <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--ifm-color-emphasis-500)" />
            {cur.d.map((pk, k) => (
              <rect key={k} x={pad + k * barW + 1} y={H - pad - (pk / maxP) * (H - 2 * pad)} width={Math.max(barW - 2, 1)} height={(pk / maxP) * (H - 2 * pad)} fill={P1_COLOR} opacity={0.75} />
            ))}
            <text x={pad} y={H - 10} fontSize="10" fill="var(--ifm-font-color-base)">
              0
            </text>
            <text x={W - pad} y={H - 10} fontSize="10" textAnchor="end" fill="var(--ifm-font-color-base)">
              100
            </text>
            <text x={W / 2} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ifm-font-color-base)">
              share payout
            </text>
          </svg>
        </div>
        <div style={{flex: '1 1 300px'}}>
          <div style={{fontSize: 12, fontWeight: 700}}>Certainty equivalent of a share vs pool size</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: W}}>
            <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--ifm-color-emphasis-500)" />
            <line x1={pad} y1={cy(EV)} x2={W - pad} y2={cy(EV)} stroke={NE_COLOR} strokeDasharray="4 3" />
            <text x={W - pad} y={cy(EV) - 4} fontSize="10" textAnchor="end" fill={NE_COLOR}>
              EV = {fx(EV, 0)}
            </text>
            <polyline points={curve.map((v, i) => `${cx(i)},${cy(v)}`).join(' ')} fill="none" stroke={P2_COLOR} strokeWidth={2} />
            <circle cx={cx(n - 1)} cy={cy(cur.ce)} r={5} fill={P2_COLOR} />
            <text x={pad} y={H - 10} fontSize="10" fill="var(--ifm-font-color-base)">
              n = 1
            </text>
            <text x={W - pad} y={H - 10} fontSize="10" textAnchor="end" fill="var(--ifm-font-color-base)">
              n = 40
            </text>
          </svg>
        </div>
      </div>

      <div style={{fontSize: 14}}>
        Own asset alone: E[u] = <b>{fx(solo.eu, 4)}</b>, CE = <b>{fx(solo.ce, 2)}</b>. &nbsp; Share of a pool of {n}: E[u] = <b>{fx(cur.eu, 4)}</b>, CE ={' '}
        <b>{fx(cur.ce, 2)}</b>. &nbsp; Gain from pooling: <b style={{color: NE_COLOR}}>{fx(cur.ce - solo.ce, 2)}</b> in sure-money terms.
      </div>
      <div style={note}>
        Pooling never changes the expected payout ({fx(EV, 0)}); it only shrinks the spread. When assets move together (ρ → 1), pooling cannot diversify
        anything — the lesson securitisation markets learned when mortgage defaults turned out to be correlated.
      </div>
    </CEBlock>
  );
}

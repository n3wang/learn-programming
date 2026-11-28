import React, {useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, note} from './gtCore';

/**
 * Linear demand P = a − Q, constant unit cost c, homogeneous good.
 * Compares cartel (monopoly), Stackelberg duopoly, Cournot with n firms, and Bertrand.
 */
export default function MarketStructureLab({highlight = null}) {
  const [a, setA] = useState(10);
  const [c, setC] = useState(1);
  const [n, setN] = useState(2);
  const m = Math.max(a - c, 0);

  const rows = [
    {key: 'cartel', name: 'Cartel / monopoly', Q: m / 2, firms: n, note: `each of ${n} firms produces ${fx(m / 2 / n, 2)}`},
    {key: 'stackelberg', name: 'Stackelberg (2 firms)', Q: (3 * m) / 4, firms: 2, profits: [(m * m) / 8, (m * m) / 16], note: `leader ${fx(m / 2, 2)}, follower ${fx(m / 4, 2)}`},
    {key: 'cournot', name: `Cournot (${n} firm${n > 1 ? 's' : ''})`, Q: (n * m) / (n + 1), firms: n, note: `each firm produces (a − c)/(n + 1) = ${fx(m / (n + 1), 2)}`},
    {key: 'bertrand', name: 'Bertrand (2+ firms)', Q: m, firms: Math.max(n, 2), note: 'price driven down to cost'},
  ].map((r) => {
    const P = a - r.Q;
    const profit = (P - c) * r.Q;
    const cs = (r.Q * r.Q) / 2;
    return {...r, P, profit, cs, ts: profit + cs};
  });

  const maxP = a;
  const W = 440;
  const H = 150;
  const bw = (W - 40) / rows.length;

  const slider = (label, val, set, min, max, step = 1) => (
    <label style={{display: 'block', fontSize: 14, marginBottom: 4}}>
      {label} = <b>{val}</b>{' '}
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
    </label>
  );

  const cell = {padding: '4px 8px', borderBottom: '1px solid var(--ifm-color-emphasis-300)', textAlign: 'right', fontVariantNumeric: 'tabular-nums'};

  return (
    <CEBlock title="Market structures side by side" subtitle="Demand P = a − Q, unit cost c. Same market, four ways of competing.">
      {slider('Demand intercept a', a, setA, 4, 20)}
      {slider('Unit cost c', c, setC, 0, 3, 0.5)}
      {slider('Number of Cournot firms n', n, setN, 1, 12)}
      <div style={{overflowX: 'auto'}}>
        <table style={{fontSize: 14, borderCollapse: 'collapse', display: 'table', marginTop: 6}}>
          <thead>
            <tr>
              <th style={{...cell, textAlign: 'left'}}>Structure</th>
              <th style={cell}>Total Q</th>
              <th style={cell}>Price</th>
              <th style={cell}>Industry profit</th>
              <th style={cell}>Consumer surplus</th>
              <th style={cell}>Total surplus</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} style={{background: highlight === r.key ? 'rgba(22,163,74,0.12)' : 'transparent'}}>
                <td style={{...cell, textAlign: 'left'}}>
                  <b>{r.name}</b>
                  <div style={{fontSize: 12, color: 'var(--ifm-color-emphasis-700)'}}>{r.note}</div>
                  {r.profits && (
                    <div style={{fontSize: 12}}>
                      profits: <span style={{color: P1_COLOR}}>leader {fx(r.profits[0], 2)}</span>, <span style={{color: P2_COLOR}}>follower {fx(r.profits[1], 2)}</span>
                    </div>
                  )}
                </td>
                <td style={cell}>{fx(r.Q, 2)}</td>
                <td style={cell}>{fx(r.P, 2)}</td>
                <td style={cell}>{fx(r.profit, 2)}</td>
                <td style={cell}>{fx(r.cs, 2)}</td>
                <td style={cell}>{fx(r.ts, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 30}`} style={{width: '100%', maxWidth: W, marginTop: 8}}>
        <line x1={20} y1={H} x2={W - 10} y2={H} stroke="var(--ifm-color-emphasis-500)" />
        <line x1={20} y1={H - ((c / maxP) * (H - 10))} x2={W - 10} y2={H - ((c / maxP) * (H - 10))} stroke={NE_COLOR} strokeDasharray="4 3" />
        <text x={W - 12} y={H - ((c / maxP) * (H - 10)) - 4} fontSize="10" textAnchor="end" fill={NE_COLOR}>
          cost c
        </text>
        {rows.map((r, i) => {
          const h = (r.P / maxP) * (H - 10);
          return (
            <g key={r.key}>
              <rect x={28 + i * bw} y={H - h} width={bw - 16} height={h} fill={P1_COLOR} opacity={0.7} />
              <text x={28 + i * bw + (bw - 16) / 2} y={H - h - 4} fontSize="11" textAnchor="middle" fill="var(--ifm-font-color-base)">
                P = {fx(r.P, 2)}
              </text>
              <text x={28 + i * bw + (bw - 16) / 2} y={H + 16} fontSize="10.5" textAnchor="middle" fill="var(--ifm-font-color-base)">
                {r.name.split(' (')[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={note}>
        Push n upward: the Cournot price falls toward cost (the competitive outcome), and total surplus approaches the Bertrand level. With n = 1,
        Cournot is the monopoly.
      </div>
    </CEBlock>
  );
}

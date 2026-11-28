import React, {useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, note} from './gtCore';

/**
 * Risk attitude & insurance explorer.
 * u(x) = x^r on x ≥ 0. Lottery: W1 with probability p, W2 with probability 1 − p.
 */
export default function RiskAttitudeLab() {
  const [r, setR] = useState(0.5);
  const [W1, setW1] = useState(0);
  const [W2, setW2] = useState(100);
  const [p, setP] = useState(0.5);

  const u = (x) => Math.pow(Math.max(x, 0), r);
  const uinv = (y) => Math.pow(Math.max(y, 0), 1 / r);
  const lo = Math.min(W1, W2);
  const hi = Math.max(W1, W2);
  const pLo = W1 <= W2 ? p : 1 - p;
  const EV = pLo * lo + (1 - pLo) * hi;
  const EU = pLo * u(lo) + (1 - pLo) * u(hi);
  const CE = uinv(EU);
  const RP = EV - CE;
  const maxPrem = hi - CE;
  const fairPrem = pLo * (hi - lo);

  const attitude = Math.abs(r - 1) < 1e-6 ? 'risk neutral (linear u)' : r < 1 ? 'risk averse (concave u)' : 'risk seeking (convex u)';

  /* plot */
  const W = 420;
  const H = 260;
  const pad = 36;
  const xMax = Math.max(hi * 1.1, 10);
  const yMax = u(xMax);
  const X = (x) => pad + (x / xMax) * (W - 2 * pad);
  const Y = (y) => H - pad - (y / (yMax || 1)) * (H - 2 * pad);
  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const x = (i / 80) * xMax;
    pts.push(`${X(x)},${Y(u(x))}`);
  }

  const slider = (label, val, set, min, max, step) => (
    <label style={{display: 'block', fontSize: 14, marginBottom: 4}}>
      {label} = <b>{step < 1 ? fx(val, 2) : val}</b>{' '}
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(Number(e.target.value))} style={{width: 180, verticalAlign: 'middle'}} />
    </label>
  );

  return (
    <CEBlock title="Risk attitude, certainty equivalent, and insurance" subtitle="Bend the utility curve and watch the gap between the gamble and its expected value.">
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
        <div style={{flex: '1 1 260px'}}>
          {slider('Curvature r in u(x) = xʳ', r, setR, 0.2, 2, 0.05)}
          <div style={{...note, marginTop: -2}}>Currently: {attitude}</div>
          {slider('Bad outcome W₁', W1, setW1, 0, 200, 5)}
          {slider('Good outcome W₂', W2, setW2, 0, 200, 5)}
          {slider('Probability of the bad outcome p', p, setP, 0, 1, 0.05)}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{flex: '1 1 320px', maxWidth: W}}>
          <line x1={pad} y1={H - pad} x2={W - pad / 2} y2={H - pad} stroke="var(--ifm-color-emphasis-500)" />
          <line x1={pad} y1={pad / 2} x2={pad} y2={H - pad} stroke="var(--ifm-color-emphasis-500)" />
          <polyline points={pts.join(' ')} fill="none" stroke="var(--ifm-font-color-base)" strokeWidth={2} />
          <line x1={X(lo)} y1={Y(u(lo))} x2={X(hi)} y2={Y(u(hi))} stroke={P1_COLOR} strokeWidth={2} />
          {[lo, hi].map((x, i) => (
            <g key={i}>
              <line x1={X(x)} y1={Y(u(x))} x2={X(x)} y2={H - pad} stroke="var(--ifm-color-emphasis-400)" strokeDasharray="3 3" />
              <text x={X(x)} y={H - pad + 14} fontSize="11" textAnchor="middle" fill="var(--ifm-font-color-base)">
                {i === 0 ? 'W₁' : 'W₂'}
              </text>
            </g>
          ))}
          <line x1={X(EV)} y1={Y(u(EV))} x2={X(EV)} y2={H - pad} stroke="var(--ifm-color-emphasis-500)" strokeDasharray="3 3" />
          <text x={X(EV)} y={H - pad + 26} fontSize="11" textAnchor="middle" fill={P1_COLOR}>
            EV
          </text>
          <line x1={pad} y1={Y(EU)} x2={X(Math.max(EV, CE))} y2={Y(EU)} stroke={P2_COLOR} strokeDasharray="3 3" />
          <line x1={X(CE)} y1={Y(EU)} x2={X(CE)} y2={H - pad} stroke={NE_COLOR} strokeDasharray="3 3" />
          <text x={X(CE)} y={H - pad + 26} fontSize="11" textAnchor="middle" fill={NE_COLOR}>
            CE
          </text>
          <circle cx={X(EV)} cy={Y(u(EV))} r={4} fill="var(--ifm-font-color-base)" />
          <text x={X(EV) + 6} y={Y(u(EV)) - 6} fontSize="11" fill="var(--ifm-font-color-base)">
            A: u(EV)
          </text>
          <circle cx={X(EV)} cy={Y(EU)} r={4} fill={P2_COLOR} />
          <text x={X(EV) + 6} y={Y(EU) + 14} fontSize="11" fill={P2_COLOR}>
            B: E[u]
          </text>
          <circle cx={X(CE)} cy={Y(EU)} r={4} fill={NE_COLOR} />
          <text x={X(CE) - 6} y={Y(EU) - 6} fontSize="11" textAnchor="end" fill={NE_COLOR}>
            C
          </text>
        </svg>
      </div>
      <table style={{fontSize: 14, marginTop: 8, display: 'table'}}>
        <tbody>
          <tr>
            <td>Expected value EV = p·W₁ + (1−p)·W₂</td>
            <td>
              <b>{fx(EV, 2)}</b>
            </td>
          </tr>
          <tr>
            <td>Expected utility E[u] = p·u(W₁) + (1−p)·u(W₂)</td>
            <td>
              <b>{fx(EU, 3)}</b> (vs u(EV) = {fx(u(EV), 3)})
            </td>
          </tr>
          <tr>
            <td>Certainty equivalent CE = u⁻¹(E[u])</td>
            <td>
              <b style={{color: NE_COLOR}}>{fx(CE, 2)}</b>
            </td>
          </tr>
          <tr>
            <td>Risk premium EV − CE</td>
            <td>
              <b>{fx(RP, 2)}</b>
            </td>
          </tr>
          <tr>
            <td>Most this person pays to insure fully (wealth fixed at W₂): W₂ − CE</td>
            <td>
              <b>{fx(maxPrem, 2)}</b>
            </td>
          </tr>
          <tr>
            <td>Least a risk-neutral insurer accepts: p·(W₂ − W₁)</td>
            <td>
              <b>{fx(fairPrem, 2)}</b>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{...note, fontWeight: 600, color: maxPrem > fairPrem + 1e-9 ? NE_COLOR : P2_COLOR}}>
        {maxPrem > fairPrem + 1e-9
          ? `Gains from trade: any premium between ${fx(fairPrem, 2)} and ${fx(maxPrem, 2)} makes both sides better off.`
          : 'No premium works for both sides: the buyer is not risk averse enough (or there is no risk).'}
      </div>
    </CEBlock>
  );
}

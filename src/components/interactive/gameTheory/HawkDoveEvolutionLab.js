import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, note} from './gtCore';

/**
 * Replicator dynamics in Hawk–Dove: a population with hawk share x.
 * Strategies that earn more than average grow.
 */
export default function HawkDoveEvolutionLab() {
  const [V, setV] = useState(4);
  const [C, setC] = useState(8);
  const [x0, setX0] = useState(0.1);

  const piH = (x) => x * ((V - C) / 2) + (1 - x) * V;
  const piD = (x) => (1 - x) * (V / 2);
  const target = V >= C ? 1 : V / C;

  const path = useMemo(() => {
    const out = [x0];
    let x = x0;
    const dt = 0.25;
    for (let t = 0; t < 600; t++) {
      x = Math.min(1, Math.max(0, x + dt * x * (1 - x) * (piH(x) - piD(x)) / Math.max(1, Math.abs(V) + Math.abs(C)) * 4));
      out.push(x);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [V, C, x0]);

  const W = 420;
  const H = 180;
  const pad = 30;
  const X = (i) => pad + (i / (path.length - 1)) * (W - 2 * pad);
  const Y = (v) => H - pad - v * (H - 2 * pad);

  return (
    <CEBlock title="Evolution of hawks and doves" subtitle="Animals (or firms) are hard-wired as Hawk or Dove. Types that earn more than average become more common.">
      <label style={{display: 'block', fontSize: 14}}>
        Value of the resource V = <b>{V}</b>{' '}
        <input type="range" min={1} max={12} value={V} onChange={(e) => setV(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Cost of a fight C = <b>{C}</b>{' '}
        <input type="range" min={1} max={16} value={C} onChange={(e) => setC(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block', fontSize: 14}}>
        Starting share of hawks = <b>{fx(x0, 2)}</b>{' '}
        <input type="range" min={0.01} max={0.99} step={0.01} value={x0} onChange={(e) => setX0(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: W}}>
        <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="none" stroke="var(--ifm-color-emphasis-400)" />
        <line x1={pad} y1={Y(target)} x2={W - pad} y2={Y(target)} stroke={NE_COLOR} strokeDasharray="5 4" />
        <text x={W - pad} y={Y(target) - 4} fontSize="10" textAnchor="end" fill={NE_COLOR}>
          {V >= C ? 'all hawks' : `V/C = ${fx(V / C, 2)}`}
        </text>
        <polyline points={path.map((v, i) => `${X(i)},${Y(v)}`).join(' ')} fill="none" stroke={P2_COLOR} strokeWidth={2.5} />
        <text x={pad} y={H - 10} fontSize="10" fill="var(--ifm-font-color-base)">time →</text>
        <text x={pad - 4} y={Y(1) + 4} fontSize="10" textAnchor="end" fill="var(--ifm-font-color-base)">1</text>
        <text x={pad - 4} y={Y(0) + 4} fontSize="10" textAnchor="end" fill="var(--ifm-font-color-base)">0</text>
      </svg>
      <div style={{fontSize: 14}}>
        At hawk share x, a Hawk earns <span style={{color: P2_COLOR}}>x(V − C)/2 + (1 − x)V</span> and a Dove earns <span style={{color: P1_COLOR}}>(1 − x)V/2</span>. Final hawk share ≈{' '}
        <b>{fx(path[path.length - 1], 3)}</b>.
      </div>
      <div style={note}>
        When fights are costly (V &lt; C) the population settles where both types earn the same: hawk share V/C — exactly the probability of Hawk in the mixed equilibrium. A
        mixed strategy can be read as the composition of a population.
      </div>
    </CEBlock>
  );
}

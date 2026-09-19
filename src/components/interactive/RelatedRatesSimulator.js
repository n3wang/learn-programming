import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Related rates: sliding ladder x²+y²=L².
 * Probe x and dx/dt; read y and dy/dt.
 */
export default function RelatedRatesSimulator({compact, embedded, refNote} = {}) {
  const [L, setL] = useState(25);
  const [x, setX] = useState(7);
  const [dxdt, setDxdt] = useState(3);

  const W = compact ? 280 : 380;
  const H = compact ? 260 : 320;
  const pad = 40;

  const xx = Math.min(Math.max(x, 0.5), L - 0.5);
  const y = Math.sqrt(Math.max(L * L - xx * xx, 0));
  const dydt = y > 1e-6 ? (-xx / y) * dxdt : 0;

  const chart = useMemo(() => {
    const groundY = H - pad;
    const wallX = pad;
    const scale = Math.min((W - 2 * pad) / L, (H - 2 * pad) / L);
    const bx = wallX + xx * scale;
    const ty = groundY - y * scale;
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
        role="img"
        aria-label="sliding ladder related rates"
      >
        <line x1={wallX} y1={pad} x2={wallX} y2={groundY} stroke="#333" strokeWidth="3" />
        <line x1={wallX} y1={groundY} x2={W - pad} y2={groundY} stroke="#333" strokeWidth="3" />
        <line x1={wallX} y1={ty} x2={bx} y2={groundY} stroke="#1565c0" strokeWidth="3.5" />
        <circle cx={bx} cy={groundY} r={5} fill="#2e7d32" />
        <circle cx={wallX} cy={ty} r={5} fill="#c62828" />
        <text x={pad + 8} y={18} fontSize="11" fill="currentColor">
          x={xx.toFixed(1)} · y={y.toFixed(2)} · dy/dt={dydt.toFixed(3)}
        </text>
      </svg>
    );
  }, [L, xx, y, dydt, W, H, pad]);

  return (
    <ExplorerPanelLayout
      title="Related rates — sliding ladder"
      subtitle="x² + y² = L² ⇒ x x′ + y y′ = 0"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="ladder"
      chart={chart}
      params={[
        {
          key: 'L',
          label: 'L',
          meaning: 'Ladder length (ft).',
          min: 10,
          max: 40,
          step: 1,
          value: L,
          onChange: setL,
          display: String(L),
        },
        {
          key: 'x',
          label: 'x',
          meaning: 'Distance of base from wall (ft).',
          min: 1,
          max: 35,
          step: 0.5,
          value: x,
          onChange: setX,
          display: x.toFixed(1),
        },
        {
          key: 'dxdt',
          label: 'dx/dt',
          meaning: 'How fast the base slides away (ft/s).',
          min: 0.5,
          max: 6,
          step: 0.5,
          value: dxdt,
          onChange: setDxdt,
          display: dxdt.toFixed(1),
        },
      ]}
      stats={[
        {label: 'y', value: y.toFixed(3)},
        {label: 'dy/dt', value: dydt.toFixed(4)},
        {label: '|dy/dt|', value: Math.abs(dydt).toFixed(4)},
      ]}
      note="From 2x dx/dt + 2y dy/dt = 0: dy/dt = −(x/y) dx/dt. Negative means the top is sliding down."
    />
  );
}

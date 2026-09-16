import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Projectile-like y(t) with forward vs central difference chords at time t.
 * Default: y = a + b t² (central exact); optional drag-ish curve.
 */
export default function DifferentiationSimulator({compact, embedded, refNote} = {}) {
  const [t0, setT0] = useState(1.2);
  const [h, setH] = useState(0.6);
  const [mode, setMode] = useState(0); // 0 parabola, 1 sin*exp drag-ish

  const {curve, fd, cd, exact, yAt} = useMemo(() => {
    const f = mode === 0 ? (t) => 1 + 0.5 * t * t : (t) => Math.exp(-0.15 * t) * (2 * t - 0.1 * t * t);
    const fp = mode === 0 ? (t) => t : (t) => {
      const e = Math.exp(-0.15 * t);
      return -0.15 * e * (2 * t - 0.1 * t * t) + e * (2 - 0.2 * t);
    };
    const curve = [];
    for (let i = 0; i <= 80; i += 1) {
      const t = (i / 80) * 3.2;
      curve.push({t, y: f(t)});
    }
    const fd = (f(t0 + h) - f(t0)) / h;
    const cd = (f(t0 + h / 2) - f(t0 - h / 2)) / h;
    return {curve, fd, cd, exact: fp(t0), yAt: f};
  }, [t0, h, mode]);

  const W = compact ? 280 : 400;
  const H = compact ? 220 : 300;
  const pad = 36;
  const tMin = 0;
  const tMax = 3.2;
  const ys = curve.map((p) => p.y);
  const yMin = Math.min(...ys) - 0.3;
  const yMax = Math.max(...ys) + 0.3;
  const toX = (t) => pad + ((t - tMin) / (tMax - tMin)) * (W - 2 * pad);
  const toY = (y) => pad + ((yMax - y) / (yMax - yMin)) * (H - 2 * pad);

  const dCurve = curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(' ');

  const y0 = yAt(t0);
  const yFd = yAt(t0 + h);
  const yCdL = yAt(t0 - h / 2);
  const yCdR = yAt(t0 + h / 2);

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Forward vs central difference chords on a curve"
    >
      <rect
        x={pad}
        y={pad}
        width={W - 2 * pad}
        height={H - 2 * pad}
        fill="#fafafa"
        stroke="var(--ifm-color-emphasis-300)"
      />
      <path d={dCurve} fill="none" stroke="#455a64" strokeWidth="2" />
      <line
        x1={toX(t0)}
        y1={toY(y0)}
        x2={toX(t0 + h)}
        y2={toY(yFd)}
        stroke="#c62828"
        strokeWidth="2"
      />
      <line
        x1={toX(t0 - h / 2)}
        y1={toY(yCdL)}
        x2={toX(t0 + h / 2)}
        y2={toY(yCdR)}
        stroke="#1565c0"
        strokeWidth="2"
      />
      <circle cx={toX(t0)} cy={toY(y0)} r={3.5} fill="#212121" />
      <text x={12} y={18} fontSize="11" fill="currentColor">
        red = forward · blue = central · black = sample at t
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="Numerical differentiation"
      subtitle="Forward vs central difference chords on y(t)"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="y(t)"
      chart={chart}
      params={[
        {
          key: 't0',
          label: 't',
          meaning: 'Sample time where the derivative estimate is centered.',
          min: 0.4,
          max: 2.6,
          step: 0.05,
          value: t0,
          onChange: setT0,
          display: t0.toFixed(2),
        },
        {
          key: 'h',
          label: 'h',
          meaning: 'Step size. Forward uses [t, t+h]; central uses [t−h/2, t+h/2].',
          min: 0.05,
          max: 1.2,
          step: 0.05,
          value: h,
          onChange: setH,
          display: h.toFixed(2),
        },
        {
          key: 'mode',
          label: 'curve',
          meaning: '0 = parabola a+bt² (central exact). 1 = drag-ish sample.',
          min: 0,
          max: 1,
          step: 1,
          value: mode,
          onChange: setMode,
          display: mode === 0 ? 'parabola' : 'drag-ish',
        },
      ]}
      stats={[
        {label: 'exact y′', value: exact.toFixed(4)},
        {label: 'forward', value: fd.toFixed(4)},
        {label: 'fwd err', value: (fd - exact).toFixed(4)},
        {label: 'central', value: cd.toFixed(4)},
        {label: 'cen err', value: (cd - exact).toFixed(4)},
      ]}
    />
  );
}

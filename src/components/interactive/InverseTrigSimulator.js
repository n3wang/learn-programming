import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Inverse trig: arcsin / arccos / arctan graphs + derivative readout.
 * mode: 0 arcsin, 1 arccos, 2 arctan
 */
export default function InverseTrigSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState(0);
  const [x0, setX0] = useState(0.5);

  const W = compact ? 300 : 420;
  const H = compact ? 240 : 300;
  const pad = 36;

  const clampX = (m, x) => {
    if (m === 2) return Math.max(-4, Math.min(4, x));
    if (m === 0 || m === 1) return Math.max(-0.999, Math.min(0.999, x));
    return x;
  };

  const x = clampX(mode, x0);
  const y =
    mode === 0 ? Math.asin(x) : mode === 1 ? Math.acos(x) : Math.atan(x);
  const yp =
    mode === 0
      ? 1 / Math.sqrt(1 - x * x)
      : mode === 1
        ? -1 / Math.sqrt(1 - x * x)
        : 1 / (1 + x * x);

  const chart = useMemo(() => {
    const cx = W / 2;
    const cy = H / 2;
    let xMin;
    let xMax;
    let yMin;
    let yMax;
    let f;
    let asymptotes = [];
    if (mode === 0) {
      xMin = -1.2;
      xMax = 1.2;
      yMin = -Math.PI / 2 - 0.3;
      yMax = Math.PI / 2 + 0.3;
      f = (t) => (Math.abs(t) <= 1 ? Math.asin(t) : null);
    } else if (mode === 1) {
      xMin = -1.2;
      xMax = 1.2;
      yMin = -0.3;
      yMax = Math.PI + 0.3;
      f = (t) => (Math.abs(t) <= 1 ? Math.acos(t) : null);
    } else {
      xMin = -4;
      xMax = 4;
      yMin = -Math.PI / 2 - 0.4;
      yMax = Math.PI / 2 + 0.4;
      f = (t) => Math.atan(t);
      asymptotes = [Math.PI / 2, -Math.PI / 2];
    }
    const sx = (t) => pad + ((t - xMin) / (xMax - xMin)) * (W - 2 * pad);
    const sy = (v) => pad + ((yMax - v) / (yMax - yMin)) * (H - 2 * pad);
    const pts = [];
    for (let i = 0; i <= 160; i += 1) {
      const t = xMin + ((xMax - xMin) * i) / 160;
      const v = f(t);
      if (v == null) continue;
      pts.push(`${sx(t)},${sy(v)}`);
    }
    const names = ['arcsin', 'arccos', 'arctan'];
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
        role="img"
        aria-label={`${names[mode]} graph`}
      >
        <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="#bbb" />
        <line x1={sx(0)} y1={pad} x2={sx(0)} y2={H - pad} stroke="#bbb" />
        {asymptotes.map((a) => (
          <line
            key={a}
            x1={pad}
            y1={sy(a)}
            x2={W - pad}
            y2={sy(a)}
            stroke="#c62828"
            strokeDasharray="5 4"
          />
        ))}
        <path d={`M${pts.join(' L')}`} fill="none" stroke="#1565c0" strokeWidth="2.2" />
        <circle cx={sx(x)} cy={sy(y)} r={5} fill="#ed6c02" />
        <line
          x1={sx(x - 0.4)}
          y1={sy(y - yp * 0.4)}
          x2={sx(x + 0.4)}
          y2={sy(y + yp * 0.4)}
          stroke="#2e7d32"
          strokeWidth="2"
        />
        <text x={pad + 4} y={18} fontSize="11" fill="currentColor">
          {names[mode]}({x.toFixed(2)}) = {y.toFixed(3)} · slope {yp.toFixed(3)}
        </text>
      </svg>
    );
  }, [mode, x, y, yp, W, H, pad]);

  const modeNames = ['arcsin', 'arccos', 'arctan'];

  return (
    <ExplorerPanelLayout
      title="Inverse trigonometric functions"
      subtitle="Restricted ranges · graphs · derivative slopes"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel={modeNames[mode]}
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'f',
          meaning: '0 arcsin · 1 arccos · 2 arctan',
          min: 0,
          max: 2,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeNames[mode],
        },
        {
          key: 'x0',
          label: 'x',
          meaning: 'Evaluation point (clamped to the domain of the selected inverse).',
          min: -4,
          max: 4,
          step: 0.05,
          value: x0,
          onChange: setX0,
          display: x0.toFixed(2),
        },
      ]}
      stats={[
        {label: 'y', value: y.toFixed(4)},
        {label: "y'", value: Number.isFinite(yp) ? yp.toFixed(4) : '—'},
        {
          label: 'range',
          value: mode === 0 ? '[−π/2,π/2]' : mode === 1 ? '[0,π]' : '(−π/2,π/2)',
        },
      ]}
      note={
        mode === 0
          ? 'arcsin x = y ↔ sin y = x with y ∈ [−π/2, π/2]; (arcsin)′ = 1/√(1−x²).'
          : mode === 1
            ? 'arccos x = y ↔ cos y = x with y ∈ [0, π]; (arccos)′ = −1/√(1−x²).'
            : 'arctan x = y ↔ tan y = x with y ∈ (−π/2, π/2); (arctan)′ = 1/(1+x²).'
      }
    />
  );
}

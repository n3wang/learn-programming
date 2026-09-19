import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Motion: rectilinear s(t), free-fall, circular θ(t).
 * mode: 0 rectilinear quadratic, 1 free fall, 2 circular
 */
export default function MotionSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState(0);
  const [t, setT] = useState(1.5);
  const [v0, setV0] = useState(48);
  const [s0, setS0] = useState(0);
  const [omega, setOmega] = useState(1);

  const W = compact ? 300 : 420;
  const H = compact ? 240 : 280;
  const pad = 36;

  const chart = useMemo(() => {
    if (mode === 2) {
      const th = omega * t;
      const r = Math.min(W, H) / 2 - pad;
      const cx = W / 2;
      const cy = H / 2;
      const px = cx + r * Math.cos(th);
      const py = cy - r * Math.sin(th);
      return (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
          role="img"
          aria-label="circular motion"
        >
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#455a64" strokeWidth="2" />
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#1565c0" strokeWidth="2" />
          <circle cx={px} cy={py} r={6} fill="#ed6c02" />
          <text x={12} y={18} fontSize="11" fill="currentColor">
            θ = ωt = {th.toFixed(2)} rad · ω = {omega.toFixed(2)}
          </text>
        </svg>
      );
    }

    // position-time graph for modes 0 and 1
    let f;
    let tMin = 0;
    let tMax = 5;
    let label;
    if (mode === 0) {
      // s = (t-2)^2
      f = (u) => (u - 2) ** 2;
      label = 's=(t−2)²';
    } else {
      // free fall s = s0 + v0 t - 16 t^2
      f = (u) => s0 + v0 * u - 16 * u * u;
      label = 's=s₀+v₀t−16t²';
      tMax = Math.max(4, (v0 + Math.sqrt(v0 * v0 + 64 * Math.max(s0, 0))) / 32 + 0.5);
    }
    const samples = [];
    for (let i = 0; i <= 80; i += 1) {
      const u = tMin + ((tMax - tMin) * i) / 80;
      samples.push({u, s: f(u)});
    }
    const sVals = samples.map((p) => p.s);
    const sMin = Math.min(...sVals, 0) - 1;
    const sMax = Math.max(...sVals, 1) + 1;
    const sx = (u) => pad + ((u - tMin) / (tMax - tMin)) * (W - 2 * pad);
    const sy = (s) => pad + ((sMax - s) / (sMax - sMin)) * (H - 2 * pad);
    const pts = samples.map((p) => `${sx(p.u)},${sy(p.s)}`);
    const tt = Math.max(tMin, Math.min(tMax, t));
    const st = f(tt);
    const vt = mode === 0 ? 2 * (tt - 2) : v0 - 32 * tt;
    const at = mode === 0 ? 2 : -32;
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
        role="img"
        aria-label="position vs time"
      >
        <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="#bbb" />
        <path d={`M${pts.join(' L')}`} fill="none" stroke="#1565c0" strokeWidth="2.2" />
        <circle cx={sx(tt)} cy={sy(st)} r={5} fill="#ed6c02" />
        <text x={pad + 4} y={18} fontSize="11" fill="currentColor">
          {label} · s={st.toFixed(2)} · v={vt.toFixed(2)} · a={at}
        </text>
      </svg>
    );
  }, [mode, t, v0, s0, omega, W, H, pad]);

  const modeNames = ['rectilinear', 'free fall', 'circular'];
  const tt = t;
  const s =
    mode === 0
      ? (tt - 2) ** 2
      : mode === 1
        ? s0 + v0 * tt - 16 * tt * tt
        : null;
  const v = mode === 0 ? 2 * (tt - 2) : mode === 1 ? v0 - 32 * tt : null;
  const a = mode === 0 ? 2 : mode === 1 ? -32 : null;

  return (
    <ExplorerPanelLayout
      title="Rectilinear & circular motion"
      subtitle="v = ds/dt · a = dv/dt · ω = dθ/dt"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel={modeNames[mode]}
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'mode',
          meaning: '0 s=(t−2)² · 1 free fall · 2 circular θ=ωt',
          min: 0,
          max: 2,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeNames[mode],
        },
        {
          key: 't',
          label: 't',
          meaning: 'Time probe.',
          min: 0,
          max: 6,
          step: 0.05,
          value: t,
          onChange: setT,
          display: t.toFixed(2),
        },
        {
          key: 'v0',
          label: 'v₀',
          meaning: 'Initial velocity for free fall (ft/s, upward +).',
          min: -20,
          max: 80,
          step: 1,
          value: v0,
          onChange: setV0,
          display: String(v0),
        },
        {
          key: 's0',
          label: 's₀',
          meaning: 'Initial height for free fall (ft).',
          min: 0,
          max: 100,
          step: 1,
          value: s0,
          onChange: setS0,
          display: String(s0),
        },
        {
          key: 'omega',
          label: 'ω',
          meaning: 'Angular velocity for circular mode (rad/s).',
          min: 0.2,
          max: 3,
          step: 0.1,
          value: omega,
          onChange: setOmega,
          display: omega.toFixed(1),
        },
      ]}
      stats={
        mode === 2
          ? [
              {label: 'θ', value: (omega * t).toFixed(3)},
              {label: 'ω', value: omega.toFixed(2)},
              {label: 'α', value: '0'},
            ]
          : [
              {label: 's', value: s == null ? '—' : s.toFixed(3)},
              {label: 'v', value: v == null ? '—' : v.toFixed(3)},
              {label: 'a', value: a == null ? '—' : String(a)},
              {label: 'speed', value: v == null ? '—' : Math.abs(v).toFixed(3)},
            ]
      }
      note={
        mode === 0
          ? 'v < 0 means moving left (decreasing s); turn at t=2 where v=0.'
          : mode === 1
            ? 'Upward positive: a = −32 ft/s². s = s₀ + v₀t − 16t².'
            : 'Angular velocity ω = dθ/dt; α = dω/dt. Here θ = ωt so α = 0.'
      }
    />
  );
}

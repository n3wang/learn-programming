import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Trig differentiation: A sin(bx) / A cos(bx) waves, sinθ/θ limit probe, derivative slope.
 * mode: 0 wave A·sin(bx)/cos, 1 lim sinθ/θ, 2 derivative of sin at x0
 */
export default function TrigDiffSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState(0);
  const [which, setWhich] = useState(0); // 0 sin, 1 cos
  const [A, setA] = useState(1.5);
  const [b, setB] = useState(2);
  const [thetaDeg, setThetaDeg] = useState(30);
  const [x0Deg, setX0Deg] = useState(45);

  const W = compact ? 300 : 440;
  const H = compact ? 220 : 280;
  const pad = 36;

  const period = b > 0 ? (2 * Math.PI) / b : 2 * Math.PI;
  const freq = b;
  const amp = Math.abs(A);

  const chart = useMemo(() => {
    if (mode === 1) {
      // lim θ→0 sinθ/θ
      const th = (thetaDeg * Math.PI) / 180;
      const ratio = Math.abs(th) < 1e-8 ? 1 : Math.sin(th) / th;
      const oneMinus = Math.abs(th) < 1e-8 ? 0 : (1 - Math.cos(th)) / th;
      return (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
          role="img"
          aria-label="sin θ over θ limit probe"
        >
          <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="#fafafa" stroke="var(--ifm-color-emphasis-300)" />
          <text x={pad + 8} y={pad + 22} fontSize="13" fill="currentColor">
            θ = {thetaDeg}° ≈ {(th).toFixed(4)} rad
          </text>
          <text x={pad + 8} y={pad + 48} fontSize="14" fill="#1565c0">
            sin θ / θ = {ratio.toFixed(6)}
          </text>
          <text x={pad + 8} y={pad + 72} fontSize="14" fill="#c62828">
            (1 − cos θ) / θ = {oneMinus.toFixed(6)}
          </text>
          <text x={pad + 8} y={H - 20} fontSize="11" fill="#666">
            Drag θ → 0: first ratio → 1, second → 0
          </text>
        </svg>
      );
    }

    if (mode === 2) {
      const x0 = (x0Deg * Math.PI) / 180;
      const y0 = Math.sin(x0);
      const m = Math.cos(x0);
      const xMin = -0.5;
      const xMax = 2 * Math.PI + 0.5;
      const yMin = -1.4;
      const yMax = 1.4;
      const sx = (x) => pad + ((x - xMin) / (xMax - xMin)) * (W - 2 * pad);
      const sy = (y) => pad + ((yMax - y) / (yMax - yMin)) * (H - 2 * pad);
      const pts = [];
      for (let i = 0; i <= 120; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 120;
        pts.push(`${sx(x)},${sy(Math.sin(x))}`);
      }
      const tLen = 0.9;
      const tx1 = x0 - tLen;
      const ty1 = y0 - m * tLen;
      const tx2 = x0 + tLen;
      const ty2 = y0 + m * tLen;
      return (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
          role="img"
          aria-label="derivative of sine"
        >
          <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="#bbb" />
          <path d={`M${pts.join(' L')}`} fill="none" stroke="#1565c0" strokeWidth="2" />
          <line x1={sx(tx1)} y1={sy(ty1)} x2={sx(tx2)} y2={sy(ty2)} stroke="#c62828" strokeWidth="2" />
          <circle cx={sx(x0)} cy={sy(y0)} r={5} fill="#ed6c02" />
          <text x={pad + 6} y={20} fontSize="11" fill="currentColor">
            slope at x₀ = cos(x₀) = {m.toFixed(3)}
          </text>
        </svg>
      );
    }

    // mode 0: A sin(bx) or A cos(bx)
    const xMin = 0;
    const xMax = 2 * Math.PI;
    const yMin = -amp - 0.3;
    const yMax = amp + 0.3;
    const sx = (x) => pad + ((x - xMin) / (xMax - xMin)) * (W - 2 * pad);
    const sy = (y) => pad + ((yMax - y) / (yMax - yMin)) * (H - 2 * pad);
    const f = (x) => (which === 0 ? A * Math.sin(b * x) : A * Math.cos(b * x));
    const pts = [];
    for (let i = 0; i <= 160; i += 1) {
      const x = xMin + ((xMax - xMin) * i) / 160;
      pts.push(`${sx(x)},${sy(f(x))}`);
    }
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
        role="img"
        aria-label="amplitude period frequency wave"
      >
        <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="#bbb" />
        <line x1={sx(0)} y1={pad} x2={sx(0)} y2={H - pad} stroke="#bbb" />
        <path d={`M${pts.join(' L')}`} fill="none" stroke="#1565c0" strokeWidth="2.2" />
        <line x1={pad} y1={sy(amp)} x2={W - pad} y2={sy(amp)} stroke="#2e7d32" strokeDasharray="4 3" />
        <line x1={pad} y1={sy(-amp)} x2={W - pad} y2={sy(-amp)} stroke="#2e7d32" strokeDasharray="4 3" />
        <text x={pad + 6} y={18} fontSize="11" fill="currentColor">
          |A|={amp.toFixed(2)} · period={period.toFixed(3)} · freq={freq.toFixed(2)}
        </text>
      </svg>
    );
  }, [mode, which, A, b, thetaDeg, x0Deg, W, H, pad, amp, period, freq]);

  const modeNames = ['A sin/cos(bx)', 'sinθ/θ limits', "Dₓ(sin)"];

  return (
    <ExplorerPanelLayout
      title="Trig differentiation"
      subtitle="Amplitude · period · frequency · key limits · sine slope"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel={modeNames[mode]}
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'view',
          meaning: '0 wave A·f(bx) · 1 lim sinθ/θ · 2 tangent to sin',
          min: 0,
          max: 2,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeNames[mode],
        },
        {
          key: 'which',
          label: 'wave',
          meaning: '0 → A sin(bx) · 1 → A cos(bx)',
          min: 0,
          max: 1,
          step: 1,
          value: which,
          onChange: setWhich,
          display: which === 0 ? 'sin' : 'cos',
        },
        {
          key: 'A',
          label: 'A',
          meaning: 'Amplitude scale (height |A|).',
          min: 0.25,
          max: 2.5,
          step: 0.05,
          value: A,
          onChange: setA,
          display: A.toFixed(2),
        },
        {
          key: 'b',
          label: 'b',
          meaning: 'Frequency factor; period = 2π/b.',
          min: 0.5,
          max: 6,
          step: 0.1,
          value: b,
          onChange: setB,
          display: b.toFixed(1),
        },
        {
          key: 'thetaDeg',
          label: 'θ°',
          meaning: 'Probe angle for lim sinθ/θ (mode 1).',
          min: -90,
          max: 90,
          step: 1,
          value: thetaDeg,
          onChange: setThetaDeg,
          display: `${thetaDeg}°`,
        },
        {
          key: 'x0Deg',
          label: 'x₀°',
          meaning: 'Point on sin where tangent slope = cos x₀ (mode 2).',
          min: 0,
          max: 360,
          step: 5,
          value: x0Deg,
          onChange: setX0Deg,
          display: `${x0Deg}°`,
        },
      ]}
      stats={[
        {label: 'period', value: period.toFixed(4)},
        {label: 'frequency', value: freq.toFixed(2)},
        {label: 'amplitude', value: amp.toFixed(2)},
      ]}
    />
  );
}

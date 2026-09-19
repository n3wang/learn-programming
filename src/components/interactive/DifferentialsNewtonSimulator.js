import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Differentials + Newton: toggle between linear approximation and root finding.
 */
export default function DifferentialsNewtonSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState('diff'); // 'diff' | 'newton'
  const [x0, setX0] = useState(16);
  const [dx, setDx] = useState(0.2);
  const [nStart, setNStart] = useState(1);
  const [steps, setSteps] = useState(4);

  const W = compact ? 300 : 400;
  const H = compact ? 240 : 300;
  const pad = 36;

  const approx = useMemo(() => {
    const f = Math.sqrt(x0);
    const fp = 1 / (2 * Math.sqrt(x0));
    const lin = f + fp * dx;
    const exact = Math.sqrt(x0 + dx);
    return {f, fp, lin, exact, err: lin - exact};
  }, [x0, dx]);

  const newton = useMemo(() => {
    const seq = [nStart];
    let x = nStart;
    for (let i = 0; i < steps; i += 1) {
      if (Math.abs(x) < 1e-12) break;
      x = (x * x + 3) / (2 * x); // sqrt(3)
      seq.push(x);
    }
    return {seq, target: Math.sqrt(3)};
  }, [nStart, steps]);

  const chart = useMemo(() => {
    if (mode === 'diff') {
      // y = sqrt(x) near x0
      const xmin = Math.max(0.5, x0 - 2);
      const xmax = x0 + 2;
      const ymin = 0;
      const ymax = Math.sqrt(xmax) + 0.5;
      const sx = (t) => pad + ((t - xmin) / (xmax - xmin)) * (W - 2 * pad);
      const sy = (v) => H - pad - ((v - ymin) / (ymax - ymin)) * (H - 2 * pad);
      const pts = [];
      for (let i = 0; i <= 40; i += 1) {
        const t = xmin + ((xmax - xmin) * i) / 40;
        pts.push(`${sx(t)},${sy(Math.sqrt(t))}`);
      }
      const px = sx(x0);
      const py = sy(approx.f);
      const qx = sx(x0 + dx);
      const qExact = sy(approx.exact);
      const qLin = sy(approx.lin);
      return (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
          role="img"
          aria-label="linear approximation for square root"
        >
          <polyline points={pts.join(' ')} fill="none" stroke="#1565c0" strokeWidth="2" />
          <line x1={px} y1={py} x2={qx} y2={qLin} stroke="#c62828" strokeWidth="2" />
          <circle cx={px} cy={py} r={4} fill="#1565c0" />
          <circle cx={qx} cy={qExact} r={4} fill="#2e7d32" />
          <circle cx={qx} cy={qLin} r={3.5} fill="#c62828" />
          <text x={pad} y={18} fontSize="11" fill="currentColor">
            √{x0}+Δx ≈ {approx.lin.toFixed(4)} (exact {approx.exact.toFixed(4)})
          </text>
        </svg>
      );
    }
    // Newton for x²−3
    const xmin = -0.5;
    const xmax = 3.5;
    const ymin = -3;
    const ymax = 6;
    const sx = (t) => pad + ((t - xmin) / (xmax - xmin)) * (W - 2 * pad);
    const sy = (v) => H - pad - ((v - ymin) / (ymax - ymin)) * (H - 2 * pad);
    const pts = [];
    for (let i = 0; i <= 50; i += 1) {
      const t = xmin + ((xmax - xmin) * i) / 50;
      pts.push(`${sx(t)},${sy(t * t - 3)}`);
    }
    const last = newton.seq[newton.seq.length - 1];
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
        role="img"
        aria-label="Newton method for square root of 3"
      >
        <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="#999" strokeWidth="1" />
        <polyline points={pts.join(' ')} fill="none" stroke="#1565c0" strokeWidth="2" />
        {newton.seq.slice(0, -1).map((xi, i) => {
          const yi = xi * xi - 3;
          const next = newton.seq[i + 1];
          return (
            <g key={`n-${i}`}>
              <line x1={sx(xi)} y1={sy(yi)} x2={sx(next)} y2={sy(0)} stroke="#c62828" strokeWidth="1.5" />
              <circle cx={sx(xi)} cy={sy(yi)} r={3.5} fill="#c62828" />
            </g>
          );
        })}
        <circle cx={sx(Math.sqrt(3))} cy={sy(0)} r={4} fill="#2e7d32" />
        <text x={pad} y={18} fontSize="11" fill="currentColor">
          xₙ ≈ {last.toFixed(8)} · √3 ≈ {newton.target.toFixed(8)}
        </text>
      </svg>
    );
  }, [mode, x0, dx, approx, newton, W, H, pad]);

  return (
    <ExplorerPanelLayout
      title={mode === 'diff' ? 'Linear approximation' : "Newton's method"}
      subtitle={
        mode === 'diff'
          ? 'f(x+Δx) ≈ f(x) + f′(x) Δx — try √x near 16'
          : 'xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) for f(x)=x²−3'
      }
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel={mode === 'diff' ? 'approx' : 'newton'}
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'mode',
          meaning: '0 = differential approx, 1 = Newton √3',
          min: 0,
          max: 1,
          step: 1,
          value: mode === 'diff' ? 0 : 1,
          onChange: (v) => setMode(v < 0.5 ? 'diff' : 'newton'),
          display: mode === 'diff' ? 'diff' : 'Newton',
        },
        ...(mode === 'diff'
          ? [
              {
                key: 'x0',
                label: 'x',
                meaning: 'Base point for √x.',
                min: 1,
                max: 25,
                step: 0.5,
                value: x0,
                onChange: setX0,
                display: x0.toFixed(1),
              },
              {
                key: 'dx',
                label: 'Δx',
                meaning: 'Increment.',
                min: -1,
                max: 2,
                step: 0.05,
                value: dx,
                onChange: setDx,
                display: dx.toFixed(2),
              },
            ]
          : [
              {
                key: 'nStart',
                label: 'x₀',
                meaning: 'Initial guess for √3.',
                min: 0.5,
                max: 3,
                step: 0.1,
                value: nStart,
                onChange: setNStart,
                display: nStart.toFixed(1),
              },
              {
                key: 'steps',
                label: 'n',
                meaning: 'Number of Newton steps.',
                min: 1,
                max: 8,
                step: 1,
                value: steps,
                onChange: setSteps,
                display: String(steps),
              },
            ]),
      ]}
      stats={
        mode === 'diff'
          ? [
              {label: 'f′ Δx', value: (approx.fp * dx).toFixed(5)},
              {label: 'approx', value: approx.lin.toFixed(5)},
              {label: 'error', value: approx.err.toFixed(5)},
            ]
          : [
              {label: 'xₙ', value: newton.seq[newton.seq.length - 1].toFixed(8)},
              {label: '√3', value: newton.target.toFixed(8)},
              {
                label: '|err|',
                value: Math.abs(newton.seq[newton.seq.length - 1] - newton.target).toExponential(2),
              },
            ]
      }
      note={
        mode === 'diff'
          ? 'df = f′(x) dx approximates the true change Δy = f(x+Δx)−f(x).'
          : 'Each tangent intercept becomes the next guess. Converges quickly when f′≠0 near a simple root.'
      }
    />
  );
}

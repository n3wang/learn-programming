import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Geometric views of relative extrema, Rolle, and the Mean Value Theorem.
 * mode: 0 = extrema, 1 = Rolle, 2 = MVT, 3 = increasing / decreasing
 */
export default function LawOfMeanSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState(2);
  const [a, setA] = useState(0.5);
  const [b, setB] = useState(3.2);
  const [xProbe, setXProbe] = useState(1.8);

  const left = Math.min(a, b - 0.2);
  const right = Math.max(b, a + 0.2);

  const model = useMemo(() => {
    const fExt = (x) => -0.15 * (x - 1) * (x - 1) * (x - 3.2) + 1.2;
    const fpExt = (x) => -0.15 * (3 * x * x - 8.4 * x + 5.2);

    const fRolle = (x) => Math.sin(Math.PI * ((x - left) / (right - left || 1)));
    const fpRolle = (x) => {
      const span = right - left || 1;
      return (Math.PI / span) * Math.cos(Math.PI * ((x - left) / span));
    };

    const fMvt = (x) => 0.35 * x * x - 0.1 * x + 0.8;
    const fpMvt = (x) => 0.7 * x - 0.1;

    const fMono = (x) => 0.4 * x + 0.2 * Math.sin(1.5 * x) + 0.5;
    const fpMono = (x) => 0.4 + 0.3 * Math.cos(1.5 * x);

    if (mode === 0) {
      return {f: fExt, fp: fpExt, xMin: 0, xMax: 4};
    }
    if (mode === 1) {
      return {f: fRolle, fp: fpRolle, xMin: left, xMax: right};
    }
    if (mode === 2) {
      return {f: fMvt, fp: fpMvt, xMin: left, xMax: right};
    }
    return {f: fMono, fp: fpMono, xMin: 0, xMax: 4};
  }, [mode, left, right]);

  const computed = useMemo(() => {
    const {f, fp, xMin, xMax} = model;
    const curve = [];
    for (let i = 0; i <= 100; i += 1) {
      const x = xMin + ((xMax - xMin) * i) / 100;
      curve.push({x, y: f(x)});
    }

    let xStar = xMin;
    if (mode === 0) {
      const disc = 8.4 * 8.4 - 4 * 3 * 5.2;
      const r1 = (8.4 - Math.sqrt(disc)) / 6;
      const r2 = (8.4 + Math.sqrt(disc)) / 6;
      xStar = Math.abs(xProbe - r1) < Math.abs(xProbe - r2) ? r1 : r2;
    } else if (mode === 1 || mode === 2) {
      const target = mode === 1 ? 0 : (f(right) - f(left)) / (right - left || 1);
      let best = (left + right) / 2;
      let bestAbs = Infinity;
      for (let i = 1; i < 200; i += 1) {
        const x = left + ((right - left) * i) / 200;
        const err = Math.abs(fp(x) - target);
        if (err < bestAbs) {
          bestAbs = err;
          best = x;
        }
      }
      xStar = best;
    } else {
      xStar = xProbe;
    }

    const secant = mode === 2 ? (f(right) - f(left)) / (right - left || 1) : 0;
    const slope = mode === 2 ? secant : mode === 1 ? 0 : fp(xStar);
    const yStar = f(xStar);
    const half = Math.max(0.4, (xMax - xMin) * 0.18);
    const tangent = [
      {x: xStar - half, y: yStar - slope * half},
      {x: xStar + half, y: yStar + slope * half},
    ];
    const chord =
      mode === 1 || mode === 2
        ? [
            {x: left, y: f(left)},
            {x: right, y: f(right)},
          ]
        : null;

    return {
      curve,
      chord,
      tangent,
      xStar,
      secant,
      fPrimeProbe: fp(xProbe),
      fa: f(left),
      fb: f(right),
      fpStar: fp(xStar),
      yStar,
      yProbe: f(xProbe),
    };
  }, [model, mode, left, right, xProbe]);

  const W = compact ? 280 : 420;
  const H = compact ? 220 : 300;
  const pad = 36;
  const ys = computed.curve.map((p) => p.y);
  const yMin = Math.min(...ys) - 0.25;
  const yMax = Math.max(...ys) + 0.25;
  const {xMin, xMax} = model;
  const toX = (x) => pad + ((x - xMin) / (xMax - xMin || 1)) * (W - 2 * pad);
  const toY = (y) => pad + ((yMax - y) / (yMax - yMin || 1)) * (H - 2 * pad);

  const dCurve = computed.curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(' ');
  const dTan = `M${toX(computed.tangent[0].x).toFixed(1)},${toY(computed.tangent[0].y).toFixed(1)} L${toX(computed.tangent[1].x).toFixed(1)},${toY(computed.tangent[1].y).toFixed(1)}`;
  const dChord = computed.chord
    ? `M${toX(computed.chord[0].x).toFixed(1)},${toY(computed.chord[0].y).toFixed(1)} L${toX(computed.chord[1].x).toFixed(1)},${toY(computed.chord[1].y).toFixed(1)}`
    : null;

  const legend =
    mode === 0
      ? 'orange = horizontal tangent at a nearby critical point'
      : mode === 1
        ? 'green = chord (equal ends) · orange = horizontal tangent (Rolle)'
        : mode === 2
          ? 'green = secant P₁P₂ · orange = parallel tangent (MVT)'
          : 'blue = probe · orange = tangent · sign of f′ predicts mono';

  const modeNames = ['extrema', 'Rolle', 'MVT', 'mono'];

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Law of the mean geometry"
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
      {dChord ? <path d={dChord} fill="none" stroke="#2e7d32" strokeWidth="2" strokeDasharray="5 3" /> : null}
      <path d={dTan} fill="none" stroke="#ed6c02" strokeWidth="2" />
      <circle cx={toX(computed.xStar)} cy={toY(computed.yStar)} r={4} fill="#ed6c02" />
      {mode === 1 || mode === 2 ? (
        <>
          <circle cx={toX(left)} cy={toY(computed.fa)} r={3.5} fill="#2e7d32" />
          <circle cx={toX(right)} cy={toY(computed.fb)} r={3.5} fill="#2e7d32" />
        </>
      ) : null}
      {mode === 3 ? <circle cx={toX(xProbe)} cy={toY(computed.yProbe)} r={3.5} fill="#1565c0" /> : null}
      <text x={12} y={18} fontSize="11" fill="currentColor">
        {legend}
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="Law of the mean"
      subtitle="Relative extrema · Rolle · MVT · monotone from f′"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="y = f(x)"
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'view',
          meaning: '0 extrema · 1 Rolle · 2 mean value · 3 increasing/decreasing probe',
          min: 0,
          max: 3,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeNames[mode],
        },
        {
          key: 'a',
          label: 'a',
          meaning: 'Left endpoint (Rolle / MVT).',
          min: 0.2,
          max: 2.5,
          step: 0.05,
          value: a,
          onChange: setA,
          display: a.toFixed(2),
        },
        {
          key: 'b',
          label: 'b',
          meaning: 'Right endpoint (kept strictly right of a).',
          min: 1.5,
          max: 3.8,
          step: 0.05,
          value: b,
          onChange: setB,
          display: b.toFixed(2),
        },
        {
          key: 'xProbe',
          label: 'x probe',
          meaning: 'Near a critical point (extrema) or sample f′ (mono view).',
          min: 0.3,
          max: 3.7,
          step: 0.05,
          value: xProbe,
          onChange: setXProbe,
          display: xProbe.toFixed(2),
        },
      ]}
      stats={[
        {label: 'x★', value: computed.xStar.toFixed(3)},
        {label: "f'(x★)", value: computed.fpStar.toFixed(3)},
        ...(mode === 2
          ? [
              {label: 'secant', value: computed.secant.toFixed(3)},
              {label: '|f′−sec|', value: Math.abs(computed.fpStar - computed.secant).toFixed(4)},
            ]
          : []),
        ...(mode === 3
          ? [
              {label: "f'(probe)", value: computed.fPrimeProbe.toFixed(3)},
              {
                label: 'trend',
                value:
                  computed.fPrimeProbe > 0.05
                    ? '↑ increasing'
                    : computed.fPrimeProbe < -0.05
                      ? '↓ decreasing'
                      : '~ flat',
              },
            ]
          : []),
        ...(mode === 1
          ? [
              {label: 'f(a)', value: computed.fa.toFixed(3)},
              {label: 'f(b)', value: computed.fb.toFixed(3)},
            ]
          : []),
      ]}
      note={
        mode === 2
          ? 'MVT: somewhere in (a,b) the tangent is parallel to the green secant.'
          : mode === 1
            ? 'Rolle: equal endpoint values ⇒ a horizontal tangent in between.'
            : mode === 0
              ? 'At a relative max/min where f′ exists, the tangent is horizontal (f′=0).'
              : 'If f′>0 on an interval then f is increasing; if f′<0 then decreasing.'
      }
    />
  );
}

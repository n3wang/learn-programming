import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Curve sketching: concavity / inflection, asymptotes, even-odd symmetry.
 * mode: 0 concavity+inflection, 1 vertical+horizontal asymptotes, 2 even/odd
 */
export default function CurveSketchingSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState(0);
  const [fn, setFn] = useState(0);
  const [x0, setX0] = useState(0);

  const specs = useMemo(
    () => [
      {
        name: 'x³',
        f: (x) => x ** 3,
        fpp: (x) => 6 * x,
        xMin: -1.6,
        xMax: 1.6,
        asymptotes: [],
      },
      {
        name: 'x⁴',
        f: (x) => x ** 4,
        fpp: (x) => 12 * x * x,
        xMin: -1.4,
        xMax: 1.4,
        asymptotes: [],
      },
      {
        name: '⅓x³+½x²−6x+8',
        f: (x) => (1 / 3) * x ** 3 + 0.5 * x * x - 6 * x + 8,
        fpp: (x) => 2 * x + 1,
        xMin: -4,
        xMax: 3,
        asymptotes: [],
      },
      {
        name: '1/x',
        f: (x) => (Math.abs(x) < 0.08 ? null : 1 / x),
        fpp: (x) => (Math.abs(x) < 0.08 ? null : 2 / x ** 3),
        xMin: -3,
        xMax: 3,
        asymptotes: [{type: 'v', x: 0}, {type: 'h', y: 0}],
      },
      {
        name: '(x+4)/(x−3)',
        f: (x) => (Math.abs(x - 3) < 0.08 ? null : (x + 4) / (x - 3)),
        fpp: () => null,
        xMin: -2,
        xMax: 8,
        asymptotes: [{type: 'v', x: 3}, {type: 'h', y: 1}],
      },
      {
        name: 'x² (even)',
        f: (x) => x * x,
        fpp: () => 2,
        xMin: -2,
        xMax: 2,
        asymptotes: [],
        parity: 'even',
      },
      {
        name: 'x³ (odd)',
        f: (x) => x ** 3,
        fpp: (x) => 6 * x,
        xMin: -1.6,
        xMax: 1.6,
        asymptotes: [],
        parity: 'odd',
      },
    ],
    [],
  );

  const spec = specs[Math.min(fn, specs.length - 1)];

  const computed = useMemo(() => {
    const {f, fpp, xMin, xMax, asymptotes} = spec;
    const curve = [];
    for (let i = 0; i <= 140; i += 1) {
      const x = xMin + ((xMax - xMin) * i) / 140;
      const y = f(x);
      if (y == null || !Number.isFinite(y) || Math.abs(y) > 12) {
        curve.push({x, y: null, break: true});
      } else {
        curve.push({x, y});
      }
    }
    const fpp0 = fpp(x0);
    const left = fpp(x0 - 0.35);
    const right = fpp(x0 + 0.35);
    let concavity = 'mixed / flat';
    if (fpp0 != null && Number.isFinite(fpp0)) {
      if (fpp0 > 1e-8) concavity = 'up (f″>0)';
      else if (fpp0 < -1e-8) concavity = 'down (f″<0)';
      else concavity = 'f″≈0 (check signs)';
    }
    const inflection =
      left != null &&
      right != null &&
      Number.isFinite(left) &&
      Number.isFinite(right) &&
      ((left < 0 && right > 0) || (left > 0 && right < 0));

    const a = 1.1;
    const fa = f(a);
    const fma = f(-a);
    let parity = 'neither';
    if (fa != null && fma != null && Number.isFinite(fa) && Number.isFinite(fma)) {
      if (Math.abs(fa - fma) < 1e-6) parity = 'even (y-axis)';
      else if (Math.abs(fa + fma) < 1e-6) parity = 'odd (origin)';
    }

    return {curve, fpp0, left, right, concavity, inflection, asymptotes, parity, xMin, xMax};
  }, [spec, x0]);

  const W = compact ? 280 : 420;
  const H = compact ? 220 : 300;
  const pad = 36;
  const ys = computed.curve.map((p) => p.y).filter((y) => y != null && Number.isFinite(y));
  const yMin = Math.min(...ys, -1) - 0.3;
  const yMax = Math.max(...ys, 1) + 0.3;
  const toX = (x) => pad + ((x - computed.xMin) / (computed.xMax - computed.xMin || 1)) * (W - 2 * pad);
  const toY = (y) => pad + ((yMax - y) / (yMax - yMin || 1)) * (H - 2 * pad);

  let dCurve = '';
  let started = false;
  for (const p of computed.curve) {
    if (p.y == null) {
      started = false;
      continue;
    }
    dCurve += `${started ? 'L' : 'M'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)} `;
    started = true;
  }

  const y0 = Math.max(yMin, Math.min(yMax, 0));
  const modeNames = ['concavity', 'asymptotes', 'even/odd'];
  const fnNames = specs.map((s) => s.name);

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Curve sketching explorer"
    >
      <rect
        x={pad}
        y={pad}
        width={W - 2 * pad}
        height={H - 2 * pad}
        fill="#fafafa"
        stroke="var(--ifm-color-emphasis-300)"
      />
      <line x1={pad} y1={toY(y0)} x2={W - pad} y2={toY(y0)} stroke="#bbb" strokeWidth="1" />
      {mode === 1
        ? computed.asymptotes.map((a, i) =>
            a.type === 'v' ? (
              <line
                key={`v${i}`}
                x1={toX(a.x)}
                y1={pad}
                x2={toX(a.x)}
                y2={H - pad}
                stroke="#c62828"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            ) : (
              <line
                key={`h${i}`}
                x1={pad}
                y1={toY(a.y)}
                x2={W - pad}
                y2={toY(a.y)}
                stroke="#2e7d32"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            ),
          )
        : null}
      <path d={dCurve} fill="none" stroke="#455a64" strokeWidth="2" />
      {mode === 0 && Number.isFinite(spec.f(x0)) ? (
        <circle
          cx={toX(x0)}
          cy={toY(spec.f(x0))}
          r={4}
          fill={computed.inflection ? '#6a1b9a' : '#ed6c02'}
        />
      ) : null}
      {mode === 2 ? (
        <>
          <circle cx={toX(1.1)} cy={toY(spec.f(1.1) ?? 0)} r={3.5} fill="#1565c0" />
          <circle cx={toX(-1.1)} cy={toY(spec.f(-1.1) ?? 0)} r={3.5} fill="#ef6c00" />
        </>
      ) : null}
      <text x={12} y={18} fontSize="11" fill="currentColor">
        {mode === 0
          ? 'orange probe · purple if inflection at probe'
          : mode === 1
            ? 'red = vertical asymptote · green = horizontal'
            : 'blue (x,y) · orange (−x, ·) for parity check'}
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="Curve sketching"
      subtitle="Concavity · inflection · asymptotes · even/odd"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="y = f(x)"
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'view',
          meaning: '0 concavity/inflection · 1 asymptotes · 2 even/odd symmetry',
          min: 0,
          max: 2,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeNames[mode],
        },
        {
          key: 'fn',
          label: 'f',
          meaning: 'Pick a demo curve (rational functions show asymptotes).',
          min: 0,
          max: specs.length - 1,
          step: 1,
          value: fn,
          onChange: setFn,
          display: fnNames[fn],
        },
        {
          key: 'x0',
          label: 'x₀',
          meaning: 'Probe point for concavity / inflection (mode 0).',
          min: -3,
          max: 3,
          step: 0.05,
          value: x0,
          onChange: setX0,
          display: x0.toFixed(2),
        },
      ]}
      stats={[
        ...(mode === 0
          ? [
              {label: "f''(x₀)", value: computed.fpp0 == null ? '—' : Number(computed.fpp0).toFixed(3)},
              {label: 'concavity', value: computed.concavity},
              {label: 'inflection?', value: computed.inflection ? 'yes (sign change)' : 'no'},
            ]
          : []),
        ...(mode === 1
          ? [
              {
                label: 'asymptotes',
                value:
                  computed.asymptotes.length === 0
                    ? 'none in demo'
                    : computed.asymptotes.map((a) => (a.type === 'v' ? `x=${a.x}` : `y=${a.y}`)).join(', '),
              },
            ]
          : []),
        ...(mode === 2 ? [{label: 'parity', value: computed.parity}] : []),
      ]}
      note={
        mode === 0
          ? 'f″>0 ⇒ concave up (cup); f″<0 ⇒ concave down (cap). Inflection needs a sign change of f″, not merely f″=0 (see x⁴).'
          : mode === 1
            ? 'Vertical: denominator zero with numerator nonzero. Horizontal: lim x→±∞ f(x)=y₀.'
            : 'Even ⇔ reflection in the y-axis; odd ⇔ 180° rotation about the origin.'
      }
    />
  );
}

import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Critical numbers, first/second derivative tests, absolute extrema on [a,b].
 * mode: 0 critical demo, 1 second-deriv test, 2 first-deriv test, 3 absolute on interval
 */
export default function ExtremeValuesSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState(2);
  const [fn, setFn] = useState(0); // which demo curve
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);

  const specs = useMemo(
    () => [
      {
        name: 'x⁴',
        f: (x) => x ** 4,
        fp: (x) => 4 * x ** 3,
        fpp: (x) => 12 * x ** 2,
        crit: [0],
        xMin: -1.4,
        xMax: 1.4,
      },
      {
        name: '−x⁴',
        f: (x) => -(x ** 4),
        fp: (x) => -4 * x ** 3,
        fpp: (x) => -12 * x ** 2,
        crit: [0],
        xMin: -1.4,
        xMax: 1.4,
      },
      {
        name: 'x³',
        f: (x) => x ** 3,
        fp: (x) => 3 * x ** 2,
        fpp: (x) => 6 * x,
        crit: [0],
        xMin: -1.4,
        xMax: 1.4,
      },
      {
        name: 'x³−x²−x+2',
        f: (x) => x ** 3 - x ** 2 - x + 2,
        fp: (x) => 3 * x ** 2 - 2 * x - 1,
        fpp: (x) => 6 * x - 2,
        crit: [1], // only in [0,2]; −1/3 outside
        xMin: -0.2,
        xMax: 2.2,
      },
      {
        name: '7x²−3x+5',
        f: (x) => 7 * x * x - 3 * x + 5,
        fp: (x) => 14 * x - 3,
        fpp: (x) => 14,
        crit: [3 / 14],
        xMin: -0.5,
        xMax: 1.2,
      },
    ],
    [],
  );

  const spec = specs[Math.min(fn, specs.length - 1)];
  const left = Math.min(a, b - 0.05);
  const right = Math.max(b, a + 0.05);

  const computed = useMemo(() => {
    const {f, fp, fpp, crit, xMin, xMax} = spec;
    const lo = mode === 3 ? left : xMin;
    const hi = mode === 3 ? right : xMax;
    const curve = [];
    for (let i = 0; i <= 120; i += 1) {
      const x = lo + ((hi - lo) * i) / 120;
      curve.push({x, y: f(x)});
    }
    const c0 = crit[0];
    const leftSign = fp(c0 - 0.15);
    const rightSign = fp(c0 + 0.15);
    const caseLabel =
      leftSign > 0 && rightSign < 0
        ? '{+, −} max'
        : leftSign < 0 && rightSign > 0
          ? '{−, +} min'
          : leftSign > 0 && rightSign > 0
            ? '{+, +} neither'
            : leftSign < 0 && rightSign < 0
              ? '{−, −} neither'
              : 'flat / unclear';

    const candidates =
      mode === 3
        ? [...crit.filter((c) => c > left && c < right), left, right]
        : crit;
    const values = candidates.map((x) => ({x, y: f(x)}));
    const absMax = values.reduce((m, p) => (p.y > m.y ? p : m), values[0]);
    const absMin = values.reduce((m, p) => (p.y < m.y ? p : m), values[0]);

    return {
      curve,
      c0,
      fpp0: fpp(c0),
      caseLabel,
      leftSign,
      rightSign,
      values,
      absMax,
      absMin,
      lo,
      hi,
    };
  }, [spec, mode, left, right]);

  const W = compact ? 280 : 420;
  const H = compact ? 220 : 300;
  const pad = 36;
  const ys = computed.curve.map((p) => p.y);
  const yMin = Math.min(...ys) - 0.2;
  const yMax = Math.max(...ys) + 0.2;
  const toX = (x) => pad + ((x - computed.lo) / (computed.hi - computed.lo || 1)) * (W - 2 * pad);
  const toY = (y) => pad + ((yMax - y) / (yMax - yMin || 1)) * (H - 2 * pad);
  const dCurve = computed.curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(' ');

  const modeNames = ['critical', '2nd test', '1st test', 'absolute'];
  const fnNames = specs.map((s) => s.name);

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Extreme values explorer"
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
      <circle cx={toX(computed.c0)} cy={toY(spec.f(computed.c0))} r={4} fill="#ed6c02" />
      {mode === 3
        ? computed.values.map((p) => (
            <circle key={p.x} cx={toX(p.x)} cy={toY(p.y)} r={3.5} fill="#2e7d32" />
          ))
        : null}
      <text x={12} y={18} fontSize="11" fill="currentColor">
        orange = critical · {mode === 3 ? 'green = table candidates' : 'slide function / mode'}
      </text>
    </svg>
  );

  const secondVerdict =
    computed.fpp0 > 1e-9 ? 'f″>0 → relative min' : computed.fpp0 < -1e-9 ? 'f″<0 → relative max' : 'f″=0 → inconclusive';

  return (
    <ExplorerPanelLayout
      title="Extreme values"
      subtitle="Critical numbers · 1st/2nd derivative tests · absolute on [a,b]"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="y = f(x)"
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'view',
          meaning: '0 critical · 1 second-derivative test · 2 first-derivative test · 3 absolute table',
          min: 0,
          max: 3,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeNames[mode],
        },
        {
          key: 'fn',
          label: 'f',
          meaning: '0 x⁴ · 1 −x⁴ · 2 x³ · 3 book cubic on [0,2] · 4 parabola',
          min: 0,
          max: 4,
          step: 1,
          value: fn,
          onChange: setFn,
          display: fnNames[fn],
        },
        {
          key: 'a',
          label: 'a',
          meaning: 'Left endpoint for absolute-extrema mode.',
          min: -1,
          max: 1.5,
          step: 0.05,
          value: a,
          onChange: setA,
          display: a.toFixed(2),
        },
        {
          key: 'b',
          label: 'b',
          meaning: 'Right endpoint for absolute-extrema mode.',
          min: 0.5,
          max: 2.5,
          step: 0.05,
          value: b,
          onChange: setB,
          display: b.toFixed(2),
        },
      ]}
      stats={[
        {label: 'c', value: computed.c0.toFixed(3)},
        {label: "f'(c)", value: spec.fp(computed.c0).toFixed(3)},
        ...(mode === 1 ? [{label: "f''(c)", value: computed.fpp0.toFixed(3)}, {label: '2nd', value: secondVerdict}] : []),
        ...(mode === 2
          ? [
              {label: "f' left", value: computed.leftSign.toFixed(3)},
              {label: "f' right", value: computed.rightSign.toFixed(3)},
              {label: '1st', value: computed.caseLabel},
            ]
          : []),
        ...(mode === 3
          ? [
              {label: 'abs max', value: `${computed.absMax.y.toFixed(3)} @ ${computed.absMax.x.toFixed(2)}`},
              {label: 'abs min', value: `${computed.absMin.y.toFixed(3)} @ ${computed.absMin.x.toFixed(2)}`},
            ]
          : []),
      ]}
      note={
        mode === 1
          ? 'Second derivative test needs f′(c)=0 and f″(c)≠0. If f″(c)=0, switch to the first-derivative test.'
          : mode === 2
            ? 'Sign change of f′ across c decides max/min; same sign ⇒ neither (e.g. x³ at 0).'
            : mode === 3
              ? 'Compare f at endpoints and interior critical numbers — largest/smallest win.'
              : 'Critical numbers: f′=0 or f′ undefined. Not every critical number is an extremum.'
      }
    />
  );
}

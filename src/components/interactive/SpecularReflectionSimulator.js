import React, {useMemo, useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Specular ray inside a unit circle: θ ← θ + 2φ each bounce.
 * Optional digit rounding to show accumulated round-off.
 *
 * @param {boolean} [embedded] — skip CEBlock chrome (for FormulaExplorerTabs)
 * @param {string} [refNote] — optional footnote under the controls
 */
export default function SpecularReflectionSimulator({compact, embedded, refNote} = {}) {
  const [phiDeg, setPhiDeg] = useState(36);
  const [bounces, setBounces] = useState(24);
  const [digits, setDigits] = useState(0); // 0 = full precision

  const {full, rounded, closedHint, ratio, gap, roundGap} = useMemo(() => {
    const phi = (phiDeg * Math.PI) / 180;
    const path = (useRound) => {
      const pts = [];
      let theta = 0;
      for (let i = 0; i <= bounces; i += 1) {
        const t = useRound ? roundN(theta, digits) : theta;
        pts.push({x: Math.cos(t), y: Math.sin(t), theta: t});
        let next = t + 2 * (useRound ? roundN(phi, digits) : phi);
        if (useRound && digits > 0) next = roundN(next, digits);
        theta = next;
      }
      return pts;
    };
    const fullPts = path(false);
    const roundPts = digits > 0 ? path(true) : fullPts;
    const ratio = phi / Math.PI;
    const closedHint = rationalish(ratio)
      ? `φ/π ≈ ${ratio.toFixed(4)} looks near-rational — full-precision rays tend to close.`
      : `φ/π ≈ ${ratio.toFixed(4)} is irrational-looking — the full-precision orbit densely fills a chord pattern.`;
    return {
      full: fullPts,
      rounded: roundPts,
      closedHint,
      ratio,
      gap: chordGap(fullPts),
      roundGap: digits > 0 ? chordGap(roundPts) : null,
    };
  }, [phiDeg, bounces, digits]);

  const W = compact ? 280 : 400;
  const H = compact ? 220 : 300;
  const cx = W / 2;
  const cy = H / 2 - 4;
  const R = Math.min(cx, cy) - 22;

  const toScreen = (p) => ({x: cx + p.x * R, y: cy - p.y * R});

  const poly = (pts, color, width) => {
    const d = pts.map(toScreen);
    return d.slice(0, -1).map((a, i) => (
      <line
        key={`${color}-${i}`}
        x1={a.x}
        y1={a.y}
        x2={d[i + 1].x}
        y2={d[i + 1].y}
        stroke={color}
        strokeWidth={width}
        opacity={0.85}
      />
    ));
  };

  const stats = [
    {label: 'φ', value: `${phiDeg}°`},
    {label: 'φ/π', value: ratio.toFixed(4)},
    {label: 'bounces', value: String(bounces)},
    {label: 'digits', value: digits === 0 ? 'off' : String(digits)},
    {label: '|Δθ| mod 2π', value: gap.toExponential(2)},
  ];
  if (roundGap != null) {
    stats.push({label: 'rounded |Δθ|', value: roundGap.toExponential(2)});
  }

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Specular ray path inside a unit circle"
    >
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="var(--ifm-color-emphasis-400)"
        strokeWidth="2"
      />
      {poly(full, '#1976d2', 1.6)}
      {digits > 0 ? poly(rounded, '#e65100', 1.4) : null}
      {full.slice(0, Math.min(12, full.length)).map((p, i) => {
        const s = toScreen(p);
        return (
          <circle
            key={`d-${i}`}
            cx={s.x}
            cy={s.y}
            r={i === 0 ? 3.5 : 2.2}
            fill={i === 0 ? '#c62828' : '#1976d2'}
          />
        );
      })}
      <text x={10} y={16} fontSize="11" fill="currentColor">
        blue = full precision{digits > 0 ? ' · orange = rounded' : ''}
      </text>
    </svg>
  );

  return (
    <ExplorerPanelLayout
      title="Specular reflection in a circle"
      subtitle="θ ← θ + 2φ each bounce · optional digit rounding shows coherent round-off"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="Orbit"
      chart={chart}
      params={[
        {
          key: 'phi',
          label: 'φ (degrees)',
          meaning: 'Fixed grazing angle. Each bounce advances θ by 2φ.',
          min: 5,
          max: 80,
          step: 1,
          value: phiDeg,
          onChange: setPhiDeg,
          display: `${phiDeg}°`,
        },
        {
          key: 'bounces',
          label: 'bounces',
          meaning: 'How many reflections to draw (including the start point).',
          min: 4,
          max: 80,
          step: 1,
          value: bounces,
          onChange: setBounces,
          display: String(bounces),
        },
        {
          key: 'digits',
          label: 'round digits',
          meaning: '0 = full precision. ≥1 rounds φ and θ each step (orange path).',
          min: 0,
          max: 6,
          step: 1,
          value: digits,
          onChange: setDigits,
          display: digits === 0 ? 'off' : String(digits),
        },
      ]}
      stats={stats}
      note={closedHint}
    />
  );
}

function roundN(x, n) {
  if (!n) return x;
  const f = 10 ** n;
  return Math.round(x * f) / f;
}

function rationalish(r) {
  for (let m = 1; m <= 24; m += 1) {
    const n = Math.round(r * m);
    if (Math.abs(r - n / m) < 1e-3) return true;
  }
  return false;
}

/** Smallest absolute angle between first and last hit, mod 2π. */
function chordGap(pts) {
  if (!pts.length) return 0;
  const a = pts[0].theta;
  const b = pts[pts.length - 1].theta;
  let d = Math.abs(b - a) % (2 * Math.PI);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d;
}

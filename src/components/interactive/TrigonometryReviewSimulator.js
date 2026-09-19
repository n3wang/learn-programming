import React, {useState} from 'react';
import ExplorerPanelLayout from './ExplorerPanelLayout';

/**
 * Trig review: radians, unit-circle sin/cos, directed angles.
 * mode: 0 radian probe, 1 unit-circle sin/cos, 2 degree↔radian
 */
export default function TrigonometryReviewSimulator({compact, embedded, refNote} = {}) {
  const [mode, setMode] = useState(1);
  const [thetaDeg, setThetaDeg] = useState(60);
  const [r, setR] = useState(1);

  const theta = (thetaDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const W = compact ? 280 : 400;
  const H = compact ? 240 : 300;
  const pad = 28;
  const cx = W / 2;
  const cy = H / 2 + 4;
  const R = Math.min(W, H) / 2 - pad;

  const bx = cx + R * cos;
  const by = cy - R * sin;

  const chart = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{maxWidth: W, display: 'block', background: 'var(--ifm-background-surface-color, #fff)'}}
      role="img"
      aria-label="Trigonometry review explorer"
    >
      <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="#fafafa" stroke="var(--ifm-color-emphasis-300)" />
      <line x1={pad} y1={cy} x2={W - pad} y2={cy} stroke="#bbb" />
      <line x1={cx} y1={pad} x2={cx} y2={H - pad} stroke="#bbb" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#455a64" strokeWidth="2" />
      <line x1={cx} y1={cy} x2={bx} y2={by} stroke="#1565c0" strokeWidth="2.5" />
      <circle cx={bx} cy={by} r={5} fill="#ed6c02" />
      <line x1={bx} y1={by} x2={bx} y2={cy} stroke="#2e7d32" strokeDasharray="4 3" />
      <line x1={cx} y1={by} x2={bx} y2={by} stroke="#6a1b9a" strokeDasharray="4 3" />
      {/* arc from positive x-axis */}
      <path
        d={arcPath(cx, cy, R * 0.32, theta)}
        fill="none"
        stroke="#c62828"
        strokeWidth="2"
      />
      <text x={12} y={18} fontSize="11" fill="currentColor">
        orange = B(cos θ, sin θ) · green = cos · purple = sin
      </text>
    </svg>
  );

  const modeNames = ['arc s=rθ', 'unit circle', 'convert'];
  const radLabel = `${(theta / Math.PI).toFixed(3)}π`;

  return (
    <ExplorerPanelLayout
      title="Trigonometry review"
      subtitle="Radians · unit-circle sine/cosine · directed angles"
      compact={compact}
      embedded={embedded}
      refNote={refNote}
      chartLabel="unit circle"
      chart={chart}
      params={[
        {
          key: 'mode',
          label: 'view',
          meaning: '0 arc length · 1 unit-circle coords · 2 degree/radian readout',
          min: 0,
          max: 2,
          step: 1,
          value: mode,
          onChange: setMode,
          display: modeNames[mode],
        },
        {
          key: 'thetaDeg',
          label: 'θ°',
          meaning: 'Directed angle in degrees (positive = counterclockwise).',
          min: -360,
          max: 720,
          step: 5,
          value: thetaDeg,
          onChange: setThetaDeg,
          display: `${thetaDeg}°`,
        },
        {
          key: 'r',
          label: 'r',
          meaning: 'Radius for arc-length mode s = rθ (θ in radians).',
          min: 0.5,
          max: 3,
          step: 0.1,
          value: r,
          onChange: setR,
          display: r.toFixed(1),
        },
      ]}
      stats={[
        {label: 'θ rad', value: theta.toFixed(4)},
        {label: '≈', value: radLabel},
        {label: 'cos θ', value: cos.toFixed(4)},
        {label: 'sin θ', value: sin.toFixed(4)},
        ...(mode === 0 ? [{label: 's=rθ', value: (r * theta).toFixed(4)}] : []),
        ...(mode === 2
          ? [
              {label: '1 rad ≈', value: `${(180 / Math.PI).toFixed(2)}°`},
              {label: '1° ≈', value: `${(Math.PI / 180).toFixed(5)} rad`},
            ]
          : []),
      ]}
      note={
        mode === 0
          ? 'With θ in radians, arc length on a circle of radius r is s = rθ.'
          : mode === 1
            ? 'On the unit circle, cos θ is the x-coordinate and sin θ is the y-coordinate of the terminal point.'
            : '1 radian = 180/π degrees ≈ 57.3°. Calculus uses radians so derivative formulas stay clean.'
      }
    />
  );
}

/** Draw an arc from the positive x-axis through signed radian angle θ (math CCW). */
function arcPath(cx, cy, radius, theta) {
  const x0 = cx + radius;
  const y0 = cy;
  const x1 = cx + radius * Math.cos(theta);
  const y1 = cy - radius * Math.sin(theta);
  const large = Math.abs(theta) > Math.PI ? 1 : 0;
  // sweep-flag 0 = CCW in SVG when y grows downward? Actually in SVG, sweep=1 is CW.
  // Math CCW with y-down screen: use sweep=0 for positive θ.
  const sweep = theta >= 0 ? 0 : 1;
  return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} ${sweep} ${x1} ${y1}`;
}

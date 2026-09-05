import React, {useMemo} from 'react';

const PAD = {top: 12, right: 12, bottom: 28, left: 40};

/**
 * Lightweight SVG charts — bars, line, scatter, or heatmap. No chart libraries.
 *
 * series: [{x, y, label?, highlight?}]  or for heatmap cells: [{i, j, v, label?}]
 */
export default function FormulaChart({
  type = 'bar',
  series = [],
  width = 520,
  height = 220,
  yLabel = '',
  shadeToX = null,
  refLineX = null,
  refLineY = null,
}) {
  const layout = useMemo(() => {
    const innerW = width - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;

    if (type === 'heatmap') {
      const maxI = Math.max(0, ...series.map((c) => c.i));
      const maxJ = Math.max(0, ...series.map((c) => c.j));
      const cols = maxJ + 1;
      const rows = maxI + 1;
      const maxV = Math.max(1e-12, ...series.map((c) => c.v));
      return {innerW, innerH, cols, rows, maxV};
    }

    const ys = series.map((p) => p.y);
    const xs = series.map((p) => p.x);
    const yMinRaw = ys.length ? Math.min(...ys) : 0;
    const yMaxRaw = ys.length ? Math.max(...ys) : 1;
    const padY = type === 'scatter' || type === 'line' ? (yMaxRaw - yMinRaw) * 0.08 || 0.1 : 0;
    const yMin = type === 'bar' || type === 'stem' ? 0 : yMinRaw - padY;
    const yMax = Math.max(yMin + 1e-9, yMaxRaw + (type === 'bar' ? yMaxRaw * 0.08 : padY));
    const xMin = xs.length ? Math.min(...xs) : 0;
    const xMax = xs.length ? Math.max(...xs) : 1;
    const xSpan = xMax - xMin || 1;
    return {innerW, innerH, yMin, yMax, xMin, xMax, xSpan};
  }, [series, type, width, height]);

  if (!series.length) {
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="empty chart">
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="13">
          No data
        </text>
      </svg>
    );
  }

  if (type === 'heatmap') {
    const {innerW, innerH, cols, rows, maxV} = layout;
    const cw = innerW / cols;
    const rh = innerH / rows;
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="heatmap">
        {series.map((c) => {
          const intensity = c.v / maxV;
          const fill = `rgba(25, 118, 210, ${0.15 + 0.75 * intensity})`;
          const x = PAD.left + c.j * cw;
          const y = PAD.top + c.i * rh;
          return (
            <g key={`${c.i}-${c.j}`}>
              <rect x={x} y={y} width={cw - 2} height={rh - 2} fill={fill} stroke="var(--ifm-color-emphasis-300)" />
              <text
                x={x + cw / 2}
                y={y + rh / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="currentColor"
              >
                {c.label ?? c.v.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  const {innerW, innerH, yMin, yMax, xMin, xSpan} = layout;
  const yScale = (y) => PAD.top + innerH - ((y - yMin) / (yMax - yMin)) * innerH;
  const xScale = (x) => PAD.left + ((x - xMin) / xSpan) * innerW;

  const ticks = [0, 0.5, 1].map((t) => yMin + (yMax - yMin) * t);

  const refLines = (
    <>
      {refLineX != null && Number.isFinite(refLineX) ? (
        <line
          x1={xScale(refLineX)}
          x2={xScale(refLineX)}
          y1={PAD.top}
          y2={PAD.top + innerH}
          stroke="#ed6c02"
          strokeDasharray="4 3"
          strokeWidth="1.5"
        />
      ) : null}
      {refLineY != null && Number.isFinite(refLineY) ? (
        <line
          x1={PAD.left}
          x2={PAD.left + innerW}
          y1={yScale(refLineY)}
          y2={yScale(refLineY)}
          stroke="#2e7d32"
          strokeDasharray="4 3"
          strokeWidth="1.5"
        />
      ) : null}
    </>
  );

  if (type === 'scatter') {
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="scatter chart">
        {ticks.map((t) => (
          <line
            key={t}
            x1={PAD.left}
            x2={PAD.left + innerW}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="var(--ifm-color-emphasis-200)"
            strokeWidth="1"
          />
        ))}
        {refLines}
        {series.map((p, i) => (
          <circle
            key={i}
            cx={xScale(p.x)}
            cy={yScale(p.y)}
            r={p.highlight ? 4 : 3}
            fill={p.highlight ? '#ed6c02' : '#1976d2'}
            opacity={0.75}
          />
        ))}
        <text x={PAD.left + innerW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.75">
          {yLabel || 'x'}
        </text>
      </svg>
    );
  }

  if (type === 'line') {
    const pts = series.map((p) => `${xScale(p.x)},${yScale(p.y)}`).join(' ');
    let shadePath = null;
    if (shadeToX != null && Number.isFinite(shadeToX)) {
      const left = series.filter((p) => p.x <= shadeToX);
      if (left.length) {
        const baseY = yScale(Math.max(0, yMin));
        const first = left[0];
        const last = left[left.length - 1];
        shadePath = [
          `M ${xScale(first.x)} ${baseY}`,
          ...left.map((p) => `L ${xScale(p.x)} ${yScale(p.y)}`),
          `L ${xScale(last.x)} ${baseY}`,
          'Z',
        ].join(' ');
      }
    }
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="line chart">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={PAD.left + innerW}
              y1={yScale(t)}
              y2={yScale(t)}
              stroke="var(--ifm-color-emphasis-200)"
              strokeWidth="1"
            />
            <text x={PAD.left - 6} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="currentColor" opacity="0.7">
              {t.toFixed(Math.abs(t) >= 1 ? 2 : 3)}
            </text>
          </g>
        ))}
        {refLines}
        {shadePath ? <path d={shadePath} fill="rgba(25, 118, 210, 0.2)" /> : null}
        <polyline fill="none" stroke="#1976d2" strokeWidth="2" points={pts} />
        {series
          .filter((p) => p.highlight)
          .map((p) => (
            <circle key={`h-${p.x}`} cx={xScale(p.x)} cy={yScale(p.y)} r="4" fill="#ed6c02" />
          ))}
        <text x={PAD.left + innerW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.75">
          {yLabel || 'x'}
        </text>
      </svg>
    );
  }

  // bar / stem — contiguous histogram-style bars (no gaps)
  const n = series.length;
  const gap = 0;
  const barW = Math.max(2, innerW / n);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="bar chart">
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={PAD.left + innerW}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="var(--ifm-color-emphasis-200)"
            strokeWidth="1"
          />
          <text x={PAD.left - 6} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="currentColor" opacity="0.7">
            {t.toFixed(t >= 1 ? 2 : 3)}
          </text>
        </g>
      ))}
      {refLines}
      {series.map((p, i) => {
        const x = PAD.left + i * barW;
        const y = yScale(p.y);
        const h = PAD.top + innerH - y;
        return (
          <g key={`${p.x}-${i}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(0, h)}
              fill={p.highlight ? '#ed6c02' : '#1976d2'}
              opacity={p.highlight ? 1 : 0.9}
              stroke="var(--ifm-background-color, #fff)"
              strokeWidth={n <= 24 ? 1 : 0}
            />
            {(n <= 24 || p.highlight || i === 0 || i === n - 1 || i === Math.floor(n / 2)) && (
              <text
                x={x + barW / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                opacity="0.75"
              >
                {p.label ?? p.x}
              </text>
            )}
          </g>
        );
      })}
      {yLabel ? (
        <text x={PAD.left + innerW / 2} y={height - 1} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">
          {yLabel}
        </text>
      ) : null}
    </svg>
  );
}

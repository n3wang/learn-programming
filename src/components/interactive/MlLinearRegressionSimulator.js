import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const DATASETS = {
  linear: {
    label: 'Linear',
    hint: 'Clear linear trend — OLS recovers slope ≈ 2, intercept ≈ 1.',
    points: [
      [0, 1.1],
      [1, 2.9],
      [2, 5.2],
      [3, 6.8],
      [4, 9.1],
      [5, 10.8],
      [6, 13.2],
      [7, 14.9],
    ],
  },
  noisy: {
    label: 'Noisy',
    hint: 'Same slope family, more residual scatter — R² drops, line still roughly tracks.',
    points: [
      [0, 0.5],
      [1, 4.2],
      [2, 3.8],
      [3, 8.5],
      [4, 7.0],
      [5, 12.5],
      [6, 11.0],
      [7, 16.2],
    ],
  },
  outlier: {
    label: 'Outlier',
    hint: 'One wild point pulls the OLS line — leverage matters.',
    points: [
      [0, 1.0],
      [1, 3.1],
      [2, 5.0],
      [3, 7.2],
      [4, 8.9],
      [5, 11.0],
      [6, 13.1],
      [7, 28.0],
    ],
  },
};

const LEGEND = [
  {key: 'P', label: 'Data', color: '#1976d2', desc: 'Observed (x, y)'},
  {key: 'L', label: 'OLS fit', color: '#d32f2f', desc: 'ŷ = β₀ + β₁x'},
  {key: 'R', label: 'Residual', color: '#9e9e9e', desc: 'Vertical eᵢ = yᵢ − ŷᵢ'},
];

function ols(points) {
  const n = points.length;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const den = n * sxx - sx * sx;
  const b1 = (n * sxy - sx * sy) / den;
  const b0 = (sy - b1 * sx) / n;
  let ssRes = 0;
  let ssTot = 0;
  const ybar = sy / n;
  for (const [x, y] of points) {
    const yhat = b0 + b1 * x;
    ssRes += (y - yhat) ** 2;
    ssTot += (y - ybar) ** 2;
  }
  const r2 = 1 - ssRes / ssTot;
  const mse = ssRes / n;
  return {
    b0: Math.round(b0 * 100) / 100,
    b1: Math.round(b1 * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    mse: Math.round(mse * 100) / 100,
  };
}

export default function MlLinearRegressionSimulator() {
  const [id, setId] = useState('linear');
  const ds = DATASETS[id];
  const fit = useMemo(() => ols(ds.points), [ds]);

  const W = 420;
  const H = 220;
  const pad = {l: 36, r: 12, t: 12, b: 28};
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const xs = ds.points.map((p) => p[0]);
  const ys = ds.points.map((p) => p[1]);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const ymin = Math.min(0, ...ys);
  const ymax = Math.max(...ys) * 1.05;

  const sx = (x) => pad.l + ((x - xmin) / (xmax - xmin || 1)) * plotW;
  const sy = (y) => pad.t + (1 - (y - ymin) / (ymax - ymin || 1)) * plotH;

  const x0 = xmin;
  const x1 = xmax;
  const y0 = fit.b0 + fit.b1 * x0;
  const y1 = fit.b0 + fit.b1 * x1;

  return (
    <CEBlock
      title="OLS fit lab"
      subtitle="Ordinary least squares line, residuals, and R² on tiny datasets"
      legend={<ColorLegend items={LEGEND} />}
    >
      <Stack direction="row" spacing={1} sx={{mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        {Object.entries(DATASETS).map(([key, d]) => (
          <Chip
            key={key}
            label={d.label}
            size="small"
            color={id === key ? 'primary' : 'default'}
            variant={id === key ? 'filled' : 'outlined'}
            onClick={() => setId(key)}
            sx={{cursor: 'pointer'}}
          />
        ))}
      </Stack>

      <Typography variant="body2" sx={{mb: 1.5}}>
        {ds.hint}
      </Typography>

      <Box sx={{overflowX: 'auto'}}>
        <svg width={W} height={H} role="img" aria-label="Linear regression scatter with OLS line">
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + plotH} stroke="#9e9e9e" />
          <line
            x1={pad.l}
            y1={pad.t + plotH}
            x2={pad.l + plotW}
            y2={pad.t + plotH}
            stroke="#9e9e9e"
          />
          {ds.points.map(([x, y], i) => {
            const yhat = fit.b0 + fit.b1 * x;
            return (
              <g key={i}>
                <line
                  x1={sx(x)}
                  y1={sy(y)}
                  x2={sx(x)}
                  y2={sy(yhat)}
                  stroke="#bdbdbd"
                  strokeWidth={1.5}
                />
                <circle cx={sx(x)} cy={sy(y)} r={4.5} fill="#1976d2" />
              </g>
            );
          })}
          <line
            x1={sx(x0)}
            y1={sy(y0)}
            x2={sx(x1)}
            y2={sy(y1)}
            stroke="#d32f2f"
            strokeWidth={2.5}
          />
          <text x={pad.l + plotW / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="#757575">
            x →
          </text>
        </svg>
      </Box>

      <Stack direction="row" spacing={1} sx={{mt: 1, flexWrap: 'wrap', gap: 1}}>
        <Chip size="small" label={`β₀ ≈ ${fit.b0}`} />
        <Chip size="small" label={`β₁ ≈ ${fit.b1}`} color="primary" />
        <Chip size="small" label={`R² ≈ ${fit.r2}`} color="success" />
        <Chip size="small" label={`MSE ≈ ${fit.mse}`} color="warning" />
      </Stack>
      <Typography variant="body2" sx={{mt: 1.25}}>
        Gray stems are residuals. OLS picks β to minimize ∑(y − ŷ)².
      </Typography>
    </CEBlock>
  );
}

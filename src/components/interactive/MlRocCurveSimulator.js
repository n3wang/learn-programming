import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const CURVES = {
  strong: {
    label: 'Strong',
    hint: 'Hugs top-left — high TPR at low FPR. AUC near 1.',
    // points as [fpr, tpr]
    pts: [
      [0, 0],
      [0.02, 0.55],
      [0.05, 0.78],
      [0.1, 0.9],
      [0.2, 0.96],
      [0.4, 0.99],
      [1, 1],
    ],
  },
  medium: {
    label: 'Medium',
    hint: 'Useful but not stellar separation.',
    pts: [
      [0, 0],
      [0.1, 0.35],
      [0.25, 0.55],
      [0.4, 0.7],
      [0.6, 0.82],
      [0.8, 0.92],
      [1, 1],
    ],
  },
  weak: {
    label: 'Near chance',
    hint: 'Close to the diagonal — little better than random.',
    pts: [
      [0, 0],
      [0.2, 0.22],
      [0.4, 0.42],
      [0.6, 0.58],
      [0.8, 0.78],
      [1, 1],
    ],
  },
};

const LEGEND = [
  {key: 'R', label: 'ROC', color: '#1976d2', desc: 'TPR vs FPR across thresholds'},
  {key: 'C', label: 'Chance', color: '#9e9e9e', desc: 'Random classifier diagonal'},
];

function auc(pts) {
  let a = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    a += ((y0 + y1) / 2) * (x1 - x0);
  }
  return Math.round(a * 100) / 100;
}

export default function MlRocCurveSimulator() {
  const [id, setId] = useState('strong');
  const curve = CURVES[id];
  const area = useMemo(() => auc(curve.pts), [curve]);

  const W = 360;
  const H = 260;
  const pad = 36;
  const plot = W - pad * 2;

  const sx = (fpr) => pad + fpr * plot;
  const sy = (tpr) => pad + (1 - tpr) * plot;
  const path = curve.pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`)
    .join(' ');

  return (
    <CEBlock
      title="ROC / AUC lab"
      subtitle="True positive rate vs false positive rate as you sweep the threshold"
      legend={<ColorLegend items={LEGEND} />}
    >
      <Stack direction="row" spacing={1} sx={{mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        {Object.entries(CURVES).map(([key, c]) => (
          <Chip
            key={key}
            label={c.label}
            size="small"
            color={id === key ? 'primary' : 'default'}
            variant={id === key ? 'filled' : 'outlined'}
            onClick={() => setId(key)}
            sx={{cursor: 'pointer'}}
          />
        ))}
      </Stack>
      <Typography variant="body2" sx={{mb: 1.5}}>
        {curve.hint}
      </Typography>
      <Box sx={{overflowX: 'auto'}}>
        <svg width={W} height={H} role="img" aria-label="ROC curve">
          <line x1={pad} y1={pad} x2={pad} y2={pad + plot} stroke="#9e9e9e" />
          <line x1={pad} y1={pad + plot} x2={pad + plot} y2={pad + plot} stroke="#9e9e9e" />
          <line
            x1={pad}
            y1={pad + plot}
            x2={pad + plot}
            y2={pad}
            stroke="#bdbdbd"
            strokeDasharray="4 4"
          />
          <path d={path} fill="none" stroke="#1976d2" strokeWidth={2.5} />
          <text x={pad + plot / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#757575">
            False positive rate →
          </text>
          <text
            x={12}
            y={pad + plot / 2}
            textAnchor="middle"
            fontSize={11}
            fill="#757575"
            transform={`rotate(-90 12 ${pad + plot / 2})`}
          >
            True positive rate →
          </text>
        </svg>
      </Box>
      <Chip size="small" label={`AUC ≈ ${area}`} color="success" />
    </CEBlock>
  );
}

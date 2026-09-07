import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const SCENARIOS = {
  healthy: {
    label: 'Healthy',
    hint: 'Train and validation both improve and stay close — capacity matches the data.',
    train: (t) => 0.55 + 0.4 * (1 - Math.exp(-t / 80)),
    val: (t) => 0.52 + 0.38 * (1 - Math.exp(-t / 90)),
  },
  overfit: {
    label: 'Overfitting',
    hint: 'Train keeps rising while validation stalls then drops — stop early / regularize.',
    train: (t) => 0.5 + 0.48 * (1 - Math.exp(-t / 60)),
    val: (t) => {
      const rise = 0.48 + 0.32 * (1 - Math.exp(-t / 70));
      const drop = t > 220 ? 0.12 * ((t - 220) / 280) : 0;
      return Math.max(0.35, rise - drop);
    },
  },
  underfit: {
    label: 'Underfitting',
    hint: 'Both curves plateau low — model is too simple or features are weak.',
    train: (t) => 0.45 + 0.18 * (1 - Math.exp(-t / 50)),
    val: (t) => 0.43 + 0.17 * (1 - Math.exp(-t / 55)),
  },
  gap: {
    label: 'Train–val gap',
    hint: 'Persistent large gap that never closes — data may be non-representative or leaking.',
    train: (t) => 0.58 + 0.38 * (1 - Math.exp(-t / 70)),
    val: (t) => 0.4 + 0.12 * (1 - Math.exp(-t / 100)),
  },
};

const LEGEND = [
  {key: 'Tr', label: 'Train metric', color: '#1976d2', desc: 'Performance on training data'},
  {key: 'Va', label: 'Validation metric', color: '#d32f2f', desc: 'Held-out performance'},
];

const ITERATIONS = 500;
const SAMPLE = 50;

function series(fn) {
  const pts = [];
  for (let i = 0; i <= SAMPLE; i += 1) {
    const t = (i / SAMPLE) * ITERATIONS;
    pts.push({t, y: fn(t)});
  }
  return pts;
}

function polyline(pts, x0, y0, w, h) {
  return pts
    .map((p, i) => {
      const x = x0 + (p.t / ITERATIONS) * w;
      const y = y0 + (1 - p.y) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function MlLearningCurvesSimulator() {
  const [scenarioId, setScenarioId] = useState('overfit');
  const scenario = SCENARIOS[scenarioId];

  const {trainPts, valPts, lastTrain, lastVal, verdict} = useMemo(() => {
    const trainPts = series(scenario.train);
    const valPts = series(scenario.val);
    const lastTrain = trainPts[trainPts.length - 1].y;
    const lastVal = valPts[valPts.length - 1].y;
    const midVal = valPts[Math.floor(valPts.length * 0.55)].y;
    let verdict = 'Curves look aligned.';
    if (scenarioId === 'overfit' || lastTrain - lastVal > 0.15) {
      verdict =
        lastVal < midVal - 0.02
          ? 'Validation peaked then worsened → overfitting; consider early stopping.'
          : 'Large train ≫ val gap → high variance / overfit risk.';
    } else if (scenarioId === 'underfit') {
      verdict = 'Both metrics stuck low → underfitting; add capacity or better features.';
    } else if (scenarioId === 'gap') {
      verdict = 'Gap stays wide as iterations grow → check data representativeness / leakage.';
    } else {
      verdict = 'Train and validation rise together → healthy learning.';
    }
    return {trainPts, valPts, lastTrain, lastVal, verdict};
  }, [scenario, scenarioId]);

  const W = 420;
  const H = 200;
  const pad = {l: 36, r: 12, t: 12, b: 28};
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  return (
    <CEBlock
      title="Learning curves lab"
      subtitle="Compare train vs validation metrics over training iterations"
      legend={<ColorLegend items={LEGEND} />}
    >
      <Stack direction="row" spacing={1} sx={{mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        {Object.entries(SCENARIOS).map(([id, s]) => (
          <Chip
            key={id}
            label={s.label}
            size="small"
            color={scenarioId === id ? 'primary' : 'default'}
            variant={scenarioId === id ? 'filled' : 'outlined'}
            onClick={() => setScenarioId(id)}
            sx={{cursor: 'pointer'}}
          />
        ))}
      </Stack>

      <Typography variant="body2" sx={{mb: 1.5}}>
        {scenario.hint}
      </Typography>

      <Box sx={{overflowX: 'auto'}}>
        <svg width={W} height={H} role="img" aria-label="Learning curves chart">
          <rect x={0} y={0} width={W} height={H} fill="transparent" />
          {/* axes */}
          <line
            x1={pad.l}
            y1={pad.t}
            x2={pad.l}
            y2={pad.t + plotH}
            stroke="#9e9e9e"
            strokeWidth={1}
          />
          <line
            x1={pad.l}
            y1={pad.t + plotH}
            x2={pad.l + plotW}
            y2={pad.t + plotH}
            stroke="#9e9e9e"
            strokeWidth={1}
          />
          {[0, 0.5, 1].map((v) => (
            <text
              key={v}
              x={pad.l - 6}
              y={pad.t + (1 - v) * plotH + 4}
              textAnchor="end"
              fontSize={10}
              fill="#757575"
            >
              {v.toFixed(1)}
            </text>
          ))}
          <text x={pad.l + plotW / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="#757575">
            Iterations →
          </text>
          <path
            d={polyline(trainPts, pad.l, pad.t, plotW, plotH)}
            fill="none"
            stroke="#1976d2"
            strokeWidth={2.5}
          />
          <path
            d={polyline(valPts, pad.l, pad.t, plotW, plotH)}
            fill="none"
            stroke="#d32f2f"
            strokeWidth={2.5}
          />
        </svg>
      </Box>

      <Stack direction="row" spacing={1} sx={{mt: 1, flexWrap: 'wrap', gap: 1}}>
        <Chip size="small" label={`Train @${ITERATIONS}: ${lastTrain.toFixed(2)}`} color="primary" />
        <Chip size="small" label={`Val @${ITERATIONS}: ${lastVal.toFixed(2)}`} color="error" />
      </Stack>
      <Typography variant="body2" sx={{mt: 1.25, fontWeight: 600}}>
        {verdict}
      </Typography>
    </CEBlock>
  );
}

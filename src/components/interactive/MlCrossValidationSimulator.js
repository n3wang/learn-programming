import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const MODES = {
  kfold: {label: 'k-fold', k: 5, n: 20},
  loocv: {label: 'LOOCV', k: 8, n: 8},
  timeseries: {label: 'Time-series', k: 5, n: 20},
};

const LEGEND = [
  {key: 'T', label: 'Train', color: '#90caf9', desc: 'Used to fit the model this round'},
  {key: 'V', label: 'Validation', color: '#ef9a9a', desc: 'Held out for scoring this round'},
  {key: 'H', label: 'Unused / future', color: '#e0e0e0', desc: 'Time-series: not yet available'},
];

function foldErrors(k) {
  // Deterministic fake errors so the average is stable for teaching
  const base = [0.22, 0.18, 0.25, 0.2, 0.19, 0.24, 0.21, 0.23];
  return Array.from({length: k}, (_, i) => base[i % base.length]);
}

function buildFrames(modeId) {
  const mode = MODES[modeId];
  const {k, n} = mode;
  const errors = foldErrors(k);
  const frames = [];

  if (modeId === 'timeseries') {
    // Expanding window: train = [0 .. cut), val = [cut .. cut+foldSize)
    const foldSize = Math.floor(n / (k + 1));
    frames.push({
      roles: Array(n).fill('H'),
      fold: null,
      err: null,
      avg: null,
      msg: `Time-ordered data (n=${n}). Never train on the future. Expanding window: grow history, validate the next block.`,
    });
    let avgSum = 0;
    for (let i = 0; i < k; i += 1) {
      const cut = (i + 1) * foldSize;
      const valEnd = Math.min(cut + foldSize, n);
      const roles = Array(n).fill('H');
      for (let j = 0; j < cut; j += 1) roles[j] = 'T';
      for (let j = cut; j < valEnd; j += 1) roles[j] = 'V';
      avgSum += errors[i];
      frames.push({
        roles,
        fold: i + 1,
        err: errors[i],
        avg: i === k - 1 ? Math.round((avgSum / k) * 1000) / 1000 : null,
        msg:
          i < k - 1
            ? `Round ${i + 1}/${k}: train on indices [0, ${cut}), validate [${cut}, ${valEnd}). Error ≈ ${errors[i]}.`
            : `Round ${k}/${k} done. Mean validation error ≈ ${(avgSum / k).toFixed(3)}. Past → future only.`,
      });
    }
    return frames;
  }

  // k-fold / LOOCV: equal blocks
  const foldSize = Math.floor(n / k);
  frames.push({
    roles: Array(n).fill('T'),
    fold: null,
    err: null,
    avg: null,
    msg:
      modeId === 'loocv'
        ? `LOOCV: k = n = ${n}. Each round leaves out exactly one point as validation.`
        : `k-fold (k=${k}, n=${n}): shuffle into ${k} equal folds, then rotate which fold is validation.`,
  });

  let avgSum = 0;
  for (let i = 0; i < k; i += 1) {
    const roles = Array(n).fill('T');
    const start = i * foldSize;
    const end = i === k - 1 ? n : start + foldSize;
    for (let j = start; j < end; j += 1) roles[j] = 'V';
    avgSum += errors[i];
    frames.push({
      roles,
      fold: i + 1,
      err: errors[i],
      avg: i === k - 1 ? Math.round((avgSum / k) * 1000) / 1000 : null,
      msg:
        i < k - 1
          ? `Fold ${i + 1}/${k}: validate block [${start}, ${end}); train on the rest. Error ≈ ${errors[i]}.`
          : `All ${k} folds scored. Average validation error ≈ ${(avgSum / k).toFixed(3)} — estimate of true error.`,
    });
  }
  return frames;
}

const ROLE_COLOR = {T: '#90caf9', V: '#ef9a9a', H: '#e0e0e0'};

export default function MlCrossValidationSimulator() {
  const [modeId, setModeId] = useState('kfold');
  const frames = useMemo(() => buildFrames(modeId), [modeId]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  function switchMode(id) {
    setModeId(id);
    setStep(0);
  }

  return (
    <CEBlock
      title="Cross-validation lab"
      subtitle="Step through k-fold, LOOCV, and time-series expanding windows"
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls
          step={step}
          max={frames.length - 1}
          onStep={setStep}
          label="Round"
        />
      }
    >
      <Stack direction="row" spacing={1} sx={{mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        {Object.entries(MODES).map(([id, m]) => (
          <Chip
            key={id}
            label={m.label}
            size="small"
            color={modeId === id ? 'primary' : 'default'}
            variant={modeId === id ? 'filled' : 'outlined'}
            onClick={() => switchMode(id)}
            sx={{cursor: 'pointer'}}
          />
        ))}
      </Stack>

      <Typography variant="body2" sx={{mb: 1.5, minHeight: '3.2em'}}>
        {frame.msg}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: 1.5,
        }}
        aria-label="Dataset blocks"
      >
        {frame.roles.map((role, i) => (
          <Box
            key={i}
            title={`index ${i}: ${role === 'T' ? 'train' : role === 'V' ? 'val' : 'unused'}`}
            sx={{
              width: 22,
              height: 28,
              borderRadius: 0.5,
              backgroundColor: ROLE_COLOR[role],
              border: '1px solid',
              borderColor: 'divider',
              fontSize: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            {i}
          </Box>
        ))}
      </Box>

      <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', gap: 1}}>
        {frame.fold != null ? (
          <Chip size="small" label={`Round ${frame.fold}`} />
        ) : (
          <Chip size="small" label="Setup" variant="outlined" />
        )}
        {frame.err != null ? <Chip size="small" label={`Fold error ${frame.err}`} color="warning" /> : null}
        {frame.avg != null ? (
          <Chip size="small" label={`Mean error ${frame.avg}`} color="success" />
        ) : null}
      </Stack>
    </CEBlock>
  );
}

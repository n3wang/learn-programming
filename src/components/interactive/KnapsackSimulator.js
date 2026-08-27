import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const ITEMS = [
  {w: 2, v: 3, label: 'A'},
  {w: 3, v: 4, label: 'B'},
  {w: 4, v: 5, label: 'C'},
];
const W = 8;

const MODES = {
  zeroone: {label: '0-1 (j ↓)', zeroOne: true},
  complete: {label: 'Complete (j ↑)', zeroOne: false},
};

const LEGEND = [
  {key: 'U', label: 'Updating f[j]', color: '#ffb74d', desc: 'Current capacity being relaxed'},
  {key: 'S', label: 'Source f[j−w]', color: '#4fc3f7', desc: 'Value pulled for transition'},
  {key: 'I', label: 'Current item', color: '#81c784', desc: 'Item being processed'},
];

function buildFrames(zeroOne) {
  const frames = [];
  const f = Array(W + 1).fill(0);
  frames.push({
    f: [...f],
    item: null,
    j: null,
    src: null,
    msg: zeroOne
      ? `0-1 knapsack, W=${W}. Loop j from W down to wᵢ so each item is used at most once.`
      : `Complete knapsack, W=${W}. Loop j from wᵢ up to W so an item can be reused.`,
  });

  for (const it of ITEMS) {
    frames.push({
      f: [...f],
      item: it.label,
      j: null,
      src: null,
      msg: `Process item ${it.label} (w=${it.w}, v=${it.v}).`,
    });
    if (zeroOne) {
      for (let j = W; j >= it.w; j -= 1) {
        const cand = f[j - it.w] + it.v;
        const before = f[j];
        f[j] = Math.max(f[j], cand);
        frames.push({
          f: [...f],
          item: it.label,
          j,
          src: j - it.w,
          msg: `j=${j}: max(${before}, f[${j - it.w}]+${it.v}=${cand}) → ${f[j]}.`,
        });
      }
    } else {
      for (let j = it.w; j <= W; j += 1) {
        const cand = f[j - it.w] + it.v;
        const before = f[j];
        f[j] = Math.max(f[j], cand);
        frames.push({
          f: [...f],
          item: it.label,
          j,
          src: j - it.w,
          msg: `j=${j}: max(${before}, f[${j - it.w}]+${it.v}=${cand}) → ${f[j]} (reuse allowed).`,
        });
      }
    }
  }

  frames.push({
    f: [...f],
    item: null,
    j: null,
    src: null,
    msg: `Done. Optimal value f[${W}]=${f[W]}.`,
  });
  return frames;
}

function cellBg(i, frame) {
  if (frame.j === i) return '#ffb74d';
  if (frame.src === i) return '#4fc3f7';
  return '#f5f5f5';
}

export default function KnapsackSimulator() {
  const [mode, setMode] = useState('zeroone');
  const frames = useMemo(() => buildFrames(MODES[mode].zeroOne), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const onMode = (m) => {
    setMode(m);
    setStep(0);
  };

  return (
    <CEBlock
      title="0-1 vs complete knapsack"
      subtitle={`Items A(2,3), B(3,4), C(4,5), capacity ${W}. Same transition; opposite j order.`}
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Variant">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {Object.entries(MODES).map(([id, s]) => (
            <Chip
              key={id}
              label={s.label}
              size="small"
              color={id === mode ? 'primary' : 'default'}
              variant={id === mode ? 'filled' : 'outlined'}
              onClick={() => onMode(id)}
            />
          ))}
        </Stack>
        {frame.item && (
          <Typography variant="body2" sx={{mt: 1, fontFamily: 'monospace'}}>
            current item: {frame.item}
          </Typography>
        )}
      </CEBlock.Section>

      <CEBlock.Section label="f[0..W]">
        <Box sx={{overflowX: 'auto', py: 1}}>
          <Stack direction="row" spacing={0.5}>
            {frame.f.map((val, i) => (
              <Box key={i} sx={{textAlign: 'center', minWidth: 36}}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {i}
                </Typography>
                <Box
                  sx={{
                    py: 1,
                    borderRadius: 1,
                    border: '1.5px solid #90a4ae',
                    backgroundColor: cellBg(i, frame),
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {val}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

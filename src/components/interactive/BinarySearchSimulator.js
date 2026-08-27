import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const ARRAYS = {
  classic: {
    label: 'Find 7',
    a: [1, 3, 4, 6, 7, 8, 10, 13, 14],
    k: 7,
  },
  missing: {
    label: 'Missing 5',
    a: [1, 2, 4, 6, 8, 9],
    k: 5,
  },
  dupes: {
    label: 'Upper of 2',
    a: [0, 1, 2, 2, 2, 3, 5],
    k: 2,
  },
};

const LEGEND = [
  {key: 'L', label: 'L (≤ k side)', color: '#4fc3f7', desc: 'Invariant: a[L] ≤ k (sentinel −1 means −∞)'},
  {key: 'R', label: 'R (> k side)', color: '#ef9a9a', desc: 'Invariant: a[R] > k (sentinel n means +∞)'},
  {key: 'M', label: 'Midpoint m', color: '#ffb74d', desc: 'm = ⌊(L+R)/2⌋ — never evaluates a[L] or a[R] sentinels'},
  {key: 'K', label: 'Target k', color: '#81c784', desc: 'Value we are searching for'},
];

function buildFrames(a, k) {
  const n = a.length;
  let l = -1;
  let r = n;
  const frames = [
    {
      l,
      r,
      m: null,
      branch: null,
      msg: `Start: L=-1, R=${n}. Invariant a[L] ≤ k < a[R] (sentinels ±∞). Looking for k=${k}.`,
    },
  ];

  while (r - l > 1) {
    const m = Math.floor((l + r) / 2);
    frames.push({
      l,
      r,
      m,
      branch: null,
      msg: `m = ⌊(${l}+${r})/2⌋ = ${m}, a[m]=${a[m]}. Compare k=${k} with a[m].`,
    });
    if (k < a[m]) {
      r = m;
      frames.push({
        l,
        r,
        m,
        branch: 'left',
        msg: `k < a[m] → shrink to [L, m). New R=${r}. Still a[L] ≤ k < a[R].`,
      });
    } else {
      l = m;
      frames.push({
        l,
        r,
        m,
        branch: 'right',
        msg: `k ≥ a[m] → shrink to [m, R). New L=${l}. Still a[L] ≤ k < a[R].`,
      });
    }
  }

  const found = l >= 0 && a[l] === k;
  frames.push({
    l,
    r,
    m: null,
    branch: null,
    msg: found
      ? `Done. L=${l} is last index with a[L] ≤ k and a[L]=k (hit). R=${r} is upper bound.`
      : `Done. L=${l} (last ≤ k${l >= 0 ? `, a[L]=${a[l]}` : ''}), R=${r} (first > k). k not present.`,
  });
  return frames;
}

function cellColor(i, frame, a, k) {
  if (frame.m === i) return '#ffb74d';
  if (i === frame.l && frame.l >= 0) return '#4fc3f7';
  if (i === frame.r && frame.r < a.length) return '#ef9a9a';
  if (a[i] === k) return '#c8e6c9';
  if (i > frame.l && i < frame.r) return '#eceff1';
  return '#f5f5f5';
}

export default function BinarySearchSimulator() {
  const [scenario, setScenario] = useState('classic');
  const cfg = ARRAYS[scenario];
  const frames = useMemo(() => buildFrames(cfg.a, cfg.k), [cfg]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const onScenario = (id) => {
    setScenario(id);
    setStep(0);
  };

  return (
    <CEBlock
      title="Binary search on a sorted array"
      subtitle="Half-open invariant: a[L] ≤ k < a[R]. Step until R = L+1."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Scenario">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {Object.entries(ARRAYS).map(([id, s]) => (
            <Chip
              key={id}
              label={s.label}
              size="small"
              color={id === scenario ? 'primary' : 'default'}
              variant={id === scenario ? 'filled' : 'outlined'}
              onClick={() => onScenario(id)}
            />
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Array">
        <Box sx={{overflowX: 'auto', py: 1}}>
          <Stack direction="row" spacing={0.75} alignItems="flex-end">
            {cfg.a.map((v, i) => (
              <Box key={i} sx={{textAlign: 'center', minWidth: 40}}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {i}
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 1.25,
                    borderRadius: 1,
                    border: '1.5px solid',
                    borderColor:
                      frame.m === i
                        ? '#f57c00'
                        : i === frame.l
                          ? '#0288d1'
                          : i === frame.r
                            ? '#c62828'
                            : '#90a4ae',
                    backgroundColor: cellColor(i, frame, cfg.a, cfg.k),
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {v}
                </Box>
                <Typography variant="caption" sx={{fontFamily: 'monospace', height: 16}}>
                  {i === frame.l ? 'L' : ''}
                  {i === frame.r ? 'R' : ''}
                  {i === frame.m ? 'm' : ''}
                </Typography>
              </Box>
            ))}
            <Box sx={{textAlign: 'center', minWidth: 36, opacity: 0.7}}>
              <Typography variant="caption" color="text.secondary" display="block">
                n
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 1.25,
                  borderRadius: 1,
                  border: '1.5px dashed #90a4ae',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: 'text.secondary',
                }}
              >
                ∞
              </Box>
              <Typography variant="caption" sx={{fontFamily: 'monospace'}}>
                {frame.r === cfg.a.length ? 'R' : ''}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Typography variant="body2" sx={{fontFamily: 'monospace', mt: 1}}>
          L={frame.l} &nbsp; R={frame.r} &nbsp; k={cfg.k}
          {frame.m != null ? ` · m=${frame.m}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mt: 0.75}}>
          {frame.msg}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

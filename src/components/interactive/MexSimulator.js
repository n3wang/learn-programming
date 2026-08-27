import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const SCENARIOS = {
  gap: {
    label: 'Gap at 3',
    A: [0, 1, 2, 4, 5],
    updates: [],
  },
  full: {
    label: 'Prefix 0..4',
    A: [0, 1, 2, 3, 4],
    updates: [],
  },
  nozero: {
    label: 'No zero',
    A: [1, 2, 3, 4, 5],
    updates: [],
  },
  live: {
    label: 'With updates',
    A: [0, 1, 3, 3],
    updates: [
      {idx: 2, val: 2, note: 'A[2]: 3 → 2'},
      {idx: 0, val: 4, note: 'A[0]: 0 → 4'},
      {idx: 1, val: 0, note: 'A[1]: 1 → 0'},
    ],
  },
};

const LEGEND = [
  {key: 'P', label: 'Present', color: '#81c784', desc: 'Value appears ≥1 time in A'},
  {key: 'M', label: 'Missing', color: '#ffcc80', desc: 'Candidate not in A'},
  {key: 'X', label: 'MEX', color: '#4fc3f7', desc: 'Smallest missing non-negative'},
];

function freqsOf(A) {
  const f = new Map();
  for (const x of A) f.set(x, (f.get(x) || 0) + 1);
  return f;
}

function missingSet(A) {
  const n = A.length;
  const f = freqsOf(A);
  const miss = [];
  for (let i = 0; i <= n; i += 1) {
    if (!f.has(i) || f.get(i) === 0) miss.push(i);
  }
  return miss;
}

function mexOf(A) {
  return missingSet(A)[0];
}

function buildFrames(key) {
  const sc = SCENARIOS[key];
  const frames = [];
  let A = [...sc.A];
  const n = A.length;

  frames.push({
    A: [...A],
    probe: null,
    mex: null,
    miss: missingSet(A),
    msg: `A = [${A.join(', ')}]. MEX ≤ N=${n}. Candidates to check: 0…${n}.`,
  });

  for (let r = 0; r <= n; r += 1) {
    const present = A.includes(r);
    frames.push({
      A: [...A],
      probe: r,
      mex: present ? null : r,
      miss: missingSet(A),
      msg: present
        ? `Check ${r}: present in A → keep going.`
        : `Check ${r}: missing → MEX = ${r}.`,
    });
    if (!present) break;
  }

  for (const u of sc.updates) {
    const old = A[u.idx];
    A[u.idx] = u.val;
    const m = mexOf(A);
    frames.push({
      A: [...A],
      probe: null,
      mex: m,
      miss: missingSet(A),
      msg: `Update ${u.note}. Freq map / missing-set refresh → MEX = ${m}.`,
    });
  }

  return frames;
}

export default function MexSimulator() {
  const [mode, setMode] = useState('gap');
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];
  const n = frame.A.length;
  const lim = n;

  return (
    <CEBlock
      title="MEX scan & updates"
      subtitle="Smallest missing non-negative integer; optional point updates."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(SCENARIOS).map(([k, v]) => (
              <Chip
                key={k}
                size="small"
                label={v.label}
                color={mode === k ? 'primary' : 'default'}
                onClick={() => {
                  setMode(k);
                  setStep(0);
                }}
              />
            ))}
          </Stack>
          <StepControls
            step={step}
            max={frames.length - 1}
            onStep={setStep}
            label="Step"
          />
        </Stack>
      }
    >
      <CEBlock.Section label="Array A">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {frame.A.map((x, i) => (
            <Box
              key={`a${i}`}
              sx={{
                minWidth: 40,
                textAlign: 'center',
                border: '1.5px solid #90a4ae',
                borderRadius: 1,
                py: 0.75,
                fontFamily: 'monospace',
                fontWeight: 700,
                backgroundColor: '#f5f5f5',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                [{i}]
              </Typography>
              {x}
            </Box>
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Candidates 0 … N">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {Array.from({length: lim + 1}, (_, v) => {
            const present = frame.A.includes(v);
            const isMex = frame.mex === v;
            const probing = frame.probe === v;
            let bg = present ? '#c8e6c9' : '#ffe0b2';
            let border = present ? '#2e7d32' : '#ef6c00';
            if (isMex) {
              bg = '#4fc3f7';
              border = '#0277bd';
            } else if (probing) {
              bg = '#fff59d';
              border = '#f9a825';
            }
            return (
              <Box
                key={v}
                sx={{
                  minWidth: 36,
                  textAlign: 'center',
                  border: '1.5px solid',
                  borderColor: border,
                  backgroundColor: bg,
                  borderRadius: 1,
                  py: 0.75,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {v}
              </Box>
            );
          })}
        </Stack>
        <Typography variant="caption" display="block" sx={{mt: 1, fontFamily: 'monospace'}}>
          missing set (≤N): [{frame.miss.join(', ')}]
          {frame.mex != null ? ` · MEX=${frame.mex}` : ''}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

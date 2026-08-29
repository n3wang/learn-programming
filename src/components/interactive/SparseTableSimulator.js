import React, {useMemo, useState} from 'react';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const A = [4, 2, 3, 7, 1, 5, 8, 6]; // N=8
const N = A.length;

const MODES = {
  build: {label: 'Build table'},
  rmq: {label: 'RMQ O(1)'},
  sum: {label: 'Range sum O(log n)'},
};

const LEGEND = [
  {key: 'B', label: 'Block 2ⁱ', color: '#0288d1', desc: 'Power-of-two window in st[i][j]'},
  {key: 'L', label: 'Left cover', color: '#2e7d32', desc: 'First overlapping / peeled segment'},
  {key: 'R', label: 'Right cover', color: '#ef6c00', desc: 'Second overlapping segment (RMQ)'},
  {key: 'Q', label: 'Query [L,R]', color: '#6a1b9a', desc: 'Asked range'},
];

function buildSparseMin() {
  const K = Math.floor(Math.log2(N));
  const st = Array.from({length: K + 1}, () => Array(N).fill(0));
  for (let j = 0; j < N; j += 1) st[0][j] = A[j];
  for (let i = 1; i <= K; i += 1) {
    for (let j = 0; j + (1 << i) <= N; j += 1) {
      st[i][j] = Math.min(st[i - 1][j], st[i - 1][j + (1 << (i - 1))]);
    }
  }
  return st;
}

function buildSparseSum() {
  const K = Math.floor(Math.log2(N));
  const st = Array.from({length: K + 1}, () => Array(N).fill(0));
  for (let j = 0; j < N; j += 1) st[0][j] = A[j];
  for (let i = 1; i <= K; i += 1) {
    for (let j = 0; j + (1 << i) <= N; j += 1) {
      st[i][j] = st[i - 1][j] + st[i - 1][j + (1 << (i - 1))];
    }
  }
  return st;
}

function lgFloor(len) {
  return Math.floor(Math.log2(len));
}

function buildFrames(mode) {
  const frames = [];
  if (mode === 'build') {
    const st = buildSparseMin();
    frames.push({
      mode,
      i: 0,
      j: null,
      cover: null,
      msg: 'st[0][j] = A[j]. Precompute answers for every range of length 2ⁱ.',
    });
    for (let i = 1; i <= Math.floor(Math.log2(N)); i += 1) {
      for (let j = 0; j + (1 << i) <= N; j += 1) {
        frames.push({
          mode,
          i,
          j,
          cover: [j, j + (1 << i) - 1],
          mid: j + (1 << (i - 1)),
          val: st[i][j],
          msg: `st[${i}][${j}] = min(st[${i - 1}][${j}], st[${i - 1}][${j + (1 << (i - 1))}]) = ${st[i][j]}  (range [${j}, ${j + (1 << i) - 1}])`,
        });
      }
    }
    frames.push({
      mode,
      i: null,
      j: null,
      cover: null,
      msg: `Done in O(N log N). K=⌊log₂ N⌋=${Math.floor(Math.log2(N))}.`,
    });
    return frames;
  }

  if (mode === 'rmq') {
    const L = 1;
    const R = 6; // [1,6] length 6, i=2, blocks [1,4] and [3,6]
    const st = buildSparseMin();
    const i = lgFloor(R - L + 1);
    frames.push({
      mode,
      query: [L, R],
      left: null,
      right: null,
      msg: `RMQ on [${L},${R}]. Idempotent min → two overlapping 2ⁱ blocks suffice.`,
    });
    frames.push({
      mode,
      query: [L, R],
      left: [L, L + (1 << i) - 1],
      right: [R - (1 << i) + 1, R],
      i,
      msg: `i = ⌊log₂(${R - L + 1})⌋ = ${i}. Blocks [${L},${L + (1 << i) - 1}] and [${R - (1 << i) + 1},${R}].`,
    });
    const ans = Math.min(st[i][L], st[i][R - (1 << i) + 1]);
    frames.push({
      mode,
      query: [L, R],
      left: [L, L + (1 << i) - 1],
      right: [R - (1 << i) + 1, R],
      i,
      ans,
      msg: `min(st[${i}][${L}], st[${i}][${R - (1 << i) + 1}]) = min(${st[i][L]}, ${st[i][R - (1 << i) + 1]}) = ${ans}. O(1).`,
    });
    return frames;
  }

  // sum
  const L0 = 2;
  const R0 = 7;
  const st = buildSparseSum();
  let L = L0;
  const R = R0;
  frames.push({
    mode,
    query: [L0, R],
    peeled: [],
    msg: `Range sum [${L0},${R}]. Peel largest 2ⁱ ≤ remaining length (disjoint cover).`,
  });
  const peeled = [];
  let sum = 0;
  for (let i = Math.floor(Math.log2(N)); i >= 0; i -= 1) {
    if (1 << i <= R - L + 1) {
      peeled.push({i, L, Rseg: L + (1 << i) - 1, val: st[i][L]});
      sum += st[i][L];
      frames.push({
        mode,
        query: [L0, R],
        peeled: [...peeled],
        cur: [L, L + (1 << i) - 1],
        sum,
        msg: `Take 2^${i}=${1 << i}: add st[${i}][${L}]=${st[i][L]}. L ← ${L + (1 << i)}. sum=${sum}.`,
      });
      L += 1 << i;
    }
  }
  frames.push({
    mode,
    query: [L0, R],
    peeled: [...peeled],
    sum,
    msg: `Sum = ${sum}. O(log N) pieces (not O(1) — sums are not idempotent).`,
  });
  return frames;
}

function cellColor(idx, frame) {
  if (frame.query && idx >= frame.query[0] && idx <= frame.query[1]) {
    // base purple tint for query
  }
  if (frame.cover && idx >= frame.cover[0] && idx <= frame.cover[1]) return '#81d4fa';
  if (frame.left && idx >= frame.left[0] && idx <= frame.left[1]) return '#a5d6a7';
  if (frame.right && idx >= frame.right[0] && idx <= frame.right[1]) return '#ffcc80';
  if (frame.cur && idx >= frame.cur[0] && idx <= frame.cur[1]) return '#81d4fa';
  if (frame.query && idx >= frame.query[0] && idx <= frame.query[1]) return '#e1bee7';
  return '#eceff1';
}

export default function SparseTableSimulator() {
  const [mode, setMode] = useState('build');
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Sparse table"
      subtitle="Precompute power-of-two ranges; RMQ in O(1), general folds in O(log n)."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Mode">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Object.entries(MODES).map(([k, v]) => (
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
      </CEBlock.Section>

      <CEBlock.Section label="Array A">
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {A.map((v, idx) => (
            <Chip
              key={idx}
              size="small"
              label={`${idx}:${v}`}
              sx={{
                bgcolor: cellColor(idx, frame),
                fontFamily: 'monospace',
              }}
            />
          ))}
        </Stack>
        <Typography variant="body2" sx={{mt: 1, fontFamily: 'monospace'}}>
          {frame.ans != null && `answer = ${frame.ans}`}
          {frame.sum != null && frame.ans == null && `sum = ${frame.sum}`}
          {frame.val != null && `st[${frame.i}][${frame.j}] = ${frame.val}`}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

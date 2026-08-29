import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const MODES = {
  naive: {label: 'Naive recursion (n=6)', n: 6},
  memo: {label: 'Memoized (n=10)', n: 10},
  bottom: {label: 'Bottom-up (n=10)', n: 10},
};

const LEGEND = [
  {key: 'C', label: 'Compute', color: '#ffb74d', desc: 'Evaluating a new subproblem'},
  {key: 'H', label: 'Memo hit', color: '#81c784', desc: 'Return cached value — no recompute'},
  {key: 'B', label: 'Base case', color: '#4fc3f7', desc: 'f(0) or f(1)'},
  {key: 'F', label: 'Filled cell', color: '#ce93d8', desc: 'Bottom-up table entry written'},
];

function buildNaiveFrames(n) {
  const frames = [];
  let calls = 0;
  function go(k, depth) {
    calls += 1;
    frames.push({
      mode: 'naive',
      k,
      depth,
      calls,
      kind: k <= 1 ? 'base' : 'compute',
      msg: `Call f(${k})${k <= 1 ? ' → base' : ' → f(' + (k - 1) + ')+f(' + (k - 2) + ')'}. Total calls=${calls}.`,
    });
    if (k <= 1) return k;
    return go(k - 1, depth + 1) + go(k - 2, depth + 1);
  }
  frames.push({
    mode: 'naive',
    k: null,
    depth: 0,
    calls: 0,
    kind: null,
    msg: `Naive f(${n}): each call branches into two. Expect exponential calls.`,
  });
  go(n, 0);
  frames.push({
    mode: 'naive',
    k: null,
    depth: 0,
    calls,
    kind: null,
    msg: `Done. f(${n}) needed ${calls} calls (no sharing).`,
  });
  return frames;
}

function buildMemoFrames(n) {
  const frames = [];
  const found = Array(n + 1).fill(false);
  const memo = Array(n + 1).fill(0);
  let calls = 0;
  let hits = 0;

  function go(k) {
    calls += 1;
    if (found[k]) {
      hits += 1;
      frames.push({
        mode: 'memo',
        k,
        calls,
        hits,
        found: [...found],
        memo: [...memo],
        kind: 'hit',
        msg: `f(${k}) memo hit → ${memo[k]}. calls=${calls}, hits=${hits}.`,
      });
      return memo[k];
    }
    if (k <= 1) {
      found[k] = true;
      memo[k] = k;
      frames.push({
        mode: 'memo',
        k,
        calls,
        hits,
        found: [...found],
        memo: [...memo],
        kind: 'base',
        msg: `f(${k}) base case. Store memo[${k}]=${k}.`,
      });
      return k;
    }
    frames.push({
      mode: 'memo',
      k,
      calls,
      hits,
      found: [...found],
      memo: [...memo],
      kind: 'compute',
      msg: `f(${k}) miss → compute f(${k - 1})+f(${k - 2}).`,
    });
    const val = go(k - 1) + go(k - 2);
    found[k] = true;
    memo[k] = val;
    frames.push({
      mode: 'memo',
      k,
      calls,
      hits,
      found: [...found],
      memo: [...memo],
      kind: 'compute',
      msg: `Store memo[${k}]=${val}.`,
    });
    return val;
  }

  frames.push({
    mode: 'memo',
    k: null,
    calls: 0,
    hits: 0,
    found: [...found],
    memo: [...memo],
    kind: null,
    msg: `Memoized f(${n}): O(n) distinct states, each solved once.`,
  });
  go(n);
  frames.push({
    mode: 'memo',
    k: null,
    calls,
    hits,
    found: [...found],
    memo: [...memo],
    kind: null,
    msg: `Done. calls=${calls}, memo hits=${hits}. Answer=${memo[n]}.`,
  });
  return frames;
}

function buildBottomFrames(n) {
  const frames = [];
  const fib = Array(n + 1).fill(null);
  frames.push({
    mode: 'bottom',
    i: null,
    fib: [...fib],
    msg: `Bottom-up: fill fib[0..${n}] from base cases upward.`,
  });
  fib[0] = 0;
  fib[1] = 1;
  frames.push({
    mode: 'bottom',
    i: 1,
    fib: [...fib],
    msg: 'Set fib[0]=0, fib[1]=1.',
  });
  for (let i = 2; i <= n; i += 1) {
    fib[i] = fib[i - 1] + fib[i - 2];
    frames.push({
      mode: 'bottom',
      i,
      fib: [...fib],
      msg: `fib[${i}] = fib[${i - 1}]+fib[${i - 2}] = ${fib[i]}.`,
    });
  }
  frames.push({
    mode: 'bottom',
    i: n,
    fib: [...fib],
    msg: `Answer fib[${n}]=${fib[n]}. Same O(n) work, no recursion stack.`,
  });
  return frames;
}

function cellBg(i, frame) {
  if (frame.mode === 'memo') {
    if (frame.k === i && frame.kind === 'hit') return '#c8e6c9';
    if (frame.k === i && frame.kind === 'base') return '#bbdefb';
    if (frame.k === i) return '#ffe0b2';
    if (frame.found?.[i]) return '#e1bee7';
    return '#f5f5f5';
  }
  if (frame.mode === 'bottom') {
    if (frame.i === i) return '#ffe0b2';
    if (frame.fib?.[i] != null) return '#e1bee7';
    return '#f5f5f5';
  }
  return '#f5f5f5';
}

export default function IntroDynamicProgrammingSimulator() {
  const [mode, setMode] = useState('memo');
  const frames = useMemo(() => {
    const n = MODES[mode].n;
    if (mode === 'naive') return buildNaiveFrames(n);
    if (mode === 'memo') return buildMemoFrames(n);
    return buildBottomFrames(n);
  }, [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const onMode = (m) => {
    setMode(m);
    setStep(0);
  };

  const nShow = MODES[mode].n;

  return (
    <CEBlock
      title="Fibonacci: naive vs memo vs bottom-up"
      subtitle="Same recurrence; DP removes repeated work."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Approach">
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
      </CEBlock.Section>

      {frame.mode !== 'naive' && (
        <CEBlock.Section label={frame.mode === 'memo' ? 'memo[] / found' : 'fib[]'}>
          <Box sx={{overflowX: 'auto', py: 1}}>
            <Stack direction="row" spacing={0.5}>
              {Array.from({length: nShow + 1}, (_, i) => (
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
                      fontSize: 12,
                    }}
                  >
                    {frame.mode === 'memo'
                      ? frame.found?.[i]
                        ? frame.memo[i]
                        : '·'
                      : frame.fib?.[i] != null
                        ? frame.fib[i]
                        : '·'}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </CEBlock.Section>
      )}

      {frame.mode === 'naive' && (
        <CEBlock.Section label="Call counter">
          <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
            depth={frame.depth} · f({frame.k == null ? '?' : frame.k}) · calls={frame.calls}
          </Typography>
        </CEBlock.Section>
      )}

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

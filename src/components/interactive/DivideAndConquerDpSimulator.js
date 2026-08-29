import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Tiny instance: m=2 groups, n=8 positions, C(k,j)=(j-k+1)^2 (QI holds). */
const N = 8;

const LEGEND = [
  {key: 'M', label: 'mid (fill now)', color: '#ffb74d', desc: 'Index we optimize in this call'},
  {key: 'R', label: 'k search range', color: '#4fc3f7', desc: 'k ∈ [optl, min(mid, optr)]'},
  {key: 'O', label: 'chosen opt', color: '#81c784', desc: 'Best splitting point k for mid'},
  {key: 'D', label: 'Already filled', color: '#ce93d8', desc: 'dp_cur[j] known from earlier calls'},
];

function C(k, j) {
  // cost of segment [k..j]
  const len = j - k + 1;
  return len * len;
}

function buildFrames() {
  const frames = [];
  // Layer 0: dp_before[j] = C(0, j)
  const dpBefore = Array.from({length: N}, (_, j) => C(0, j));
  const dpCur = Array(N).fill(null);
  const optAt = Array(N).fill(null);

  frames.push({
    dpBefore: [...dpBefore],
    dpCur: [...dpCur],
    optAt: [...optAt],
    l: 0,
    r: N - 1,
    optl: 0,
    optr: N - 1,
    mid: null,
    scanK: null,
    bestK: null,
    msg: 'Row i=1. Naive would try all k for every j → O(n²). D&C uses opt(j) ≤ opt(j+1).',
  });

  function compute(l, r, optl, optr, depth) {
    if (l > r) return;

    const mid = (l + r) >> 1;
    frames.push({
      dpBefore: [...dpBefore],
      dpCur: [...dpCur],
      optAt: [...optAt],
      l,
      r,
      optl,
      optr,
      mid,
      scanK: null,
      bestK: null,
      msg: `compute([${l},${r}], opt∈[${optl},${optr}]). Fill mid=${mid} first (depth ${depth}).`,
    });

    let bestVal = Infinity;
    let bestK = -1;
    const kHi = Math.min(mid, optr);
    for (let k = optl; k <= kHi; k += 1) {
      const val = (k ? dpBefore[k - 1] : 0) + C(k, mid);
      frames.push({
        dpBefore: [...dpBefore],
        dpCur: [...dpCur],
        optAt: [...optAt],
        l,
        r,
        optl,
        optr,
        mid,
        scanK: k,
        bestK: bestK >= 0 ? bestK : null,
        msg: `Try k=${k}: dp_before[${k ? k - 1 : '∅'}] + C(${k},${mid}) = ${val}. Best so far = ${
          bestK >= 0 ? bestVal : '∞'
        }.`,
      });
      if (val < bestVal) {
        bestVal = val;
        bestK = k;
      }
    }

    dpCur[mid] = bestVal;
    optAt[mid] = bestK;

    frames.push({
      dpBefore: [...dpBefore],
      dpCur: [...dpCur],
      optAt: [...optAt],
      l,
      r,
      optl,
      optr,
      mid,
      scanK: null,
      bestK,
      msg: `opt(${mid}) = ${bestK}, dp_cur[${mid}] = ${bestVal}. Left j < mid use k ≤ ${bestK}; right use k ≥ ${bestK}.`,
    });

    compute(l, mid - 1, optl, bestK, depth + 1);
    compute(mid + 1, r, bestK, optr, depth + 1);
  }

  compute(0, N - 1, 0, N - 1, 0);

  frames.push({
    dpBefore: [...dpBefore],
    dpCur: [...dpCur],
    optAt: [...optAt],
    l: 0,
    r: N - 1,
    optl: 0,
    optr: N - 1,
    mid: null,
    scanK: null,
    bestK: null,
    msg: `Done one layer. opt is non-decreasing: [${optAt.join(', ')}]. Next layer would swap rows.`,
  });

  return frames;
}

function cellBg(i, frame) {
  if (frame.mid === i) return '#ffb74d';
  if (frame.bestK === i) return '#81c784';
  if (frame.scanK === i) return '#4fc3f7';
  if (frame.dpCur[i] != null) return '#e1bee7';
  if (frame.optl != null && i >= frame.optl && i <= frame.optr) return '#e3f2fd';
  return '#f5f5f5';
}

export default function DivideAndConquerDpSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Divide-and-conquer DP (one row)"
      subtitle="C(k,j)=(j−k+1)². Fill mid, then recurse with tighter opt bounds."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Search window">
        <Typography variant="body2" sx={{fontFamily: 'monospace', mb: 1}}>
          j-range [{frame.l},{frame.r}] · opt-bounds [{frame.optl},{frame.optr}]
          {frame.mid != null ? ` · mid=${frame.mid}` : ''}
          {frame.bestK != null ? ` · opt=${frame.bestK}` : ''}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Indices j / k">
        <Box sx={{overflowX: 'auto', py: 1}}>
          <Stack direction="row" spacing={0.75}>
            {Array.from({length: N}, (_, i) => (
              <Box key={i} sx={{textAlign: 'center', minWidth: 44}}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {i}
                </Typography>
                <Box
                  sx={{
                    px: 0.5,
                    py: 1,
                    borderRadius: 1,
                    border: '1.5px solid',
                    borderColor:
                      frame.mid === i
                        ? '#ef6c00'
                        : frame.bestK === i
                          ? '#2e7d32'
                          : frame.scanK === i
                            ? '#0277bd'
                            : '#90a4ae',
                    backgroundColor: cellBg(i, frame),
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 12,
                    minHeight: 36,
                  }}
                >
                  {frame.dpCur[i] != null ? frame.dpCur[i] : '·'}
                </Box>
                <Typography variant="caption" sx={{fontFamily: 'monospace', display: 'block'}}>
                  {frame.optAt[i] != null ? `opt=${frame.optAt[i]}` : ''}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="dp_before (previous row)">
        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
          [{frame.dpBefore.join(', ')}]
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

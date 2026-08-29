import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Stone-merge style: C(i,j)=sum(a[i..j]), dp[i][i]=0. */
const A = [2, 3, 1, 4, 2];
const N = A.length;

const LEGEND = [
  {key: 'C', label: 'Current (i,j)', color: '#ffb74d', desc: 'Cell being filled'},
  {key: 'K', label: 'Knuth k-range', color: '#4fc3f7', desc: 'k ∈ [opt(i,j−1), opt(i+1,j)]'},
  {key: 'O', label: 'Chosen opt', color: '#81c784', desc: 'Best split k'},
  {key: 'D', label: 'Already filled', color: '#ce93d8', desc: 'dp known'},
];

function buildFrames() {
  const frames = [];
  const pref = [0];
  for (const x of A) pref.push(pref[pref.length - 1] + x);
  const C = (i, j) => pref[j + 1] - pref[i];

  const INF = 1e18;
  const dp = Array.from({length: N}, () => Array(N).fill(null));
  const opt = Array.from({length: N}, () => Array(N).fill(null));
  for (let i = 0; i < N; i += 1) {
    dp[i][i] = 0;
    opt[i][i] = i;
  }

  frames.push({
    dp: dp.map((r) => [...r]),
    opt: opt.map((r) => [...r]),
    i: null,
    j: null,
    lo: null,
    hi: null,
    scanK: null,
    bestK: null,
    naiveLo: null,
    naiveHi: null,
    msg: `a=[${A.join(', ')}]. C(i,j)=sum(a[i..j]). Process i from n−2 down to 0, j from i+1 up, so neighbor opts exist.`,
  });

  for (let i = N - 2; i >= 0; i -= 1) {
    for (let j = i + 1; j < N; j += 1) {
      const cost = C(i, j);
      const lo = opt[i][j - 1];
      const hi = Math.min(j - 1, opt[i + 1][j]);
      const naiveLo = i;
      const naiveHi = j - 1;

      frames.push({
        dp: dp.map((r) => [...r]),
        opt: opt.map((r) => [...r]),
        i,
        j,
        lo,
        hi,
        scanK: null,
        bestK: null,
        naiveLo,
        naiveHi,
        msg: `Fill dp[${i}][${j}] (C=${cost}). Naive: ${naiveHi - naiveLo + 1} values of k; Knuth: ${hi - lo + 1} (${lo}…${hi}).`,
      });

      let mn = INF;
      let bestK = lo;
      for (let k = lo; k <= hi; k += 1) {
        const val = dp[i][k] + dp[k + 1][j] + cost;
        frames.push({
          dp: dp.map((r) => [...r]),
          opt: opt.map((r) => [...r]),
          i,
          j,
          lo,
          hi,
          scanK: k,
          bestK: mn < INF ? bestK : null,
          naiveLo,
          naiveHi,
          msg: `Try k=${k}: ${dp[i][k]}+${dp[k + 1][j]}+${cost} = ${val}. Best=${mn < INF ? mn : '∞'}.`,
        });
        if (val <= mn) {
          mn = val;
          bestK = k;
        }
      }

      dp[i][j] = mn;
      opt[i][j] = bestK;

      frames.push({
        dp: dp.map((r) => [...r]),
        opt: opt.map((r) => [...r]),
        i,
        j,
        lo,
        hi,
        scanK: null,
        bestK,
        naiveLo,
        naiveHi,
        msg: `opt[${i}][${j}]=${bestK}, dp=${mn}. Monotone: opt[${i}][${j - 1}]=${opt[i][j - 1]} ≤ ${bestK} ≤ opt[${i + 1}][${j}]=${opt[i + 1][j]}.`,
      });
    }
  }

  frames.push({
    dp: dp.map((r) => [...r]),
    opt: opt.map((r) => [...r]),
    i: null,
    j: null,
    lo: null,
    hi: null,
    scanK: null,
    bestK: null,
    naiveLo: null,
    naiveHi: null,
    msg: `Done. Answer dp[0][${N - 1}]=${dp[0][N - 1]}. Sum of Knuth window sizes is O(n²).`,
  });

  return frames;
}

function cellBg(r, c, frame) {
  if (r > c) return '#eeeeee';
  if (frame.i === r && frame.j === c) return '#ffb74d';
  if (frame.dp[r][c] != null) return '#e1bee7';
  return '#f5f5f5';
}

export default function KnuthOptimizationSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Knuth range DP"
      subtitle={`a=[${A.join(', ')}], C(i,j)=Σ a[i..j]. Shrink the k-loop using neighboring opts.`}
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="dp / opt (upper triangle)">
        <Box sx={{overflowX: 'auto'}}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `28px repeat(${N}, minmax(52px, 1fr))`,
              gap: 0.5,
              minWidth: 28 + N * 56,
            }}
          >
            <Box />
            {Array.from({length: N}, (_, c) => (
              <Typography key={`h${c}`} variant="caption" align="center" color="text.secondary">
                j={c}
              </Typography>
            ))}
            {Array.from({length: N}, (_, r) => (
              <React.Fragment key={`row${r}`}>
                <Typography variant="caption" sx={{alignSelf: 'center'}} color="text.secondary">
                  i={r}
                </Typography>
                {Array.from({length: N}, (_, c) => {
                  const known = frame.dp[r][c] != null;
                  const isCurrent = frame.i === r && frame.j === c;
                  return (
                    <Box
                      key={`${r}-${c}`}
                      sx={{
                        border: '1.5px solid',
                        borderColor:
                          isCurrent ? '#ef6c00' : known && r <= c ? '#8e24aa' : '#bdbdbd',
                        backgroundColor: cellBg(r, c, frame),
                        borderRadius: 1,
                        px: 0.5,
                        py: 0.75,
                        minHeight: 44,
                        fontFamily: 'monospace',
                        fontSize: 11,
                        textAlign: 'center',
                      }}
                    >
                      {r > c ? (
                        '·'
                      ) : known || isCurrent ? (
                        <>
                          <div style={{fontWeight: 700}}>
                            {known ? frame.dp[r][c] : '…'}
                          </div>
                          <div style={{opacity: 0.75}}>
                            {frame.opt[r][c] != null ? `o=${frame.opt[r][c]}` : ''}
                          </div>
                        </>
                      ) : (
                        '·'
                      )}
                    </Box>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="k candidates">
        {frame.i != null && frame.j != null ? (
          <>
            <Stack direction="row" spacing={0.75} sx={{flexWrap: 'wrap'}}>
              {Array.from({length: N}, (_, k) => {
                const inNaive = k >= frame.naiveLo && k <= frame.naiveHi;
                const inKnuth = k >= frame.lo && k <= frame.hi;
                let bg = '#f5f5f5';
                let border = '#bdbdbd';
                if (frame.bestK === k) {
                  bg = '#81c784';
                  border = '#2e7d32';
                } else if (frame.scanK === k) {
                  bg = '#4fc3f7';
                  border = '#0277bd';
                } else if (inKnuth) {
                  bg = '#e3f2fd';
                  border = '#0288d1';
                } else if (inNaive) {
                  bg = '#fff8e1';
                  border = '#ffb300';
                }
                return (
                  <Box
                    key={k}
                    sx={{
                      minWidth: 36,
                      textAlign: 'center',
                      border: '1.5px solid',
                      borderColor: border,
                      backgroundColor: bg,
                      borderRadius: 1,
                      py: 0.5,
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 700,
                      opacity: inNaive ? 1 : 0.35,
                    }}
                  >
                    {k}
                  </Box>
                );
              })}
            </Stack>
            <Typography variant="caption" display="block" sx={{mt: 1, fontFamily: 'monospace'}}>
              amber = naive k · blue = Knuth window · green = chosen opt
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Advance until a cell is selected.
          </Typography>
        )}
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

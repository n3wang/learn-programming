import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Classic 3×3: det = −16. Unit-diagonal L (Doolittle / CP-Algorithms “Kraut”). */
const A0 = [
  [2, 1, 1],
  [4, -6, 0],
  [-2, 7, 2],
];
const N = 3;

const LEGEND = [
  {key: 'U', label: 'Writing Uᵢⱼ', color: '#ffb74d', desc: 'Upper triangle (incl. diagonal)'},
  {key: 'L', label: 'Writing Lᵢⱼ', color: '#4fc3f7', desc: 'Strict lower triangle'},
  {key: 'D', label: 'diag(U) for det', color: '#81c784', desc: 'Product = det(A)'},
  {key: 'K', label: 'Known so far', color: '#ce93d8', desc: 'Already filled entry'},
];

function fmt(x) {
  if (x == null) return '·';
  const r = Math.round(x * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
}

function buildFrames() {
  const frames = [];
  const L = Array.from({length: N}, () => Array(N).fill(null));
  const U = Array.from({length: N}, () => Array(N).fill(null));
  for (let i = 0; i < N; i += 1) L[i][i] = 1;

  frames.push({
    L: L.map((r) => [...r]),
    U: U.map((r) => [...r]),
    hi: null,
    hj: null,
    kind: null,
    msg: `A = [[2,1,1],[4,−6,0],[−2,7,2]]. Set Lᵢᵢ=1. Fill column j of U (i≤j), then L (i>j).`,
  });

  for (let j = 0; j < N; j += 1) {
    for (let i = 0; i <= j; i += 1) {
      let sum = 0;
      const terms = [];
      for (let k = 0; k < i; k += 1) {
        sum += L[i][k] * U[k][j];
        terms.push(`${fmt(L[i][k])}·${fmt(U[k][j])}`);
      }
      const val = A0[i][j] - sum;
      U[i][j] = val;
      frames.push({
        L: L.map((r) => [...r]),
        U: U.map((r) => [...r]),
        hi: i,
        hj: j,
        kind: 'U',
        msg: `U[${i}][${j}] = A[${i}][${j}] − Σₖ L[${i}][k]U[k][${j}] = ${A0[i][j]}${
          terms.length ? ` − (${terms.join('+')})` : ''
        } = ${fmt(val)}.`,
      });
    }

    for (let i = j + 1; i < N; i += 1) {
      let sum = 0;
      const terms = [];
      for (let k = 0; k < j; k += 1) {
        sum += L[i][k] * U[k][j];
        terms.push(`${fmt(L[i][k])}·${fmt(U[k][j])}`);
      }
      const val = (A0[i][j] - sum) / U[j][j];
      L[i][j] = val;
      frames.push({
        L: L.map((r) => [...r]),
        U: U.map((r) => [...r]),
        hi: i,
        hj: j,
        kind: 'L',
        msg: `L[${i}][${j}] = (A[${i}][${j}] − Σₖ…)/U[${j}][${j}] = (${A0[i][j]}${
          terms.length ? ` − (${terms.join('+')})` : ''
        })/${fmt(U[j][j])} = ${fmt(val)}.`,
      });
    }
  }

  const diag = Array.from({length: N}, (_, i) => U[i][i]);
  const det = diag.reduce((p, x) => p * x, 1);
  frames.push({
    L: L.map((r) => [...r]),
    U: U.map((r) => [...r]),
    hi: null,
    hj: null,
    kind: 'det',
    msg: `det(A) = Π Uᵢᵢ = ${diag.map(fmt).join(' · ')} = ${fmt(det)}. (Check: cofactor expansion also gives −16.)`,
  });

  return frames;
}

function MatrixGrid({title, M, frame, which}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 0.5}}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${N}, minmax(48px, 1fr))`,
          gap: 0.5,
          minWidth: N * 52,
        }}
      >
        {Array.from({length: N}, (_, r) =>
          Array.from({length: N}, (_, c) => {
            const isHi = frame.hi === r && frame.hj === c && frame.kind === which;
            const isDet =
              frame.kind === 'det' && which === 'U' && r === c && M[r][c] != null;
            const known = M[r][c] != null;
            let bg = '#f5f5f5';
            let border = '#bdbdbd';
            if (isHi) {
              bg = which === 'U' ? '#ffb74d' : '#4fc3f7';
              border = which === 'U' ? '#ef6c00' : '#0277bd';
            } else if (isDet) {
              bg = '#81c784';
              border = '#2e7d32';
            } else if (known) {
              bg = '#e1bee7';
              border = '#8e24aa';
            }
            return (
              <Box
                key={`${which}-${r}-${c}`}
                sx={{
                  border: '1.5px solid',
                  borderColor: border,
                  backgroundColor: bg,
                  borderRadius: 1,
                  py: 1,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 13,
                  minHeight: 36,
                }}
              >
                {fmt(M[r][c])}
              </Box>
            );
          }),
        )}
      </Box>
    </Box>
  );
}

export default function KrautDeterminantSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Kraut / Doolittle LU"
      subtitle="Unit diagonal on L; det(A) = product of diag(U)."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Original A">
        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
          [[2, 1, 1], [4, −6, 0], [−2, 7, 2]]
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Factors">
        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
          <MatrixGrid title="L (ℓᵢᵢ = 1)" M={frame.L} frame={frame} which="L" />
          <MatrixGrid title="U" M={frame.U} frame={frame} which="U" />
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

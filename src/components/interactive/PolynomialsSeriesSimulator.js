import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const A = [1, 2, 3]; // 1+2x+3x²
const B = [4, 5]; // 4+5x

const MODES = {
  conv: {label: 'Convolution'},
  newton: {label: 'Newton inverse'},
};

const LEGEND = [
  {key: 'A', label: 'Coeff of A', color: '#5e35b1', desc: 'Left factor'},
  {key: 'B', label: 'Coeff of B', color: '#e65100', desc: 'Right factor'},
  {key: 'C', label: 'Product / inverse', color: '#2e7d32', desc: 'Result coefficient'},
  {key: 'H', label: 'Active term', color: '#ffb74d', desc: 'Current aᵢbⱼ or lift step'},
];

function mul(a, b) {
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      c[i + j] += a[i] * b[j];
    }
  }
  return c;
}

function buildConvFrames() {
  const frames = [];
  const n = A.length;
  const m = B.length;
  const C = Array(n + m - 1).fill(0);
  frames.push({
    C: [...C],
    i: null,
    j: null,
    msg: `A=[${A.join(',')}], B=[${B.join(',')}]. cₖ = Σᵢ aᵢ bₖ₋ᵢ (convolution).`,
  });
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < m; j += 1) {
      C[i + j] += A[i] * B[j];
      frames.push({
        C: [...C],
        i,
        j,
        msg: `Add a${i}·b${j}=${A[i]}·${B[j]} into c${i + j} → ${C[i + j]}.`,
      });
    }
  }
  frames.push({
    C: [...C],
    i: null,
    j: null,
    msg: `Done. AB = [${C.join(', ')}] (deg ${C.length - 1}). FFT does this in O(N log N).`,
  });
  return frames;
}

function buildNewtonFrames() {
  const frames = [];
  // Inverse of 1-x mod x^8 → [1,1,1,...]
  const Ainv = [1, -1, 0, 0, 0, 0, 0, 0];
  let B = [1];
  frames.push({
    C: [...B],
    i: null,
    j: null,
    msg: 'Invert A=1−x (A(0)=1). Start B₀ = A(0)⁻¹ = 1. Lift: B ← B(2−AB) mod x^{2ᵏ}.',
  });
  let k = 1;
  while (k < 8) {
    const m = Math.min(2 * k, 8);
    const ab = mul(Ainv.slice(0, m), B).slice(0, m);
    const t = ab.map((v, i) => (i === 0 ? 2 : 0) - v);
    B = mul(B, t).slice(0, m);
    frames.push({
      C: [...B],
      i: null,
      j: null,
      msg: `Lift to mod x^${m}: B ≡ [${B.join(', ')}]. Check A·B ≡ 1 (mod x^${m}).`,
    });
    k *= 2;
  }
  frames.push({
    C: [...B],
    i: null,
    j: null,
    msg: '1/(1−x) = Σ xᵏ. Same Newton pattern underlies log/exp/pow for FPS.',
  });
  return frames;
}

function buildFrames(mode) {
  return mode === 'conv' ? buildConvFrames() : buildNewtonFrames();
}

export default function PolynomialsSeriesSimulator() {
  const [mode, setMode] = useState('conv');
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Polynomial ops"
      subtitle="Naive convolution vs Newton series inverse."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
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
          <StepControls
            step={step}
            max={frames.length - 1}
            onStep={setStep}
            label="Step"
          />
        </Stack>
      }
    >
      {mode === 'conv' && (
        <CEBlock.Section label="Factors">
          <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
            A=[{A.join(', ')}] · B=[{B.join(', ')}]
            {frame.i != null ? ` · active a${frame.i}×b${frame.j}` : ''}
          </Typography>
        </CEBlock.Section>
      )}

      <CEBlock.Section label={mode === 'conv' ? 'Product coeffs cₖ' : 'Inverse coeffs B'}>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {frame.C.map((v, k) => {
            const active =
              mode === 'conv' && frame.i != null && frame.i + frame.j === k;
            return (
              <Box
                key={k}
                sx={{
                  minWidth: 44,
                  textAlign: 'center',
                  border: '1.5px solid',
                  borderColor: active ? '#ef6c00' : '#90a4ae',
                  backgroundColor: active ? '#ffe0b2' : '#e8f5e9',
                  borderRadius: 1,
                  py: 0.75,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <Typography variant="caption" display="block" color="text.secondary">
                  x^{k}
                </Typography>
                {v}
              </Box>
            );
          })}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

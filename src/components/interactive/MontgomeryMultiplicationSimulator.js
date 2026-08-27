import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const N = 97;
const R = 128; // 2^7
const NP = 33; // n^{-1} mod r
const X = 45;
const Y = 67;

const LEGEND = [
  {key: 'N', label: 'Normal space', color: '#5e35b1', desc: 'Ordinary residues mod n'},
  {key: 'M', label: 'Montgomery space', color: '#e65100', desc: 'x̄ = x·r mod n'},
  {key: 'R', label: 'REDC', color: '#2e7d32', desc: 'Multiply by r⁻¹ without division by n'},
];

function reduce(x) {
  const q = ((x % R) * NP) % R;
  let a = Math.trunc((x - q * N) / R);
  if (a < 0) a += N;
  return {q, a, x};
}

function buildFrames() {
  const frames = [];
  const xb = (X * R) % N;
  const yb = (Y * R) % N;

  frames.push({
    phase: 'intro',
    msg: `n=${N}, r=${R}=2⁷, gcd(n,r)=1. Goal: compute (${X}·${Y}) mod ${N} = ${(X * Y) % N} via Montgomery.`,
  });

  frames.push({
    phase: 'to-mont',
    xb,
    yb,
    msg: `Enter space: x̄ = x·r mod n → ${X}·${R}%${N}=${xb}. Similarly ȳ=${yb}. (One-time cost; then many cheap muls.)`,
  });

  const prod = xb * yb;
  frames.push({
    phase: 'naive-prod',
    xb,
    yb,
    prod,
    msg: `Plain product x̄·ȳ = ${xb}·${yb}=${prod} ≡ (x·y)·r² (mod n) — one extra factor of r.`,
  });

  const red = reduce(prod);
  frames.push({
    phase: 'redc',
    xb,
    yb,
    prod,
    q: red.q,
    zb: red.a,
    msg: `REDC: q=(prod mod r)·n' mod r = ${red.q} (n'=${NP}). a=(prod−q·n)/r → ${red.a}. That is x̄ * ȳ = (x·y)·r mod n.`,
  });

  const back = reduce(red.a);
  frames.push({
    phase: 'back',
    xb,
    yb,
    zb: red.a,
    z: back.a,
    msg: `Exit space: REDC(z̄) = z̄·r⁻¹ ≡ z (mod n) → ${back.a}. Check: ${X}·${Y}%${N}=${(X * Y) % N}.`,
  });

  frames.push({
    phase: 'done',
    z: back.a,
    msg: `Same answer, but REDC used only mod/div by r (bit ops when r=2ᵐ), not a full division by n.`,
  });

  return frames;
}

export default function MontgomeryMultiplicationSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Montgomery mul (toy)"
      subtitle={`n=${N}, r=${R}, x=${X}, y=${Y}`}
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Values">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {[
            ['x', X, '#ede7f6'],
            ['y', Y, '#ede7f6'],
            ['x̄', frame.xb, '#ffe0b2'],
            ['ȳ', frame.yb, '#ffe0b2'],
            ['x̄·ȳ', frame.prod, '#e8f5e9'],
            ['q', frame.q, '#e8f5e9'],
            ['z̄', frame.zb, '#ffe0b2'],
            ['z', frame.z, '#ede7f6'],
          ].map(([lab, val, bg]) =>
            val == null ? null : (
              <Box
                key={lab}
                sx={{
                  border: '1.5px solid #90a4ae',
                  borderRadius: 1,
                  px: 1.25,
                  py: 0.75,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  backgroundColor: bg,
                }}
              >
                <strong>{lab}</strong>={val}
              </Box>
            ),
          )}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

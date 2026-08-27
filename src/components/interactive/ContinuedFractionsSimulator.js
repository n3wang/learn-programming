import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const EXAMPLES = {
  '7/9': {p: 7, q: 9, label: '7/9'},
  '415/93': {p: 415, q: 93, label: '415/93'},
  '13/5': {p: 13, q: 5, label: '13/5'},
};

const LEGEND = [
  {key: 'Q', label: 'Quotient step', color: '#ffb74d', desc: 'aᵢ = ⌊p/q⌋ from current pair'},
  {key: 'R', label: 'Remainder swap', color: '#4fc3f7', desc: 'Next step uses (q, p mod q) — Euclidean algorithm'},
  {key: 'C', label: 'Convergent', color: '#c8e6c9', desc: 'Rational pₖ/qₖ after prefix [a₀;…;aₖ]'},
];

function buildEuclideanFrames(p0, q0) {
  const frames = [];
  let p = p0;
  let q = q0;
  const coeffs = [];
  const convP = [0, 1];
  const convQ = [1, 0];

  frames.push({
    p,
    q,
    a: null,
    coeffs: [],
    convP: [...convP],
    convQ: [...convQ],
    msg: `Build [a₀; a₁; …] for ${p0}/${q0}. Each step: a = ⌊p/q⌋, then (p,q) ← (q, p mod q).`,
  });

  while (q !== 0) {
    const a = Math.floor(p / q);
    coeffs.push(a);
    convP.push(a * convP[convP.length - 1] + convP[convP.length - 2]);
    convQ.push(a * convQ[convQ.length - 1] + convQ[convQ.length - 2]);

    frames.push({
      p,
      q,
      a,
      coeffs: [...coeffs],
      convP: [...convP],
      convQ: [...convQ],
      msg: `a = ⌊${p}/${q}⌋ = ${a}. Append to expansion. Next: (p,q) = (${q}, ${p % q}).`,
    });

    const np = q;
    const nq = p % q;
    p = np;
    q = nq;

    if (q !== 0) {
      frames.push({
        p,
        q,
        a: null,
        coeffs: [...coeffs],
        convP: [...convP],
        convQ: [...convQ],
        msg: `Swapped to p=${p}, q=${q}. Same as one Euclidean GCD step.`,
      });
    }
  }

  const k = coeffs.length - 1;
  frames.push({
    p: 0,
    q: 0,
    a: null,
    coeffs: [...coeffs],
    convP: [...convP],
    convQ: [...convQ],
    msg: `Done. ${p0}/${q0} = [${coeffs.join('; ')}]. Final convergent r_${k} = ${convP[convP.length - 1]}/${convQ[convQ.length - 1]}.`,
  });
  return frames;
}

function evalCf(coeffs) {
  if (!coeffs.length) return null;
  let val = coeffs[coeffs.length - 1];
  for (let i = coeffs.length - 2; i >= 0; i -= 1) {
    val = coeffs[i] + 1 / val;
  }
  return val;
}

export default function ContinuedFractionsSimulator() {
  const [key, setKey] = useState('7/9');
  const ex = EXAMPLES[key];
  const frames = useMemo(() => buildEuclideanFrames(ex.p, ex.q), [ex.p, ex.q]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const onExample = (k) => {
    setKey(k);
    setStep(0);
  };

  const approx = frame.coeffs.length ? evalCf(frame.coeffs) : null;

  return (
    <CEBlock
      title="Continued fraction from p/q"
      subtitle="Each quotient aᵢ is one Euclidean step. Convergents update in parallel."
      legend={<ColorLegend items={LEGEND} />}
    >
      <CEBlock.Section label="Example">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mb: 1}}>
          {Object.entries(EXAMPLES).map(([id, e]) => (
            <Chip
              key={id}
              label={e.label}
              size="small"
              color={id === key ? 'primary' : 'default'}
              variant={id === key ? 'filled' : 'outlined'}
              onClick={() => onExample(id)}
            />
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="State">
        <Typography variant="body2" sx={{fontFamily: 'monospace', mb: 0.75}}>
          p={frame.p} &nbsp; q={frame.q}
          {frame.a != null ? ` · a=${frame.a}` : ''}
        </Typography>
        <Typography variant="body2" sx={{fontFamily: 'monospace', mb: 0.75}}>
          coeffs: [{frame.coeffs.join(', ')}]
          {frame.coeffs.length ? ` → [${frame.coeffs.join('; ')}]` : ''}
        </Typography>
        {frame.convP.length > 2 && (
          <Typography variant="body2" sx={{fontFamily: 'monospace', mb: 0.75}}>
            latest convergent: {frame.convP[frame.convP.length - 1]}/
            {frame.convQ[frame.convQ.length - 1]}
            {approx != null ? ` ≈ ${approx.toFixed(6)}` : ''}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {frame.msg}
        </Typography>
      </CEBlock.Section>

      <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
    </CEBlock>
  );
}

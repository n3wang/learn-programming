import React, {useMemo, useState} from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const MODES = {
  trial: {label: 'Trial division'},
  fermat: {label: 'Fermat (Carmichael)'},
  mr: {label: 'Miller–Rabin'},
};

const LEGEND = [
  {key: 'D', label: 'Trial d', color: '#7b1fa2', desc: 'Current divisor probe'},
  {key: 'W', label: 'Witness', color: '#c62828', desc: 'Proves composite'},
  {key: 'L', label: 'Liar / pass', color: '#2e7d32', desc: 'Equations hold (maybe prime)'},
  {key: 'S', label: 'Squaring step', color: '#0288d1', desc: 'a^{2ʳd} in MR chain'},
];

function buildTrialFrames() {
  const n = 91;
  const frames = [];
  frames.push({
    kind: 'trial',
    d: null,
    msg: `Trial division: is n=${n} prime? Check d from 2 to ⌊√n⌋.`,
  });
  for (let d = 2; d * d <= n; d += 1) {
    const div = n % d === 0;
    frames.push({
      kind: 'trial',
      d,
      msg: div
        ? `d=${d} divides ${n} → composite (${n}=${d}×${n / d}).`
        : `d=${d}: ${n} % ${d} ≠ 0.`,
    });
    if (div) break;
  }
  return frames;
}

function buildFermatFrames() {
  const n = 561; // Carmichael
  const frames = [];
  frames.push({
    kind: 'fermat',
    a: null,
    msg: `Fermat test on Carmichael number n=${n}=3·11·17. Check a^{n−1} ≡ 1 (mod n).`,
  });
  frames.push({
    kind: 'fermat',
    a: 2,
    pass: true,
    msg: `a=2: 2^{560} ≡ 1 (mod 561). Fermat liar — test says “probably prime”.`,
  });
  frames.push({
    kind: 'fermat',
    a: 3,
    pass: false,
    msg: `a=3: gcd(3,561)≠1 and 3^{560} ≡ 375 ≠ 1 → witness. Rare luck catches Carmichael.`,
  });
  frames.push({
    kind: 'fermat',
    a: null,
    msg: 'Only 646 Carmichael numbers below 10⁹ — Fermat is still used when speed matters.',
  });
  return frames;
}

function buildMrFrames() {
  const n = 221; // 13×17
  const s = 2;
  const d = 55;
  const frames = [];
  frames.push({
    kind: 'mr',
    a: null,
    x: null,
    msg: `Miller–Rabin: n=${n}=13·17. Write n−1=2^s·d → 220=2²·55 (s=${s}, d=${d}).`,
  });
  frames.push({
    kind: 'mr',
    a: 2,
    x: 128,
    r: 0,
    msg: `Base a=2: compute x = a^d = 2^{55} ≡ 128 (mod 221). Not 1 or n−1.`,
  });
  frames.push({
    kind: 'mr',
    a: 2,
    x: 30,
    r: 1,
    msg: `Square: x ← x² ≡ 30 (mod 221). Still ≠ n−1=220 → check_composite = true.`,
  });
  frames.push({
    kind: 'mr',
    a: 2,
    x: 30,
    witness: true,
    msg: `Witness a=2 proves n is composite. At most 1/4 of bases are strong liars.`,
  });
  frames.push({
    kind: 'mr',
    a: 174,
    x: 220,
    pass: true,
    msg: `Strong liar example: a=174 eventually hits −1. Still need more random bases.`,
  });
  return frames;
}

export default function PrimalityTestsSimulator() {
  const [mode, setMode] = useState('trial');
  const frames = useMemo(() => {
    if (mode === 'fermat') return buildFermatFrames();
    if (mode === 'mr') return buildMrFrames();
    return buildTrialFrames();
  }, [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Primality tests walkthrough"
      subtitle="Trial division, Fermat on Carmichael 561, Miller–Rabin on 221."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls
          step={step}
          max={frames.length - 1}
          onStep={setStep}
          label="Step"
        />
      }
    >
      <CEBlock.Section label="Mode">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Object.entries(MODES).map(([k, v]) => (
            <Chip
              key={k}
              label={v.label}
              color={mode === k ? 'primary' : 'default'}
              onClick={() => {
                setMode(k);
                setStep(0);
              }}
              size="small"
            />
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="State">
        <Typography variant="body2" sx={{fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
          {frame.kind === 'trial' &&
            `n = 91\nd = ${frame.d ?? '—'}`}
          {frame.kind === 'fermat' &&
            `n = 561 (Carmichael)\na = ${frame.a ?? '—'}${
              frame.pass === true ? '\nresult: a^{n−1} ≡ 1  (liar)' : ''
            }${frame.pass === false ? '\nresult: a^{n−1} ≢ 1  (witness)' : ''}`}
          {frame.kind === 'mr' &&
            `n = 221\nn−1 = 2² · 55\na = ${frame.a ?? '—'}\nx = ${frame.x ?? '—'}${
              frame.r != null ? `\nr = ${frame.r}` : ''
            }${frame.witness ? '\nwitness → COMPOSITE' : ''}${
              frame.pass ? '\nstrong liar for this base' : ''
            }`}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

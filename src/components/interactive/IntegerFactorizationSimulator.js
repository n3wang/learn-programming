import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Classic Pollard's rho demo: n = 2206637 = 317 × 6961, f(x)=x²+1, x0=2. */
const N = 2206637;
const P = 317;
const C = 1;
const X0 = 2;

const EXAMPLES = {
  rho: {label: 'Pollard ρ (Floyd)', mode: 'rho'},
  trial: {label: 'Trial division', mode: 'trial'},
};

const LEGEND = [
  {key: 'T', label: 'Tortoise x', color: '#4fc3f7', desc: 'Advances one step: x ← f(x)'},
  {key: 'H', label: 'Hare y', color: '#ffb74d', desc: 'Advances two steps: y ← f(f(y))'},
  {key: 'G', label: 'gcd hit', color: '#81c784', desc: 'gcd(|x−y|, n) > 1 → factor'},
  {key: 'D', label: 'Trial divisor', color: '#ce93d8', desc: 'Current d in trial division'},
];

function f(x) {
  return (x * x + C) % N;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

function buildRhoFrames() {
  const frames = [];
  let x = X0;
  let y = X0;
  let g = 1;
  let i = 0;

  frames.push({
    mode: 'rho',
    i,
    x,
    y,
    g: null,
    msg: `n=${N}, f(x)=x²+1 mod n, x₀=${X0}. Watch {xᵢ mod ${P}} enter a ρ-shaped cycle.`,
  });

  while (g === 1 && i < 40) {
    x = f(x);
    y = f(f(y));
    g = gcd(x - y, N);
    i += 1;
    frames.push({
      mode: 'rho',
      i,
      x,
      y,
      xp: x % P,
      yp: y % P,
      g,
      msg:
        g === 1
          ? `i=${i}: x≡${x % P} (mod ${P}), y≡${y % P} (mod ${P}), gcd=1`
          : `i=${i}: gcd(|x−y|, n)=${g} → factor found! n/${g}=${N / g}`,
    });
  }
  return frames;
}

function buildTrialFrames() {
  const frames = [];
  let n = 91; // 7 × 13
  const factors = [];
  frames.push({
    mode: 'trial',
    n,
    d: null,
    factors: [],
    msg: `Factor n=${n} by trial division up to √n.`,
  });

  for (let d = 2; d * d <= n; d += 1) {
    frames.push({
      mode: 'trial',
      n,
      d,
      factors: [...factors],
      msg: `Try d=${d}. n % d = ${n % d}.`,
    });
    while (n % d === 0) {
      factors.push(d);
      n = Math.floor(n / d);
      frames.push({
        mode: 'trial',
        n,
        d,
        factors: [...factors],
        msg: `Divide: push ${d}, now n=${n}.`,
      });
    }
  }
  if (n > 1) {
    factors.push(n);
    frames.push({
      mode: 'trial',
      n: 1,
      d: null,
      factors: [...factors],
      msg: `Leftover prime factor ${n}. Done: [${factors.join(' × ')}]`,
    });
  }
  return frames;
}

export default function IntegerFactorizationSimulator() {
  const [key, setKey] = useState('rho');
  const frames = useMemo(
    () => (key === 'rho' ? buildRhoFrames() : buildTrialFrames()),
    [key]
  );
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const onExample = (k) => {
    setKey(k);
    setStep(0);
  };

  return (
    <CEBlock
      title="Integer factorization walkthrough"
      subtitle="Trial division on 91, or Pollard's ρ (Floyd) on 2206637 = 317×6961."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Mode">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {Object.entries(EXAMPLES).map(([id, s]) => (
            <Chip
              key={id}
              label={s.label}
              size="small"
              color={id === key ? 'primary' : 'default'}
              variant={id === key ? 'filled' : 'outlined'}
              onClick={() => onExample(id)}
            />
          ))}
        </Stack>
      </CEBlock.Section>

      {frame.mode === 'rho' ? (
        <CEBlock.Section label="Pointers">
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Box sx={{px: 1.5, py: 1, bgcolor: '#e3f2fd', borderRadius: 1, fontFamily: 'monospace'}}>
              tortoise x = {frame.x}
              {frame.xp != null ? ` (mod p: ${frame.xp})` : ''}
            </Box>
            <Box sx={{px: 1.5, py: 1, bgcolor: '#fff3e0', borderRadius: 1, fontFamily: 'monospace'}}>
              hare y = {frame.y}
              {frame.yp != null ? ` (mod p: ${frame.yp})` : ''}
            </Box>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: frame.g > 1 ? '#c8e6c9' : '#f5f5f5',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              gcd = {frame.g == null ? '—' : frame.g}
            </Box>
          </Stack>
        </CEBlock.Section>
      ) : (
        <CEBlock.Section label="State">
          <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
            n={frame.n}
            {frame.d != null ? ` · d=${frame.d}` : ''}
            {' · factors=['}
            {frame.factors.join(', ')}
            {']'}
          </Typography>
        </CEBlock.Section>
      )}

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

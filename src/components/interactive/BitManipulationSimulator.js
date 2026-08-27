import React, {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const WIDTH = 8;

const OPS = {
  and: {
    label: 'n & (n−1)',
    n: 0b01011000,
    desc: 'Clear rightmost set bit (Brian Kernighan step)',
    compute: (n) => ({ a: n, b: n - 1, op: '&', result: n & (n - 1) }),
  },
  power2: {
    label: 'Power of 2?',
    n: 0b00100000,
    desc: 'n && !(n & (n−1)) — single bit set',
    compute: (n) => ({ a: n, b: n - 1, op: '&', result: n & (n - 1), extra: !(n & (n - 1)) && n !== 0 }),
  },
  lowbit: {
    label: 'n & −n',
    n: 0b00110100,
    desc: 'Extract lowest set bit',
    compute: (n) => ({ a: n, b: -n & 0xff, op: '&', result: n & (-n & 0xff) }),
  },
  xor: {
    label: 'n ^ (n−1)',
    n: 0b01011000,
    desc: 'All bits from rightmost set through LSB flip',
    compute: (n) => ({ a: n, b: n - 1, op: '^', result: n ^ (n - 1) }),
  },
};

function toBits(n, width = WIDTH) {
  return n.toString(2).padStart(width, '0').slice(-width);
}

function BitRow({label, value, highlight = []}) {
  const bits = toBits(value);
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{mb: 0.75}}>
      <Typography variant="caption" sx={{fontFamily: 'monospace', minWidth: 72, fontWeight: 600}}>
        {label}
      </Typography>
      <Stack direction="row" spacing={0.25}>
        {bits.split('').map((b, i) => (
          <Box
            key={i}
            sx={{
              width: 22,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              backgroundColor: highlight.includes(i) ? '#fff3e0' : b === '1' ? '#c8e6c9' : '#eceff1',
              border: '1px solid',
              borderColor: highlight.includes(i) ? '#f57c00' : '#cfd8dc',
            }}
          >
            {b}
          </Box>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{fontFamily: 'monospace', ml: 0.5}}>
        = {value}
      </Typography>
    </Stack>
  );
}

function buildKernighanFrames(n) {
  const frames = [];
  let cur = n;
  let step = 0;
  while (cur) {
    const prev = cur;
    const next = cur & (cur - 1);
    frames.push({
      n: cur,
      prev,
      next,
      cleared: findRightmostBit(prev),
      msg: step === 0
        ? `Start n=${prev}. Count set bits with n &= n-1 until n=0.`
        : `Step ${step}: n=${prev} → n & (n-1) = ${next}. Cleared bit at position ${findRightmostBit(prev)}.`,
    });
    cur = next;
    step += 1;
  }
  frames.push({
    n: 0,
    prev: null,
    next: 0,
    cleared: null,
    msg: `Done. Popcount(${n}) = ${step}.`,
  });
  return frames;
}

function findRightmostBit(n) {
  if (!n) return null;
  let i = 0;
  while (((n >> i) & 1) === 0) i += 1;
  return i;
}

const LEGEND = [
  {key: '1', label: 'Set bit', color: '#c8e6c9', desc: 'Bit equals 1'},
  {key: '0', label: 'Clear bit', color: '#eceff1', desc: 'Bit equals 0'},
  {key: 'H', label: 'Highlighted', color: '#fff3e0', desc: 'Bit affected by this operation'},
];

export default function BitManipulationSimulator() {
  const [mode, setMode] = useState('kernighan');
  const [opKey, setOpKey] = useState('and');
  const [step, setStep] = useState(0);

  const op = OPS[opKey];
  const kernighan = useMemo(() => buildKernighanFrames(0b01011000), []);

  const onMode = (m) => {
    setMode(m);
    setStep(0);
  };
  const onOp = (k) => {
    setOpKey(k);
    setStep(0);
  };

  const opData = op.compute(op.n);
  const highlightA = mode === 'op' && opKey === 'and' ? [findRightmostBit(op.n)] : [];
  const highlightR = mode === 'op' && opKey === 'and' ? [findRightmostBit(op.n)] : [];

  const kFrame = kernighan[Math.min(step, kernighan.length - 1)];

  return (
    <CEBlock
      title="Bit manipulation playground"
      subtitle="Watch bitwise ops on 8-bit examples, or step through Brian Kernighan's popcount."
      legend={<ColorLegend items={LEGEND} />}
    >
      <CEBlock.Section label="Mode">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mb: 1}}>
          <Chip
            label="Single operation"
            size="small"
            color={mode === 'op' ? 'primary' : 'default'}
            variant={mode === 'op' ? 'filled' : 'outlined'}
            onClick={() => onMode('op')}
          />
          <Chip
            label="Brian Kernighan popcount"
            size="small"
            color={mode === 'kernighan' ? 'primary' : 'default'}
            variant={mode === 'kernighan' ? 'filled' : 'outlined'}
            onClick={() => onMode('kernighan')}
          />
        </Stack>
      </CEBlock.Section>

      {mode === 'op' ? (
        <>
          <CEBlock.Section label="Operation">
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mb: 1.5}}>
              {Object.entries(OPS).map(([k, o]) => (
                <Chip
                  key={k}
                  label={o.label}
                  size="small"
                  color={k === opKey ? 'primary' : 'default'}
                  variant={k === opKey ? 'filled' : 'outlined'}
                  onClick={() => onOp(k)}
                />
              ))}
            </Stack>
            <BitRow label="n" value={opData.a} highlight={highlightA.filter((x) => x != null)} />
            <BitRow label={opKey === 'lowbit' ? '−n' : 'n−1'} value={opData.b} />
            <Typography variant="caption" color="text.secondary" sx={{display: 'block', my: 0.5, fontFamily: 'monospace'}}>
              ───────── {opData.op} ─────────
            </Typography>
            <BitRow label="result" value={opData.result} highlight={highlightR.filter((x) => x != null)} />
            {opKey === 'power2' && (
              <Typography variant="body2" sx={{mt: 1}}>
                isPowerOfTwo = {String(opData.extra)}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
              {op.desc}
            </Typography>
          </CEBlock.Section>
        </>
      ) : (
        <>
          <CEBlock.Section label="Popcount 0b01011000 = 88">
            <BitRow
              label="n"
              value={kFrame.n}
              highlight={kFrame.cleared != null ? [kFrame.cleared] : []}
            />
            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
              {kFrame.msg}
            </Typography>
          </CEBlock.Section>
          <StepControls
            step={step}
            max={kernighan.length - 1}
            onStep={setStep}
            label="Step"
          />
        </>
      )}
    </CEBlock>
  );
}

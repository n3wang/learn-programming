import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Truncated 8-bit toy table: only bits 2..7 matter for d=8 demos. Real 32-bit table is in the lesson. */
const LOG_TABLE_8 = {
  2: 0xd4, // illustrative stand-ins — demo focuses on the bit-clearing loop shape
  3: 0x18,
  4: 0x70,
  5: 0xe0,
  6: 0xc0,
  7: 0x80,
};

const EXAMPLES = {
  5: {label: 'x = 5 (101₂)', x: 5},
  13: {label: 'x = 13 (1101₂)', x: 13},
  17: {label: 'x = 17 (10001₂)', x: 17},
};

const LEGEND = [
  {key: 'N', label: 'Current n', color: '#ffb74d', desc: 'Bit position under test'},
  {key: 'S', label: 'Bit set → multiply', color: '#4fc3f7', desc: 'x := x + (x≪n) clears bit n'},
  {key: 'C', label: 'Already cleared', color: '#c8e6c9', desc: 'Lower bits stay fixed (x odd)'},
  {key: 'R', label: 'Accumulated r', color: '#ce93d8', desc: 'Running 4L estimate (demo subtracts toy table)'},
];

function toBin8(v) {
  return (v & 0xff).toString(2).padStart(8, '0');
}

function buildLogFrames(x0) {
  const frames = [];
  let x = x0 & 0xff;
  let r = 0;
  const hits = [];

  frames.push({
    x,
    r,
    n: null,
    hit: false,
    hits: [],
    msg: `Start mbin_log on odd x=${x0} (${toBin8(x0)}). Goal: multiply by (2ⁿ+1) until x ≡ 1 (mod 2⁸) in this toy.`,
  });

  for (let n = 2; n < 8; n += 1) {
    const bitSet = (x & (1 << n)) !== 0;
    frames.push({
      x,
      r,
      n,
      hit: bitSet,
      hits: [...hits],
      msg: bitSet
        ? `Bit ${n} is set. Apply x = x + (x≪${n}) and subtract table[${n}].`
        : `Bit ${n} clear — skip.`,
    });
    if (bitSet) {
      x = (x + (x << n)) & 0xff;
      r = (r - (LOG_TABLE_8[n] || 0)) & 0xff;
      hits.push(n);
      frames.push({
        x,
        r,
        n,
        hit: true,
        hits: [...hits],
        msg: `After multiply by 2^${n}+1: x=${x} (${toBin8(x)}), r=${r} (${toBin8(r)}). Bit ${n} is now 0.`,
      });
    }
  }

  frames.push({
    x,
    r,
    n: null,
    hit: false,
    hits: [...hits],
    msg: `Done (toy d=8). Hit n's: [${hits.join(', ') || 'none'}]. Real code uses the 32-bit table and full uint32 wrap.`,
  });
  return frames;
}

function bitColor(i, frame) {
  if (frame.n === i && frame.hit) return '#4fc3f7';
  if (frame.n === i) return '#ffb74d';
  if (frame.hits.includes(i)) return '#c8e6c9';
  if (i < 2) return '#eceff1';
  return '#f5f5f5';
}

export default function FactoringExponentiationSimulator() {
  const [key, setKey] = useState('13');
  const ex = EXAMPLES[key];
  const frames = useMemo(() => buildLogFrames(ex.x), [ex.x]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const onExample = (k) => {
    setKey(k);
    setStep(0);
  };

  const bits = toBin8(frame.x).split('').map(Number); // MSB left

  return (
    <CEBlock
      title="mbin_log bit walk (toy 8-bit)"
      subtitle="Same loop shape as 32-bit: when bit n is set, x += x≪n clears it."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Odd base x">
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

      <CEBlock.Section label="x bits (MSB → LSB)">
        <Stack direction="row" spacing={0.5} justifyContent="center">
          {bits.map((b, idx) => {
            const bitIndex = 7 - idx;
            return (
              <Box key={bitIndex} sx={{textAlign: 'center', minWidth: 36}}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {bitIndex}
                </Typography>
                <Box
                  sx={{
                    py: 1,
                    borderRadius: 1,
                    border: '1.5px solid',
                    borderColor: frame.n === bitIndex ? '#ef6c00' : '#90a4ae',
                    backgroundColor: bitColor(bitIndex, frame),
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                >
                  {b}
                </Box>
              </Box>
            );
          })}
        </Stack>
        <Typography variant="body2" sx={{fontFamily: 'monospace', mt: 1, textAlign: 'center'}}>
          x={frame.x} · r={frame.r}
          {frame.n != null ? ` · n=${frame.n}` : ''}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

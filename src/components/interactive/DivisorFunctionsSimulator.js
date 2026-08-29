import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const EXAMPLES = {
  60: {label: 'n=60', n: 60},
  12: {label: 'n=12', n: 12},
  100: {label: 'n=100', n: 100},
};

const LEGEND = [
  {key: 'F', label: 'Prime factor', color: '#5e35b1', desc: 'p^e peeled from n'},
  {key: 'D', label: 'd(n) factor', color: '#2e7d32', desc: 'Multiply by (e+1)'},
  {key: 'S', label: 'σ(n) factor', color: '#e65100', desc: 'Multiply by (1+p+…+p^e)'},
];

function factorSteps(n0) {
  const frames = [];
  let num = n0;
  let dTotal = 1;
  let sTotal = 1;
  const factors = [];

  frames.push({
    num,
    dTotal,
    sTotal,
    factors: [],
    highlight: null,
    msg: `Start with n=${n0}. Trial-divide; for each p^e multiply d by (e+1) and σ by (p^{e+1}−1)/(p−1).`,
  });

  for (let i = 2; i * i <= num; i += 1) {
    if (num % i === 0) {
      let e = 0;
      do {
        e += 1;
        num = Math.floor(num / i);
      } while (num % i === 0);
      let geom = 0;
      let pow = 1;
      for (let t = 0; t <= e; t += 1) {
        geom += pow;
        pow *= i;
      }
      dTotal *= e + 1;
      sTotal *= geom;
      factors.push({p: i, e, geom});
      frames.push({
        num,
        dTotal,
        sTotal,
        factors: factors.map((f) => ({...f})),
        highlight: factors.length - 1,
        msg: `Found ${i}^${e}. d ← d·(${e}+1)=${dTotal}. σ ← σ·(1+${i}+…+${i}^${e})=${sTotal}. Remaining=${num}.`,
      });
    }
  }
  if (num > 1) {
    dTotal *= 2;
    sTotal *= 1 + num;
    factors.push({p: num, e: 1, geom: 1 + num});
    frames.push({
      num: 1,
      dTotal,
      sTotal,
      factors: factors.map((f) => ({...f})),
      highlight: factors.length - 1,
      msg: `Leftover prime ${num}^1. d ← d·2=${dTotal}. σ ← σ·(1+${num})=${sTotal}.`,
    });
  }

  frames.push({
    num: 1,
    dTotal,
    sTotal,
    factors: factors.map((f) => ({...f})),
    highlight: null,
    msg: `Done: d(${n0})=${dTotal}, σ(${n0})=${sTotal}.`,
  });

  return frames;
}

export default function DivisorFunctionsSimulator() {
  const [ex, setEx] = useState('60');
  const frames = useMemo(() => factorSteps(EXAMPLES[ex].n), [ex]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="d(n) and σ(n) from factorization"
      subtitle="Trial division peels p^e and updates both multiplicative formulas."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(EXAMPLES).map(([k, v]) => (
              <Chip
                key={k}
                size="small"
                label={v.label}
                color={ex === k ? 'primary' : 'default'}
                onClick={() => {
                  setEx(k);
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
      <CEBlock.Section label="Running products">
        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
          remaining={frame.num} · d={frame.dTotal} · σ={frame.sTotal}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Factors so far">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {frame.factors.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              (none yet)
            </Typography>
          ) : (
            frame.factors.map((f, idx) => (
              <Box
                key={`${f.p}-${idx}`}
                sx={{
                  border: '1.5px solid',
                  borderColor: frame.highlight === idx ? '#ef6c00' : '#90a4ae',
                  backgroundColor: frame.highlight === idx ? '#ffe0b2' : '#f5f5f5',
                  borderRadius: 1,
                  px: 1.25,
                  py: 0.75,
                  fontFamily: 'monospace',
                  fontSize: 13,
                }}
              >
                {f.p}^{f.e} · (e+1={f.e + 1}) · geom={f.geom}
              </Box>
            ))
          )}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

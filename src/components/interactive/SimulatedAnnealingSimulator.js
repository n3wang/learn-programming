import React, {useMemo, useState} from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Discrete 1D landscape: local min at x=2 (E=3), global at x=7 (E=1). */
const ENERGY = [8, 5, 3, 4, 6, 5, 2.5, 1, 3, 7];

const LEGEND = [
  {key: 'C', label: 'Current s', color: '#0288d1', desc: 'State being searched'},
  {key: 'N', label: 'Neighbor', color: '#ef6c00', desc: 'Candidate s_next (±1)'},
  {key: 'B', label: 'Best so far', color: '#2e7d32', desc: 'Lowest E seen'},
  {key: 'R', label: 'Rejected', color: '#c62828', desc: 'Worse move refused at this T'},
];

function buildFrames() {
  const frames = [];
  let s = 2;
  let best = 2;
  let T = 4;
  const u = 0.7;

  frames.push({
    s,
    next: null,
    best,
    T,
    accepted: null,
    msg: `Start at local min s=${s}, E=${ENERGY[s]}. Global min is at s=7 (E=1). High T lets us climb out.`,
  });

  const script = [
    {next: 3, roll: 0.2}, // worse 3→4, Δ=1, exp(-1/4)≈0.78 → accept
    {next: 4, roll: 0.1}, // worse 4→6, Δ=2, exp(-2/4)≈0.61 → accept
    {next: 5, roll: 0.9}, // better 6→5 → always accept
    {next: 6, roll: 0.1}, // better → accept
    {next: 7, roll: 0.1}, // better → accept (global)
    {next: 8, roll: 0.95}, // worse at cooler T → reject
    {next: 6, roll: 0.5}, // worse than best current at low T → maybe reject
  ];

  for (const step of script) {
    const E = ENERGY[s];
    const En = ENERGY[step.next];
    const better = En < E;
    const prob = better ? 1 : Math.exp(-(En - E) / T);
    const accept = better || step.roll <= prob;
    frames.push({
      s,
      next: step.next,
      best,
      T: Math.round(T * 1000) / 1000,
      accepted: null,
      prob: Math.round(prob * 1000) / 1000,
      msg: better
        ? `Propose s_next=${step.next}, E=${En} < E(s)=${E} → always accept.`
        : `Propose s_next=${step.next}, ΔE=${(En - E).toFixed(1)}, P=exp(−ΔE/T)≈${prob.toFixed(2)}, roll=${step.roll} → ${
            accept ? 'accept' : 'reject'
          }.`,
    });
    if (accept) {
      s = step.next;
      if (ENERGY[s] < ENERGY[best]) best = s;
    }
    frames.push({
      s,
      next: null,
      best,
      T: Math.round(T * 1000) / 1000,
      accepted: accept,
      msg: accept
        ? `Moved to s=${s}. Cool: T ← ${T.toFixed(2)} × ${u}. Best E=${ENERGY[best]} at s=${best}.`
        : `Stay at s=${s}. Cool: T ← ${T.toFixed(2)} × ${u}. Best still s=${best}.`,
    });
    T *= u;
  }

  frames.push({
    s,
    next: null,
    best,
    T: Math.round(T * 1000) / 1000,
    accepted: null,
    msg: `Low T ≈ hill-climbing. Track s_best across the run (here s=${best}, E=${ENERGY[best]}).`,
  });

  return frames;
}

export default function SimulatedAnnealingSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const W = 400;
  const H = 160;
  const pad = 28;
  const maxE = Math.max(...ENERGY);

  return (
    <CEBlock
      title="Simulated annealing on a 1D landscape"
      subtitle="Escape a local minimum when T is high; settle near the global minimum as T cools."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Energy E(x)">
        <svg width={W} height={H} style={{display: 'block', maxWidth: '100%'}}>
          {ENERGY.map((e, x) => {
            const barW = (W - 2 * pad) / ENERGY.length - 4;
            const bx = pad + x * ((W - 2 * pad) / ENERGY.length);
            const bh = ((H - 2 * pad) * e) / maxE;
            const by = H - pad - bh;
            let fill = '#cfd8dc';
            if (x === frame.best) fill = '#a5d6a7';
            if (x === frame.s) fill = '#81d4fa';
            if (x === frame.next) fill = '#ffcc80';
            if (frame.accepted === false && x === frame.next) fill = '#ef9a9a';
            return (
              <g key={x}>
                <rect x={bx} y={by} width={barW} height={bh} fill={fill} stroke="#546e7a" />
                <text x={bx + barW / 2} y={H - 8} textAnchor="middle" fontSize="10">
                  {x}
                </text>
              </g>
            );
          })}
        </svg>
        <Stack direction="row" spacing={1} sx={{mt: 1}} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`s = ${frame.s} (E=${ENERGY[frame.s]})`} color="primary" />
          <Chip size="small" label={`T ≈ ${frame.T}`} />
          <Chip
            size="small"
            color="success"
            label={`best s=${frame.best} (E=${ENERGY[frame.best]})`}
          />
          {frame.prob != null && <Chip size="small" label={`P ≈ ${frame.prob}`} />}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

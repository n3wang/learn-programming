import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const COLORS = {
  A: '#42a5f5',
  B: '#66bb6a',
  C: '#ab47bc',
  D: '#ff9800',
};

const LEGEND = [
  {key: 'A', label: 'A', color: COLORS.A, desc: 'Process A'},
  {key: 'B', label: 'B', color: COLORS.B, desc: 'Process B'},
  {key: 'C', label: 'C', color: COLORS.C, desc: 'Process C'},
  {key: 'win', label: 'Runs next', color: '#ff9800', desc: 'Selected by the policy'},
];

const SCENARIOS = {
  lottery: {
    label: 'Lottery',
    subtitle: 'Tickets ≈ share. Each slice: pick a random winning ticket, walk the list until counter > winner.',
    steps: [
      {
        note: 'A:100, B:50, C:250 tickets (total 400). Winner drawn = 300.',
        rows: [
          {id: 'A', meta: 'tix 100', pass: 'counter→100'},
          {id: 'B', meta: 'tix 50', pass: 'counter→150'},
          {id: 'C', meta: 'tix 250', pass: 'counter→400 > 300 ✓'},
        ],
        running: 'C',
      },
      {
        note: 'Next draw winner = 80 → A wins (counter hits 100 first). Probabilistic, not exact each window.',
        rows: [
          {id: 'A', meta: 'tix 100', pass: 'counter→100 > 80 ✓'},
          {id: 'B', meta: 'tix 50', pass: '—'},
          {id: 'C', meta: 'tix 250', pass: '—'},
        ],
        running: 'A',
      },
      {
        note: 'Over many slices, shares approach 100:50:250. Short runs can look unfair (U ≪ 1).',
        rows: [
          {id: 'A', meta: '~25% long-run', pass: 'random'},
          {id: 'B', meta: '~12.5%', pass: 'random'},
          {id: 'C', meta: '~62.5%', pass: 'random'},
        ],
        running: 'C',
      },
    ],
  },
  stride: {
    label: 'Stride',
    subtitle: 'stride = big / tickets. Always run min pass; then pass += stride. Exact proportions.',
    steps: [
      {
        note: 'A:100→stride 100, B:50→200, C:250→40. All pass=0; pick A (tie).',
        rows: [
          {id: 'A', meta: 'stride 100', pass: 'pass 0 → 100'},
          {id: 'B', meta: 'stride 200', pass: 'pass 0'},
          {id: 'C', meta: 'stride 40', pass: 'pass 0'},
        ],
        running: 'A',
      },
      {
        note: 'Run B (pass 0), then C (pass 0). Passes: A100, B200, C40.',
        rows: [
          {id: 'A', meta: 'pass 100', pass: ''},
          {id: 'B', meta: 'pass 200', pass: ''},
          {id: 'C', meta: 'pass 40', pass: 'lowest → run'},
        ],
        running: 'C',
      },
      {
        note: 'C runs again (40→80→120), then A (→200). Pattern: C five times, A twice, B once per cycle.',
        rows: [
          {id: 'A', meta: 'pass 200', pass: '2 runs / cycle'},
          {id: 'B', meta: 'pass 200', pass: '1 run / cycle'},
          {id: 'C', meta: 'pass 200', pass: '5 runs / cycle'},
        ],
        running: 'C',
      },
      {
        note: 'New job? Lottery: just add tickets. Stride: picking pass=0 would monopolize — global state is awkward.',
        rows: [
          {id: 'A', meta: 'pass high', pass: ''},
          {id: 'New', meta: 'if pass=0…', pass: 'would starve others'},
        ],
        running: 'New',
        colors: {New: '#e53935'},
      },
    ],
  },
  cfs: {
    label: 'CFS',
    subtitle: 'Pick lowest vruntime. Slice ≈ sched_latency / n (floored by min_granularity). Weights via nice.',
    steps: [
      {
        note: '4 runnable jobs, sched_latency=48 ms → each gets ~12 ms before CFS looks for a lower vruntime.',
        rows: [
          {id: 'A', meta: 'vruntime ↑', pass: 'slice 12 ms'},
          {id: 'B', meta: 'vruntime ↑', pass: 'slice 12 ms'},
          {id: 'C', meta: 'vruntime ↑', pass: 'slice 12 ms'},
          {id: 'D', meta: 'vruntime ↑', pass: 'slice 12 ms'},
        ],
        running: 'A',
      },
      {
        note: 'Always schedule the job with smallest vruntime (stored in a red-black tree for O(log n)).',
        rows: [
          {id: 'A', meta: 'vr 12', pass: ''},
          {id: 'B', meta: 'vr 0', pass: 'lowest → next'},
          {id: 'C', meta: 'vr 0', pass: ''},
          {id: 'D', meta: 'vr 0', pass: ''},
        ],
        running: 'B',
      },
      {
        note: 'nice −5 vs 0 → weights 3121 vs 1024. Heavier weight → larger slice, slower vruntime growth.',
        rows: [
          {id: 'A', meta: 'nice −5 w=3121', pass: '~¾ of latency'},
          {id: 'B', meta: 'nice 0 w=1024', pass: '~¼ of latency'},
        ],
        running: 'A',
      },
      {
        note: 'Sleeping B wakes after a long nap: CFS sets its vruntime ≈ tree min so it does not monopolize for seconds.',
        rows: [
          {id: 'A', meta: 'vr large', pass: 'was alone'},
          {id: 'B', meta: 'wake → vr≈min', pass: 'no 10s catch-up hog'},
        ],
        running: 'B',
      },
    ],
  },
};

function Row({id, meta, pass, running, colors}) {
  const color = colors?.[id] || COLORS[id] || '#e53935';
  const isRun = id === running;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        p: 1,
        borderRadius: 1,
        border: '2px solid',
        borderColor: isRun ? '#ff9800' : color,
        backgroundColor: `${color}14`,
      }}
    >
      <Chip
        size="small"
        label={isRun ? `${id} ▶` : id}
        sx={{fontWeight: 700, backgroundColor: color, color: '#fff'}}
      />
      <Typography variant="body2" fontFamily="monospace" fontSize={12}>
        {meta}
      </Typography>
      {pass ? (
        <Typography variant="caption" color="text.secondary">
          {pass}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function ProportionalShareSimulator() {
  const [scenario, setScenario] = useState('lottery');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  const switchScenario = (_, v) => {
    if (!v) {
      return;
    }
    setScenario(v);
    setStep(0);
  };

  return (
    <CEBlock title="Proportional-Share Scheduling" subtitle={data.subtitle}>
      <CEBlock.Section label="Policy">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small">
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="State">
        <Stack spacing={1}>
          {current.rows.map((r) => (
            <Row
              key={`${r.id}-${r.meta}-${r.pass}`}
              {...r}
              running={current.running}
              colors={current.colors}
            />
          ))}
        </Stack>
        <Typography variant="body2" mt={1.5} color="text.secondary">
          {current.note}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <ColorLegend items={LEGEND} />
        <Box mt={1}>
          <StepControls step={step} max={data.steps.length - 1} onStep={setStep} label="Step" />
        </Box>
      </CEBlock.Section>
    </CEBlock>
  );
}

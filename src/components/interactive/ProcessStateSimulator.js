import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const STATES = [
  { key: 'Running', label: 'Running', color: '#66bb6a', desc: 'Executing instructions on a CPU' },
  { key: 'Ready', label: 'Ready', color: '#42a5f5', desc: 'Runnable, waiting to be scheduled' },
  { key: 'Blocked', label: 'Blocked', color: '#ef5350', desc: 'Waiting for I/O or another event' },
  { key: '—', label: 'Done', color: '#bdbdbd', desc: 'Process finished' },
];

const colorOf = (state) => STATES.find((s) => s.key === state)?.color ?? '#bdbdbd';

/** Scenario A: two CPU-bound processes (OSTEP Fig 4.3) */
const CPU_ONLY = [
  { t: 1, p0: 'Running', p1: 'Ready', note: 'OS schedules Process0' },
  { t: 2, p0: 'Running', p1: 'Ready', note: 'Process0 still running' },
  { t: 3, p0: 'Running', p1: 'Ready', note: 'Process0 still running' },
  { t: 4, p0: 'Running', p1: 'Ready', note: 'Process0 still running' },
  { t: 5, p0: '—', p1: 'Running', note: 'Process0 done → Process1 scheduled' },
  { t: 6, p0: '—', p1: 'Running', note: 'Process1 running' },
  { t: 7, p0: '—', p1: 'Running', note: 'Process1 running' },
  { t: 8, p0: '—', p1: '—', note: 'Process1 done — CPU idle' },
];

/** Scenario B: I/O then other process runs (OSTEP Fig 4.4) */
const CPU_AND_IO = [
  { t: 1, p0: 'Running', p1: 'Ready', note: 'Process0 starts on CPU' },
  { t: 2, p0: 'Running', p1: 'Ready', note: 'Process0 still running' },
  { t: 3, p0: 'Running', p1: 'Ready', note: 'Process0 still running' },
  { t: 4, p0: 'Blocked', p1: 'Running', note: 'Process0 issues I/O → blocked; OS runs Process1' },
  { t: 5, p0: 'Blocked', p1: 'Running', note: 'Process0 waiting on I/O; Process1 uses CPU' },
  { t: 6, p0: 'Blocked', p1: 'Running', note: 'Still waiting' },
  { t: 7, p0: 'Ready', p1: 'Running', note: 'I/O done → Process0 becomes Ready (not necessarily run yet)' },
  { t: 8, p0: 'Ready', p1: 'Running', note: 'Scheduler keeps Process1 running' },
  { t: 9, p0: 'Running', p1: '—', note: 'Process1 done → Process0 scheduled again' },
  { t: 10, p0: '—', p1: '—', note: 'Process0 finishes' },
];

function StateChip({ name, state }) {
  return (
    <Tooltip title={`${name}: ${state}`}>
      <Chip
        label={`${name}: ${state}`}
        size="small"
        sx={{
          backgroundColor: colorOf(state),
          color: state === '—' ? '#616161' : '#fff',
          fontWeight: 700,
          minWidth: 120,
        }}
      />
    </Tooltip>
  );
}

function StateMachine({ active }) {
  const nodes = ['Running', 'Ready', 'Blocked'];
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      {nodes.map((n, i) => (
        <React.Fragment key={n}>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1,
              border: '2px solid',
              borderColor: active === n ? colorOf(n) : 'grey.300',
              backgroundColor: active === n ? colorOf(n) : 'grey.50',
              color: active === n ? '#fff' : 'text.primary',
              fontWeight: active === n ? 700 : 400,
              fontSize: 13,
              transition: 'all 0.2s',
            }}
          >
            {n}
          </Box>
          {i < nodes.length - 1 && (
            <Typography variant="caption" color="text.secondary">
              ↔
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
}

export default function ProcessStateSimulator() {
  const [scenario, setScenario] = useState('io');
  const steps = scenario === 'cpu' ? CPU_ONLY : CPU_AND_IO;
  const [step, setStep] = useState(0);
  const current = steps[step];

  const switchScenario = (_, v) => {
    if (!v) return;
    setScenario(v);
    setStep(0);
  };

  return (
    <CEBlock
      title="Process State Simulator"
      subtitle="Step through time and watch processes move between Running, Ready, and Blocked."
    >
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small">
          <ToggleButton value="cpu">CPU only (Fig 4.3)</ToggleButton>
          <ToggleButton value="io">CPU + I/O (Fig 4.4)</ToggleButton>
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label={`Time ${current.t}`}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <StateChip name="Process0" state={current.p0} />
            <StateChip name="Process1" state={current.p1} />
          </Stack>
          <Typography variant="body2">
            <strong>What happened:</strong> {current.note}
          </Typography>
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Process0 state machine">
        <StateMachine active={current.p0 === '—' ? null : current.p0} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Scheduled: Ready → Running · Descheduled: Running → Ready · I/O initiate: Running → Blocked ·
          I/O done: Blocked → Ready
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Legend">
        <ColorLegend items={STATES.filter((s) => s.key !== '—')} />
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <StepControls step={step} max={steps.length - 1} onStep={setStep} label="Time" />
      </CEBlock.Section>
    </CEBlock>
  );
}

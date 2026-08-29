import React, {useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const COLORS = {
  A: '#42a5f5',
  B: '#66bb6a',
  C: '#ab47bc',
  D: '#ff9800',
  E: '#ef5350',
};

const LEGEND = [
  {key: 'A', label: 'Job A', color: COLORS.A, desc: 'Runnable job'},
  {key: 'warm', label: 'Affinity / warm', color: '#ff9800', desc: 'Prefer same CPU (cache warm)'},
  {key: 'idle', label: 'Idle CPU', color: '#bdbdbd', desc: 'No work on this core'},
];

const SCENARIOS = {
  coherence: {
    label: 'Cache bounce',
    subtitle: 'Without care, migrating a process can re-read stale data from memory if caches are not coherent — hardware fixes this; affinity still matters for speed.',
    steps: [
      {
        note: 'CPU 0 loads A→D into its cache, then writes D′ (write-back: memory still has D for now).',
        cpus: [
          {id: 0, job: 'A', cache: 'A: D′', warm: true},
          {id: 1, job: null, cache: '—', warm: false},
        ],
      },
      {
        note: 'OS migrates A to CPU 1. Without coherence, a naive memory read could see old D. Hardware snoops/invalidates so the “right” value wins.',
        cpus: [
          {id: 0, job: null, cache: 'stale?', warm: false},
          {id: 1, job: 'A', cache: 'reload', warm: false},
        ],
      },
      {
        note: 'Correctness comes from coherence + locks for shared structures. Performance still wants A back on a warm cache when possible.',
        cpus: [
          {id: 0, job: 'A', cache: 'A warm', warm: true},
          {id: 1, job: null, cache: '—', warm: false},
        ],
      },
    ],
  },
  sqms: {
    label: 'SQMS',
    subtitle: 'Single shared queue: simple & balanced, but lock contention + jobs bounce across CPUs (bad affinity).',
    steps: [
      {
        note: 'One global queue: A B C D E. Four CPUs each take the next job under a lock.',
        cpus: [
          {id: 0, job: 'A', cache: 'cold', warm: false},
          {id: 1, job: 'B', cache: 'cold', warm: false},
          {id: 2, job: 'C', cache: 'cold', warm: false},
          {id: 3, job: 'D', cache: 'cold', warm: false},
        ],
        queue: 'E waiting',
      },
      {
        note: 'Next slice: jobs rotate — A may land on a different CPU. Correct, but caches stay cold.',
        cpus: [
          {id: 0, job: 'E', cache: 'cold', warm: false},
          {id: 1, job: 'A', cache: 'cold', warm: false},
          {id: 2, job: 'B', cache: 'cold', warm: false},
          {id: 3, job: 'C', cache: 'cold', warm: false},
        ],
        queue: 'D waiting',
      },
      {
        note: 'Affinity tweak: pin A–D; only E migrates to fill slack — better reuse for most jobs.',
        cpus: [
          {id: 0, job: 'A', cache: 'warm', warm: true},
          {id: 1, job: 'B', cache: 'warm', warm: true},
          {id: 2, job: 'C', cache: 'warm', warm: true},
          {id: 3, job: 'E', cache: 'migrating', warm: false},
        ],
        queue: 'D on CPU3 next…',
      },
    ],
  },
  mqms: {
    label: 'MQMS',
    subtitle: 'Per-CPU queues: scales + natural affinity — until load imbalance leaves a core idle.',
    steps: [
      {
        note: 'Two CPUs, four jobs: Q0={A,C} Q1={B,D}. Round-robin locally — no global lock.',
        cpus: [
          {id: 0, job: 'A', cache: 'Q0: A,C', warm: true},
          {id: 1, job: 'B', cache: 'Q1: B,D', warm: true},
        ],
      },
      {
        note: 'C finishes → Q0={A} Q1={B,D}. A gets twice the CPU of B/D — imbalance.',
        cpus: [
          {id: 0, job: 'A', cache: 'Q0: A alone', warm: true},
          {id: 1, job: 'B', cache: 'Q1: B,D', warm: true},
        ],
      },
      {
        note: 'A and C gone → Q0 empty, Q1={B,D}. CPU 0 idle while CPU 1 is busy.',
        cpus: [
          {id: 0, job: null, cache: 'idle', warm: false},
          {id: 1, job: 'D', cache: 'Q1: B,D', warm: true},
        ],
      },
      {
        note: 'Migration / work stealing: underloaded queue peeks and steals a job — balance restored (don’t peek too often).',
        cpus: [
          {id: 0, job: 'B', cache: 'stolen', warm: false},
          {id: 1, job: 'D', cache: 'Q1: D', warm: true},
        ],
      },
    ],
  },
};

function CpuCard({cpu}) {
  const color = cpu.job ? COLORS[cpu.job] || '#78909c' : '#bdbdbd';
  return (
    <Box
      sx={{
        flex: '1 1 140px',
        minWidth: 130,
        p: 1.25,
        borderRadius: 1,
        border: '2px solid',
        borderColor: cpu.warm ? '#ff9800' : color,
        backgroundColor: `${color}18`,
      }}
    >
      <Typography variant="caption" fontWeight={700} display="block">
        CPU {cpu.id}
      </Typography>
      <Stack direction="row" spacing={0.75} alignItems="center" mt={0.5} mb={0.5}>
        <Chip
          size="small"
          label={cpu.job ? `${cpu.job} ▶` : 'idle'}
          sx={{fontWeight: 700, backgroundColor: color, color: '#fff'}}
        />
      </Stack>
      <Typography variant="caption" fontFamily="monospace" display="block">
        {cpu.cache}
      </Typography>
    </Box>
  );
}

export default function MultiprocessorSchedulingSimulator() {
  const [scenario, setScenario] = useState('mqms');
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
    <CEBlock title="Multiprocessor Scheduling" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small">
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="CPUs">
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {current.cpus.map((c) => (
            <CpuCard key={c.id} cpu={c} />
          ))}
        </Stack>
        {current.queue ? (
          <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
            Queue: {current.queue}
          </Typography>
        ) : null}
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

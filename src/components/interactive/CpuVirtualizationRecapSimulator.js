import React, {useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const LEGEND = [
  {key: 'mech', label: 'Mechanism', color: '#42a5f5', desc: 'How the OS virtualizes the CPU'},
  {key: 'pol', label: 'Policy', color: '#66bb6a', desc: 'Which process runs next'},
  {key: 'phil', label: 'Philosophy', color: '#ab47bc', desc: 'Paranoia, pragmatism, tradeoffs'},
];

const STEPS = [
  {
    tag: 'mech',
    title: 'The process abstraction',
    lesson: 'Ch. 4 — The Process',
    points: [
      'Program on disk ≠ process — add address space, registers, PC, I/O state.',
      'Running / Ready / Blocked — time sharing creates virtual CPUs.',
      'Mechanism (context switch) vs policy (scheduler).',
    ],
  },
  {
    tag: 'mech',
    title: 'Process API',
    lesson: 'Ch. 5 — fork / exec / wait',
    points: [
      'fork() clones; exec() replaces image; wait() reaps.',
      'Shell: fork → setup (redirect/pipe) → exec → wait.',
      'Practical UNIX control — signals, users, root.',
    ],
  },
  {
    tag: 'mech',
    title: 'Limited direct execution',
    lesson: 'Ch. 6 — traps & timers',
    points: [
      'Run natively on hardware, but user mode is restricted.',
      'System calls trap into kernel; timer interrupt regains CPU.',
      'Context switch saves/restores state between processes.',
    ],
  },
  {
    tag: 'pol',
    title: 'Scheduling policies',
    lesson: 'Ch. 7–9 — FIFO, SJF, RR, MLFQ, fair share',
    points: [
      'Turnaround vs response time — metrics pull in opposite directions.',
      'MLFQ learns from history; boost + allotment fight starvation and gaming.',
      'Lottery / stride / CFS — proportional CPU shares.',
    ],
  },
  {
    tag: 'pol',
    title: 'Multiprocessor scheduling',
    lesson: 'Ch. 10 — SQMS vs MQMS',
    points: [
      'Cache coherence (correctness) ≠ cache affinity (speed).',
      'SQMS: simple, balanced; locks + bouncing hurt scale.',
      'MQMS: per-CPU queues + work stealing for balance.',
    ],
  },
  {
    tag: 'phil',
    title: 'What the dialogue teaches',
    lesson: 'Ch. 11 — summary',
    points: [
      'OS stays in charge — limited direct execution with paranoid control.',
      'No perfect scheduler — avoid disaster (Lampson), not find “the best”.',
      'Schedulers can be gamed — policy is also a security concern.',
      'Reading helps; doing (projects, simulators) makes it stick.',
    ],
  },
];

const tagColor = (tag) => LEGEND.find((l) => l.key === tag)?.color ?? '#78909c';

export default function CpuVirtualizationRecapSimulator() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <CEBlock
      title="CPU Virtualization — the arc"
      subtitle="Step through mechanisms, policies, and the philosophy from the summary dialogue."
    >
      <CEBlock.Section label={`${step + 1} / ${STEPS.length}`}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={1}>
          <Chip
            size="small"
            label={current.tag === 'mech' ? 'Mechanism' : current.tag === 'pol' ? 'Policy' : 'Philosophy'}
            sx={{backgroundColor: tagColor(current.tag), color: '#fff', fontWeight: 700}}
          />
          <Typography variant="subtitle2" fontWeight={700}>
            {current.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({current.lesson})
          </Typography>
        </Stack>
        <Box component="ul" sx={{m: 0, pl: 2.5}}>
          {current.points.map((p) => (
            <Typography component="li" variant="body2" key={p} sx={{mb: 0.75, lineHeight: 1.55}}>
              {p}
            </Typography>
          ))}
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <ColorLegend items={LEGEND} />
        <Box mt={1}>
          <StepControls step={step} max={STEPS.length - 1} onStep={setStep} label="Step" />
        </Box>
      </CEBlock.Section>
    </CEBlock>
  );
}

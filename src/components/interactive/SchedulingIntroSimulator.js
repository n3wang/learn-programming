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

const JOB_COLORS = {
  A: '#546e7a',
  B: '#66bb6a',
  C: '#42a5f5',
  IO: '#ef5350',
};

const LEGEND = [
  {key: 'A', label: 'Job A', color: JOB_COLORS.A, desc: 'Often the long / CPU-bound job'},
  {key: 'B', label: 'Job B', color: JOB_COLORS.B, desc: 'Short job'},
  {key: 'C', label: 'Job C', color: JOB_COLORS.C, desc: 'Another short job'},
  {key: 'IO', label: 'I/O wait', color: JOB_COLORS.IO, desc: 'CPU idle while a job blocks on I/O'},
];

/**
 * segments: { job, start, end }[] — CPU timeline
 * io?: { job, start, end }[] — optional I/O row
 * metrics?: { label, value }[]
 */
const SCENARIOS = {
  fifoEqual: {
    label: 'FIFO equal',
    subtitle: 'Three jobs, each 10 s — FIFO works fine (Fig 7.1). Avg turnaround = 20.',
    maxTime: 30,
    steps: [
      {
        note: 'A, B, C arrive together (A just before B before C). FIFO runs A first.',
        segments: [{job: 'A', start: 0, end: 10}],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'B runs next.',
        segments: [
          {job: 'A', start: 0, end: 10},
          {job: 'B', start: 10, end: 20},
        ],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'C finishes at 30. Turnaround times: 10, 20, 30 → average 20.',
        segments: [
          {job: 'A', start: 0, end: 10},
          {job: 'B', start: 10, end: 20},
          {job: 'C', start: 20, end: 30},
        ],
        metrics: [{label: 'Avg turnaround', value: '20 s'}],
      },
    ],
  },
  fifoConvoy: {
    label: 'FIFO convoy',
    subtitle: 'A=100 s, B=C=10 s — long job first → convoy effect (Fig 7.2). Avg turnaround = 110.',
    maxTime: 120,
    steps: [
      {
        note: 'Same arrivals, but A runs for 100 s before B or C get the CPU.',
        segments: [{job: 'A', start: 0, end: 100}],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'B finally runs at t=100.',
        segments: [
          {job: 'A', start: 0, end: 100},
          {job: 'B', start: 100, end: 110},
        ],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'C finishes at 120. (100+110+120)/3 = 110 — painful average.',
        segments: [
          {job: 'A', start: 0, end: 100},
          {job: 'B', start: 100, end: 110},
          {job: 'C', start: 110, end: 120},
        ],
        metrics: [{label: 'Avg turnaround', value: '110 s'}],
      },
    ],
  },
  sjf: {
    label: 'SJF',
    subtitle: 'Shortest job first — run B, C, then A (Fig 7.3). Avg turnaround drops to 50.',
    maxTime: 120,
    steps: [
      {
        note: 'SJF picks B (10 s) before A (100 s).',
        segments: [{job: 'B', start: 0, end: 10}],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'Then C (10 s).',
        segments: [
          {job: 'B', start: 0, end: 10},
          {job: 'C', start: 10, end: 20},
        ],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'A runs last. Turnaround: B=10, C=20, A=120 → average 50 (more than 2× better than FIFO).',
        segments: [
          {job: 'B', start: 0, end: 10},
          {job: 'C', start: 10, end: 20},
          {job: 'A', start: 20, end: 120},
        ],
        metrics: [{label: 'Avg turnaround', value: '50 s'}],
      },
    ],
  },
  sjfLate: {
    label: 'SJF late arrivals',
    subtitle: 'A@0 (100 s); B,C@10 (10 s each). Non-preemptive SJF still runs A — convoy returns (Fig 7.4).',
    maxTime: 120,
    steps: [
      {
        note: 'A arrives at t=0 and starts immediately — SJF cannot know B and C are coming.',
        segments: [{job: 'A', start: 0, end: 100}],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'B and C arrive at t=10 but wait behind running A.',
        segments: [{job: 'A', start: 0, end: 100}],
        markers: [{t: 10, label: 'B,C arrive'}],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'A finishes; B then C. Avg turnaround ≈ 103.3 s — almost as bad as FIFO convoy.',
        segments: [
          {job: 'A', start: 0, end: 100},
          {job: 'B', start: 100, end: 110},
          {job: 'C', start: 110, end: 120},
        ],
        metrics: [{label: 'Avg turnaround', value: '103.3 s'}],
      },
    ],
  },
  stcf: {
    label: 'STCF',
    subtitle: 'Preemptive SJF — when B,C arrive, A is preempted (Fig 7.5). Avg turnaround = 50.',
    maxTime: 120,
    steps: [
      {
        note: 'A starts at t=0 (100 s remaining).',
        segments: [{job: 'A', start: 0, end: 10}],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'B,C arrive at t=10. STCF picks shortest remaining: B (10 s), then C (10 s).',
        segments: [
          {job: 'A', start: 0, end: 10},
          {job: 'B', start: 10, end: 20},
          {job: 'C', start: 20, end: 30},
        ],
        markers: [{t: 10, label: 'B,C arrive'}],
        metrics: [{label: 'Avg turnaround', value: '—'}],
      },
      {
        note: 'A resumes with 90 s left, finishes at 120. Turnaround avg = 50 s — optimal given arrivals.',
        segments: [
          {job: 'A', start: 0, end: 10},
          {job: 'B', start: 10, end: 20},
          {job: 'C', start: 20, end: 30},
          {job: 'A', start: 30, end: 120},
        ],
        metrics: [{label: 'Avg turnaround', value: '50 s'}],
      },
    ],
  },
  rr: {
    label: 'Round Robin',
    subtitle: 'A,B,C each need 5 s; quantum = 1 s. Great response, bad turnaround (Figs 7.6–7.7).',
    maxTime: 15,
    steps: [
      {
        note: 'RR time-slices: A runs 1 s, then B, then C — repeat. Avg response ≈ 1 s vs SJF ≈ 5 s.',
        segments: [
          {job: 'A', start: 0, end: 1},
          {job: 'B', start: 1, end: 2},
          {job: 'C', start: 2, end: 3},
        ],
        metrics: [
          {label: 'Avg response (RR)', value: '1 s'},
          {label: 'Avg response (SJF)', value: '5 s'},
        ],
      },
      {
        note: 'Second round: A,B,C each get another second…',
        segments: [
          {job: 'A', start: 0, end: 1},
          {job: 'B', start: 1, end: 2},
          {job: 'C', start: 2, end: 3},
          {job: 'A', start: 3, end: 4},
          {job: 'B', start: 4, end: 5},
          {job: 'C', start: 5, end: 6},
        ],
        metrics: [{label: 'Avg turnaround (RR)', value: '—'}],
      },
      {
        note: 'Jobs finish at 13, 14, 15. Avg turnaround = 14 — nearly pessimal for this metric.',
        segments: [
          {job: 'A', start: 0, end: 1},
          {job: 'B', start: 1, end: 2},
          {job: 'C', start: 2, end: 3},
          {job: 'A', start: 3, end: 4},
          {job: 'B', start: 4, end: 5},
          {job: 'C', start: 5, end: 6},
          {job: 'A', start: 6, end: 7},
          {job: 'B', start: 7, end: 8},
          {job: 'C', start: 8, end: 9},
          {job: 'A', start: 9, end: 10},
          {job: 'B', start: 10, end: 11},
          {job: 'C', start: 11, end: 12},
          {job: 'A', start: 12, end: 13},
          {job: 'B', start: 13, end: 14},
          {job: 'C', start: 14, end: 15},
        ],
        metrics: [{label: 'Avg turnaround (RR)', value: '14 s'}],
      },
    ],
  },
  ioOverlap: {
    label: 'I/O overlap',
    subtitle: 'A: five 10-ms bursts + I/O; B: 50 ms CPU. STCF on bursts overlaps CPU with disk (Fig 7.9).',
    maxTime: 100,
    steps: [
      {
        note: 'Without overlap: run all of A, then all of B — CPU sits idle during A’s I/O (Fig 7.8).',
        segments: [{job: 'A', start: 0, end: 50}],
        metrics: [{label: 'CPU utilization', value: 'low during I/O gaps'}],
      },
      {
        note: 'Treat each 10-ms burst as a job. STCF picks A’s burst over B’s 50-ms demand.',
        segments: [
          {job: 'A', start: 0, end: 10},
          {job: 'B', start: 10, end: 60},
        ],
        metrics: [{label: 'Strategy', value: 'one burst at a time'}],
      },
      {
        note: 'Interleave A bursts with B: CPU runs B while A waits on disk — better utilization.',
        segments: [
          {job: 'A', start: 0, end: 10},
          {job: 'B', start: 10, end: 20},
          {job: 'A', start: 20, end: 30},
          {job: 'B', start: 30, end: 40},
          {job: 'A', start: 40, end: 50},
          {job: 'B', start: 50, end: 60},
          {job: 'A', start: 60, end: 70},
          {job: 'B', start: 70, end: 80},
          {job: 'A', start: 80, end: 90},
          {job: 'B', start: 90, end: 100},
        ],
        metrics: [{label: 'CPU utilization', value: 'higher — overlap I/O wait with B'}],
      },
    ],
  },
};

function GanttTimeline({segments, maxTime, markers = []}) {
  const scale = (t) => `${(t / maxTime) * 100}%`;

  return (
    <Box sx={{position: 'relative', height: 44, backgroundColor: '#f5f5f5', borderRadius: 1, overflow: 'hidden'}}>
      {segments.map((seg) => (
        <Box
          key={`${seg.job}-${seg.start}-${seg.end}`}
          sx={{
            position: 'absolute',
            left: scale(seg.start),
            width: `calc(${scale(seg.end - seg.start)} - 1px)`,
            top: 8,
            height: 28,
            backgroundColor: JOB_COLORS[seg.job] ?? '#78909c',
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {seg.job}
        </Box>
      ))}
      {markers.map((m) => (
        <Box
          key={m.label}
          sx={{
            position: 'absolute',
            left: scale(m.t),
            top: 0,
            bottom: 0,
            borderLeft: '2px dashed #ef5350',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: -2,
              left: 4,
              fontSize: 10,
              color: '#ef5350',
              whiteSpace: 'nowrap',
            }}
          >
            {m.label}
          </Typography>
        </Box>
      ))}
      <Typography variant="caption" sx={{position: 'absolute', right: 4, bottom: 2, color: 'text.secondary'}}>
        0 — {maxTime}
      </Typography>
    </Box>
  );
}

export default function SchedulingIntroSimulator() {
  const [scenario, setScenario] = useState('fifoConvoy');
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
    <CEBlock title="Scheduling Policies" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small" sx={{flexWrap: 'wrap'}}>
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key} sx={{textTransform: 'none'}}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="CPU timeline">
        <GanttTimeline segments={current.segments} maxTime={data.maxTime} markers={current.markers} />
        <Typography variant="body2" mt={1.5} color="text.secondary">
          {current.note}
        </Typography>
        {current.metrics?.length > 0 && (
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
            {current.metrics.map((m) => (
              <Chip key={m.label} size="small" label={`${m.label}: ${m.value}`} variant="outlined" />
            ))}
          </Stack>
        )}
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <ColorLegend items={LEGEND.filter((l) => l.key !== 'IO' || scenario === 'ioOverlap')} />
        <Box mt={1}>
          <StepControls step={step} max={data.steps.length - 1} onStep={setStep} label="Step" />
        </Box>
      </CEBlock.Section>
    </CEBlock>
  );
}

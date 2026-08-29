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
};

const LEGEND = [
  {key: 'A', label: 'Job A', color: JOB_COLORS.A, desc: 'Usually long / CPU-bound'},
  {key: 'B', label: 'Job B', color: JOB_COLORS.B, desc: 'Short or interactive'},
  {key: 'C', label: 'Job C', color: JOB_COLORS.C, desc: 'Second interactive job'},
  {key: 'run', label: 'Running', color: '#ff9800', desc: 'Currently on the CPU'},
];

/**
 * Each step: queues[2]=highest … queues[0]=lowest; lists of job ids.
 * running: job id or null; note; optional t label
 */
const SCENARIOS = {
  long: {
    label: 'Long job',
    subtitle: 'A new job starts at the top and sinks as it burns full time slices (Fig 8.2).',
    steps: [
      {
        t: 'enter',
        note: 'Rule 3: A arrives → highest queue Q2. Slice = 10 ms.',
        queues: [['A'], [], []],
        running: 'A',
      },
      {
        t: '10 ms',
        note: 'Rule 4: A used a full allotment at Q2 → demote to Q1.',
        queues: [[], ['A'], []],
        running: 'A',
      },
      {
        t: '20 ms',
        note: 'Another full allotment → demote to Q0 (lowest).',
        queues: [[], [], ['A']],
        running: 'A',
      },
      {
        t: 'later',
        note: 'A stays at Q0 while it remains CPU-bound (until a boost).',
        queues: [[], [], ['A']],
        running: 'A',
      },
    ],
  },
  short: {
    label: 'Short arrives',
    subtitle: 'Unknown length → treat as short first. Approximates SJF (Fig 8.3).',
    steps: [
      {
        t: 'T<100',
        note: 'Long job A has already sunk to Q0.',
        queues: [[], [], ['A']],
        running: 'A',
      },
      {
        t: 'T=100',
        note: 'Short job B arrives at Q2 (highest). Rule 1: B runs; A waits.',
        queues: [['B'], [], ['A']],
        running: 'B',
      },
      {
        t: 'slice',
        note: 'B uses a slice at Q2 → demoted to Q1, still above A.',
        queues: [[], ['B'], ['A']],
        running: 'B',
      },
      {
        t: 'done',
        note: 'B finishes quickly (never reaches Q0). A resumes at low priority.',
        queues: [[], [], ['A']],
        running: 'A',
      },
    ],
  },
  io: {
    label: 'I/O interactive',
    subtitle: 'Jobs that yield for I/O stay interactive at high priority while a batch job runs below (Fig 8.4 idea).',
    steps: [
      {
        t: 'mix',
        note: 'A is CPU-bound at Q0. Interactive B needs ~1 ms then I/O.',
        queues: [['B'], [], ['A']],
        running: 'B',
      },
      {
        t: 'yield',
        note: 'B releases CPU before allotment is fully used → still high priority; does I/O.',
        queues: [['B'], [], ['A']],
        running: null,
        blocked: 'B',
      },
      {
        t: 'A runs',
        note: 'While B waits on I/O, A can run at Q0.',
        queues: [[], [], ['A']],
        running: 'A',
        blocked: 'B',
      },
      {
        t: 'B back',
        note: 'B’s I/O completes → back on high queue, runs again quickly (good response time).',
        queues: [['B'], [], ['A']],
        running: 'B',
      },
    ],
  },
  boost: {
    label: 'Priority boost',
    subtitle: 'Rule 5: periodically move everyone to the top — fights starvation & behavior changes (Fig 8.5).',
    steps: [
      {
        t: 'starve?',
        note: 'Without boosts: interactive B & C hog Q2; long A at Q0 never runs.',
        queues: [['B', 'C'], [], ['A']],
        running: 'B',
      },
      {
        t: 'RR top',
        note: 'B and C round-robin at Q2. A still starved.',
        queues: [['B', 'C'], [], ['A']],
        running: 'C',
      },
      {
        t: 'boost',
        note: 'Rule 5: after period S, boost all jobs to Q2.',
        queues: [['A', 'B', 'C'], [], []],
        running: 'A',
      },
      {
        t: 'progress',
        note: 'A gets CPU time in RR with B/C, then may sink again — but it made progress.',
        queues: [['B', 'C'], [], ['A']],
        running: 'B',
      },
    ],
  },
  game: {
    label: 'Anti-gaming',
    subtitle: 'Rule 4 (allotment): CPU used at a level counts whether in one burst or many tiny ones (Fig 8.6).',
    steps: [
      {
        t: 'cheat?',
        note: 'Old Rules 4a/4b: job runs 99% of slice, issues fake I/O → stays on Q2 forever.',
        queues: [['Gamer'], [], ['A']],
        running: 'Gamer',
        labels: {Gamer: '#e53935'},
      },
      {
        t: 'unfair',
        note: 'Gamer monopolizes high priority; A starves — scheduler is insecure.',
        queues: [['Gamer'], [], ['A']],
        running: 'Gamer',
        labels: {Gamer: '#e53935'},
      },
      {
        t: 'account',
        note: 'New Rule 4: track total CPU at this level. Allotment exhausted → demote, I/O tricks fail.',
        queues: [[], ['Gamer'], ['A']],
        running: 'Gamer',
        labels: {Gamer: '#e53935'},
      },
      {
        t: 'fairer',
        note: 'Gamer sinks like any CPU hog. Short real interactive jobs still get high priority.',
        queues: [[], [], ['Gamer', 'A']],
        running: 'A',
        labels: {Gamer: '#e53935'},
      },
    ],
  },
};

const QUEUE_NAMES = ['Q2 (high)', 'Q1', 'Q0 (low)'];

function jobColor(id, labels) {
  return labels?.[id] || JOB_COLORS[id] || '#e53935';
}

function QueueColumn({name, jobs, running, labels}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 100,
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.300',
        backgroundColor: 'grey.50',
        minHeight: 120,
      }}
    >
      <Typography variant="caption" fontWeight={700} display="block" mb={1}>
        {name}
      </Typography>
      <Stack spacing={0.75}>
        {jobs.length === 0 ? (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        ) : (
          jobs.map((id) => (
            <Chip
              key={id}
              size="small"
              label={id === running ? `${id} ▶` : id}
              sx={{
                fontWeight: 700,
                backgroundColor: jobColor(id, labels),
                color: '#fff',
                outline: id === running ? '2px solid #ff9800' : 'none',
                outlineOffset: 1,
              }}
            />
          ))
        )}
      </Stack>
    </Box>
  );
}

export default function MlfqSimulator() {
  const [scenario, setScenario] = useState('short');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];
  const labels = current.labels;

  const switchScenario = (_, v) => {
    if (!v) {
      return;
    }
    setScenario(v);
    setStep(0);
  };

  const legendItems =
    scenario === 'game'
      ? [
          ...LEGEND.filter((l) => l.key === 'A' || l.key === 'run'),
          {key: 'G', label: 'Gamer', color: '#e53935', desc: 'Tries to game Rules 4a/4b'},
        ]
      : LEGEND;

  return (
    <CEBlock title="MLFQ Scheduler" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small">
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label={`Queues @ ${current.t}`}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {QUEUE_NAMES.map((name, i) => (
            <QueueColumn
              key={name}
              name={name}
              jobs={current.queues[i]}
              running={current.running}
              labels={labels}
            />
          ))}
        </Stack>
        {current.blocked ? (
          <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
            Blocked on I/O: {current.blocked}
          </Typography>
        ) : null}
        <Typography variant="body2" mt={1.5} color="text.secondary">
          {current.note}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <ColorLegend items={legendItems} />
        <Box mt={1}>
          <StepControls step={step} max={data.steps.length - 1} onStep={setStep} label="Step" />
        </Box>
      </CEBlock.Section>
    </CEBlock>
  );
}

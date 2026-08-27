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

const LEGEND = [
  {key: 'main', label: 'Main thread', color: '#42a5f5', desc: 'Creates workers and joins'},
  {key: 't1', label: 'Thread A', color: '#66bb6a', desc: 'Worker thread 1'},
  {key: 't2', label: 'Thread B', color: '#ffb74d', desc: 'Worker thread 2'},
  {key: 'race', label: 'Lost update', color: '#ef5350', desc: 'Both increments collapse to one'},
  {key: 'stack', label: 'Per-thread stack', color: '#ab47bc', desc: 'Thread-local storage'},
];

const SCENARIOS = {
  aspace: {
    label: 'Address space',
    subtitle: 'Fig 26.1 — single stack vs one stack per thread; shared code and heap.',
    steps: [
      {
        note: 'Single-threaded process: one PC, one register set, one stack at the “bottom”.',
        mode: 'single',
      },
      {
        note: 'Multi-threaded: same address space (shared code/heap) but a stack (and registers/PC) per thread.',
        mode: 'multi',
      },
      {
        note: 'Context switch between threads saves/restores TCB registers — page table stays the same.',
        mode: 'multi',
        callout: 'No PTBR switch',
      },
    ],
  },
  create: {
    label: 'Create/join',
    subtitle: 'Figs 26.3–26.5 — scheduler chooses order; A before B is not guaranteed.',
    steps: [
      {
        note: 'Trace 1: create both, then A runs, then B, then joins complete → main: end.',
        events: [
          {who: 'main', text: 'begin · create A · create B · join'},
          {who: 't1', text: 'print A'},
          {who: 't2', text: 'print B'},
          {who: 'main', text: 'end'},
        ],
      },
      {
        note: 'Trace 2: A may run immediately after create — still valid.',
        events: [
          {who: 'main', text: 'begin · create A'},
          {who: 't1', text: 'print A'},
          {who: 'main', text: 'create B · join'},
          {who: 't2', text: 'print B'},
          {who: 'main', text: 'end'},
        ],
      },
      {
        note: 'Trace 3: B can print before A. Creation order ≠ run order.',
        events: [
          {who: 'main', text: 'begin · create A · create B'},
          {who: 't2', text: 'print B'},
          {who: 't1', text: 'print A'},
          {who: 'main', text: 'end'},
        ],
      },
    ],
  },
  race: {
    label: 'Data race',
    subtitle: 'Fig 26.7 — counter++ is load / add / store. Untimely switch → lost update.',
    steps: [
      {
        note: 'counter=50. T1: mov → eax=50, add → eax=51. Interrupt before store.',
        t1: {eax: 51, pc: 'store?'},
        t2: null,
        counter: 50,
        phase: 't1-mid',
      },
      {
        note: 'T2 runs full critical section: load 50, add, store → counter=51.',
        t1: {eax: 51, pc: 'paused'},
        t2: {eax: 51, pc: 'done'},
        counter: 51,
        phase: 't2-done',
      },
      {
        note: 'T1 resumes and stores eax=51 again. Two increments → counter still 51. Race!',
        t1: {eax: 51, pc: 'stored'},
        t2: {eax: 51, pc: 'done'},
        counter: 51,
        phase: 'lost',
        expected: 52,
      },
    ],
  },
};

function AddrSpace({mode}) {
  const blocks =
    mode === 'single'
      ? [
          {label: 'Code', color: '#90caf9'},
          {label: 'Heap ↓', color: '#a5d6a7'},
          {label: '(free)', color: '#eceff1'},
          {label: 'Stack ↑', color: '#ce93d8'},
        ]
      : [
          {label: 'Code', color: '#90caf9'},
          {label: 'Heap ↓', color: '#a5d6a7'},
          {label: '(free)', color: '#eceff1'},
          {label: 'Stack 2', color: '#ce93d8'},
          {label: '(free)', color: '#eceff1'},
          {label: 'Stack 1', color: '#ab47bc'},
        ];
  return (
    <Stack spacing={0.5}>
      {blocks.map((b, i) => (
        <Box
          key={`${b.label}-${i}`}
          sx={{
            px: 2,
            py: 0.75,
            bgcolor: b.color,
            borderRadius: 0.5,
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {b.label}
        </Box>
      ))}
    </Stack>
  );
}

function EventTrace({events}) {
  const color = {main: '#42a5f5', t1: '#66bb6a', t2: '#ffb74d'};
  return (
    <Stack spacing={0.75}>
      {events.map((e, i) => (
        <Chip
          key={i}
          label={`${e.who}: ${e.text}`}
          sx={{bgcolor: color[e.who] || '#eee', justifyContent: 'flex-start', fontFamily: 'monospace'}}
        />
      ))}
    </Stack>
  );
}

function RaceView({cur}) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Box sx={{p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, minWidth: 120}}>
          <Typography variant="caption">Thread A</Typography>
          <Typography fontFamily="monospace" fontWeight={700}>
            eax={cur.t1?.eax ?? '—'}
          </Typography>
        </Box>
        <Box sx={{p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, minWidth: 120}}>
          <Typography variant="caption">Thread B</Typography>
          <Typography fontFamily="monospace" fontWeight={700}>
            eax={cur.t2?.eax ?? '—'}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            bgcolor: cur.phase === 'lost' ? '#ffcdd2' : '#eceff1',
            borderRadius: 1,
            minWidth: 140,
          }}
        >
          <Typography variant="caption">counter (shared)</Typography>
          <Typography fontFamily="monospace" fontWeight={700}>
            {cur.counter}
            {cur.expected != null ? ` (want ${cur.expected})` : ''}
          </Typography>
        </Box>
      </Stack>
      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
        mov counter→eax · add $1 · mov eax→counter
      </Typography>
    </Stack>
  );
}

export default function ConcurrencyIntroSimulator() {
  const [scenario, setScenario] = useState('aspace');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Concurrency: an introduction"
      subtitle={cfg.subtitle}
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <Stack spacing={1.5}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={scenario}
            onChange={(_, v) => {
              if (v) {
                setScenario(v);
                setStep(0);
              }
            }}
          >
            {Object.entries(SCENARIOS).map(([k, v]) => (
              <ToggleButton key={k} value={k}>
                {v.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <StepControls
            step={step}
            total={cfg.steps.length}
            onReset={() => setStep(0)}
            onPrev={() => setStep((s) => Math.max(0, s - 1))}
            onNext={() => setStep((s) => Math.min(cfg.steps.length - 1, s + 1))}
          />
        </Stack>
      }
    >
      {scenario === 'aspace' && <AddrSpace mode={cur.mode} />}
      {scenario === 'create' && <EventTrace events={cur.events} />}
      {scenario === 'race' && <RaceView cur={cur} />}
      {cur.callout && (
        <Chip size="small" color="primary" label={cur.callout} sx={{mt: 1}} variant="outlined" />
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

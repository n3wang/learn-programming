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
  {key: 'sem', label: 'Semaphore value', color: '#ab47bc', desc: 'Integer; wait decrements, post increments'},
  {key: 'sleep', label: 'Blocked on wait', color: '#42a5f5', desc: 'Value went negative / ≤0'},
  {key: 'hold', label: 'Holds resource', color: '#ef5350', desc: 'Lock / fork / writelock'},
  {key: 'ok', label: 'Progress', color: '#66bb6a', desc: 'Correct ordering / no deadlock'},
];

const SCENARIOS = {
  binary: {
    label: 'Binary / join',
    subtitle: 'Init 1 → lock. Init 0 → join/ordering (parent wait, child post).',
    steps: [
      {
        note: 'Binary lock: init=1. T0 wait → 0, enters CS. T1 wait → −1, sleeps until T0 post.',
        kind: 'lock',
        val: 0,
        t0: 'CS',
        t1: 'sleep',
      },
      {
        note: 'Join: init=0. Parent wait first → −1 sleep; child post → 0 and wakes parent.',
        kind: 'join',
        val: 0,
        parent: 'ready',
        child: 'posted',
      },
      {
        note: 'Join other order: child posts first (0→1); parent wait returns immediately.',
        kind: 'join',
        val: 0,
        parent: 'done',
        child: 'done',
        early: true,
      },
    ],
  },
  pc: {
    label: 'Prod/cons',
    subtitle: 'empty=MAX, full=0, mutex=1. Wait empty/full outside the mutex — or deadlock.',
    steps: [
      {
        note: 'Wrong: mutex then wait(full) while holding mutex → producer cannot post full. Deadlock.',
        empty: 1,
        full: -1,
        mutex: 0,
        bad: true,
      },
      {
        note: 'Correct order: wait(empty); lock; put; unlock; post(full). Symmetric for consumer.',
        empty: 0,
        full: 1,
        mutex: 1,
        ok: true,
      },
      {
        note: 'Without mutex around put/get indices, two producers race on fill_ptr (Fig 31.10 bug).',
        empty: 8,
        full: 2,
        mutex: 1,
        tip: 'mutex only around put/get',
      },
    ],
  },
  rw: {
    label: 'R/W lock',
    subtitle: 'Many readers or one writer. First reader takes writelock; last releases it.',
    steps: [
      {
        note: 'readers=0. R1 acquire: readers=1, wait(writelock). More readers just bump count.',
        readers: 2,
        writerWaiting: true,
      },
      {
        note: 'Writer blocks on writelock until readers→0; last reader posts writelock.',
        readers: 0,
        writerIn: true,
      },
      {
        note: 'Caveat: readers can starve writers. Complex R/W often slower than a simple lock (Hill’s Law).',
        readers: 3,
        writerWaiting: true,
        starve: true,
      },
    ],
  },
  dine: {
    label: 'Philosophers',
    subtitle: 'Five forks as semaphores=1. Left-then-right deadlocks; break the cycle.',
    steps: [
      {
        note: 'Each takes left first → all hold one fork, wait forever for right. Classic deadlock.',
        forks: [1, 1, 1, 1, 1],
        held: ['P0:L', 'P1:L', 'P2:L', 'P3:L', 'P4:L'],
        bad: true,
      },
      {
        note: 'Dijkstra: P4 takes right then left. Cycle broken; someone can eat.',
        forks: [0, 0, 1, 1, 0],
        held: ['P0 eating', 'P2 think'],
        ok: true,
      },
    ],
  },
};

function SemBadge({label, val, alert}) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1,
        bgcolor: alert ? '#ffcdd2' : '#f3e5f5',
        fontFamily: 'monospace',
        fontWeight: 700,
      }}
    >
      {label}={val}
    </Box>
  );
}

export default function SemaphoresSimulator() {
  const [scenario, setScenario] = useState('binary');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Semaphores"
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
      {scenario === 'binary' && (
        <Stack spacing={1}>
          <SemBadge label="sem" val={cur.val} />
          {cur.kind === 'lock' && (
            <Stack direction="row" spacing={1}>
              <Chip label={`T0:${cur.t0}`} sx={{bgcolor: '#66bb6a'}} />
              <Chip label={`T1:${cur.t1}`} sx={{bgcolor: '#42a5f5'}} />
            </Stack>
          )}
          {cur.kind === 'join' && (
            <Stack direction="row" spacing={1}>
              <Chip label={`parent:${cur.parent}`} sx={{bgcolor: '#66bb6a'}} />
              <Chip label={`child:${cur.child}`} sx={{bgcolor: '#ffb74d'}} />
              {cur.early && <Chip size="small" color="primary" label="child first" />}
            </Stack>
          )}
        </Stack>
      )}
      {scenario === 'pc' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <SemBadge label="empty" val={cur.empty} />
            <SemBadge label="full" val={cur.full} alert={cur.full < 0} />
            <SemBadge label="mutex" val={cur.mutex} alert={cur.bad} />
          </Stack>
          {cur.bad && <Chip color="error" size="small" label="deadlock: hold mutex while waiting full" />}
          {cur.ok && <Chip color="success" size="small" label="mutex only around put/get" />}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'rw' && (
        <Stack spacing={1}>
          <Typography fontFamily="monospace" fontWeight={700}>
            readers={cur.readers}
          </Typography>
          <Stack direction="row" spacing={1}>
            {cur.writerWaiting && <Chip label="writer waiting" sx={{bgcolor: '#ffb74d'}} />}
            {cur.writerIn && <Chip label="writer in CS" sx={{bgcolor: '#ef5350'}} />}
            {cur.starve && <Chip color="warning" size="small" label="reader preference / starve risk" />}
          </Stack>
        </Stack>
      )}
      {scenario === 'dine' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.forks || []).map((f, i) => (
              <Chip key={i} size="small" label={`f${i}=${f}`} sx={{bgcolor: f ? '#c8e6c9' : '#ffcdd2'}} />
            ))}
          </Stack>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.held || []).map((h) => (
              <Chip key={h} size="small" label={h} sx={{bgcolor: cur.bad ? '#ffcdd2' : '#e1bee7'}} />
            ))}
          </Stack>
          {cur.bad && <Chip color="error" size="small" label="all left-first → deadlock" />}
          {cur.ok && <Chip color="success" size="small" label="P4 reverses order" />}
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

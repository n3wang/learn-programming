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

const LEGEND = [
  {key: 'run', label: 'Running', color: '#66bb6a', desc: 'Thread executing'},
  {key: 'sleep', label: 'Waiting on CV', color: '#42a5f5', desc: 'cond_wait — lock released'},
  {key: 'ready', label: 'Ready (signaled)', color: '#ffb74d', desc: 'Woken; Mesa: recheck condition'},
  {key: 'buf', label: 'Buffer slot', color: '#ab47bc', desc: 'Bounded buffer occupancy'},
];

const SCENARIOS = {
  join: {
    label: 'Join',
    subtitle: 'Fig 30.3 — done + mutex + CV. Always hold the lock around wait/signal.',
    steps: [
      {
        note: 'Parent locks, sees done==0, wait() — atomically unlocks and sleeps.',
        done: 0,
        parent: 'sleep',
        child: 'run',
      },
      {
        note: 'Child locks, sets done=1, signal, unlock. Parent becomes ready.',
        done: 1,
        parent: 'ready',
        child: 'done',
      },
      {
        note: 'Parent returns from wait with lock held, while rechecks done, unlocks, prints end.',
        done: 1,
        parent: 'run',
        child: 'done',
      },
      {
        note: 'Other order: child finishes first (signal with nobody waiting). Parent joins, sees done==1, never waits.',
        done: 1,
        parent: 'run',
        child: 'done',
        early: true,
      },
    ],
  },
  mesa: {
    label: 'While≠if',
    subtitle: 'Mesa semantics — signal is a hint. Always while (cond) wait.',
    steps: [
      {
        note: 'Tc1 waits (empty). Producer fills, signals Tc1→ready. Before Tc1 runs, Tc2 sneaks in and get()s.',
        count: 0,
        threads: [
          {id: 'Tc1', st: 'ready'},
          {id: 'Tc2', st: 'run'},
          {id: 'Tp', st: 'sleep'},
        ],
      },
      {
        note: 'If Tc1 used if: returns from wait and get() on empty → assert. With while: recheck, wait again.',
        count: 0,
        threads: [
          {id: 'Tc1', st: 'sleep'},
          {id: 'Tc2', st: 'done'},
          {id: 'Tp', st: 'sleep'},
        ],
        tip: 'while (count==0) wait',
      },
    ],
  },
  twocv: {
    label: 'Two CVs',
    subtitle: 'empty vs fill — producers wait empty/signal fill; consumers wait fill/signal empty.',
    steps: [
      {
        note: 'One CV + while still broken: consumer may wake another consumer; producer left sleeping (Fig 30.9).',
        emptyQ: ['Tp'],
        fillQ: ['Tc2'],
        problem: true,
      },
      {
        note: 'Two CVs: after get, signal empty (wake producer). After put, signal fill (wake consumer).',
        emptyQ: [],
        fillQ: [],
        count: 1,
        ok: true,
      },
      {
        note: 'Multi-slot buffer: wait while count==MAX / count==0. Same two CVs; fewer switches, more concurrency.',
        emptyQ: [],
        fillQ: [],
        count: 2,
        max: 3,
      },
    ],
  },
  cover: {
    label: 'Broadcast',
    subtitle: 'Covering conditions — free(50) must wake whoever can proceed (allocate 10 vs 100).',
    steps: [
      {
        note: 'bytesLeft=0. Ta waits for 100, Tb for 10. Both on same CV.',
        bytes: 0,
        waiters: ['Ta(100)', 'Tb(10)'],
      },
      {
        note: 'Tc free(50). signal() might wake Ta (still blocked) and leave Tb sleeping — stuck.',
        bytes: 50,
        waiters: ['Ta(100)', 'Tb(10)'],
        bad: true,
      },
      {
        note: 'broadcast() wakes all; each while-rechecks. Tb proceeds; Ta sleeps again. Correct covering condition.',
        bytes: 40,
        waiters: ['Ta(100)'],
        ok: true,
      },
    ],
  },
};

function ThreadChip({id, st}) {
  const bg =
    st === 'run' || st === 'done'
      ? '#66bb6a'
      : st === 'sleep'
        ? '#42a5f5'
        : st === 'ready'
          ? '#ffb74d'
          : '#e0e0e0';
  return <Chip size="small" label={`${id}:${st}`} sx={{bgcolor: bg, fontFamily: 'monospace'}} />;
}

export default function ConditionVariablesSimulator() {
  const [scenario, setScenario] = useState('join');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Condition variables"
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
      {scenario === 'join' && (
        <Stack spacing={1}>
          <Chip label={`done=${cur.done}`} sx={{bgcolor: cur.done ? '#c8e6c9' : '#ffcdd2', width: 'fit-content'}} />
          <Stack direction="row" spacing={1}>
            <ThreadChip id="parent" st={cur.parent} />
            <ThreadChip id="child" st={cur.child} />
          </Stack>
          {cur.early && <Chip size="small" color="primary" label="child finished before join" />}
        </Stack>
      )}
      {scenario === 'mesa' && (
        <Stack spacing={1}>
          <Typography fontFamily="monospace">count={cur.count}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(cur.threads || []).map((t) => (
              <ThreadChip key={t.id} id={t.id} st={t.st} />
            ))}
          </Stack>
          {cur.tip && <Chip size="small" color="success" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'twocv' && (
        <Stack spacing={1}>
          <Typography fontFamily="monospace">
            count={cur.count ?? '?'}
            {cur.max != null ? ` / MAX=${cur.max}` : ''}
          </Typography>
          <Typography variant="caption">
            empty queue: [{(cur.emptyQ || []).join(', ') || '—'}] · fill queue: [
            {(cur.fillQ || []).join(', ') || '—'}]
          </Typography>
          {cur.problem && <Chip color="error" label="wrong waiter woken" size="small" />}
          {cur.ok && <Chip color="success" label="directed signals" size="small" />}
        </Stack>
      )}
      {scenario === 'cover' && (
        <Stack spacing={1}>
          <Box sx={{p: 1.5, bgcolor: '#f3e5f5', borderRadius: 1, fontFamily: 'monospace', fontWeight: 700}}>
            bytesLeft={cur.bytes}
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(cur.waiters || []).map((w) => (
              <Chip key={w} label={w} sx={{bgcolor: '#42a5f5'}} />
            ))}
          </Stack>
          {cur.bad && <Chip color="error" size="small" label="signal may pick wrong waiter" />}
          {cur.ok && <Chip color="success" size="small" label="broadcast + while" />}
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

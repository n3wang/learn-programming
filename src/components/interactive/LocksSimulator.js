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
  {key: 'free', label: 'Lock free', color: '#66bb6a', desc: 'flag=0 — available'},
  {key: 'held', label: 'Lock held', color: '#ef5350', desc: 'flag=1 — owner in CS'},
  {key: 'spin', label: 'Spinning', color: '#ffb74d', desc: 'Busy-wait on lock'},
  {key: 'sleep', label: 'Parked', color: '#42a5f5', desc: 'Sleeping on waiter queue'},
  {key: 'ticket', label: 'Ticket/turn', color: '#ab47bc', desc: 'Fair ticket lock state'},
];

const SCENARIOS = {
  idea: {
    label: 'Lock API',
    subtitle: 'lock → critical section → unlock. At most one owner.',
    steps: [
      {
        note: 'mutex free. T1 calls lock() → acquires; enters CS (balance++).',
        flag: 0,
        owner: null,
        waiters: [],
      },
      {
        note: 'T1 holds mutex. T2 calls lock() — must wait (spin or sleep).',
        flag: 1,
        owner: 'T1',
        waiters: ['T2'],
      },
      {
        note: 'T1 unlock(). Lock free (or handed to waiter). T2 may enter.',
        flag: 0,
        owner: null,
        waiters: [],
        next: 'T2',
      },
    ],
  },
  broken: {
    label: 'Broken flag',
    subtitle: 'Fig 28.2 — test then set with plain loads/stores is not atomic.',
    steps: [
      {
        note: 'flag=0. T1: while(flag==1) ok; about to set flag=1.',
        t1: 'test ok',
        t2: '—',
        flag: 0,
      },
      {
        note: 'Interrupt → T2: also sees flag==0, sets flag=1, enters CS.',
        t1: 'paused before set',
        t2: 'set flag=1 · in CS',
        flag: 1,
      },
      {
        note: 'T1 resumes, also sets flag=1, enters CS. Mutual exclusion broken!',
        t1: 'set flag=1 · in CS',
        t2: 'in CS',
        flag: 1,
        bad: true,
      },
    ],
  },
  tas: {
    label: 'Test-and-set',
    subtitle: 'Atomic TestAndSet(flag,1): return old, set new. Spin while old==1.',
    steps: [
      {
        note: 'flag=0. T1 TestAndSet→0, flag becomes 1. Acquired without spinning.',
        flag: 1,
        owner: 'T1',
        spinning: [],
      },
      {
        note: 'T2 TestAndSet→1 repeatedly while T1 holds — classic spin lock.',
        flag: 1,
        owner: 'T1',
        spinning: ['T2'],
      },
      {
        note: 'T1 unlock sets flag=0. Next TestAndSet by T2 returns 0 → acquire.',
        flag: 0,
        owner: null,
        spinning: [],
        next: 'T2',
      },
    ],
  },
  ticket: {
    label: 'Ticket',
    subtitle: 'Fig 28.7 — FetchAndAdd ticket; wait until turn==myturn. Fair progress.',
    steps: [
      {
        note: 'Init ticket=0, turn=0. T1 FetchAndAdd → myturn=0; turn==0 → enter.',
        ticket: 1,
        turn: 0,
        holders: [{id: 'T1', my: 0, in: true}],
      },
      {
        note: 'T2 FetchAndAdd → myturn=1; spins while turn!=1.',
        ticket: 2,
        turn: 0,
        holders: [
          {id: 'T1', my: 0, in: true},
          {id: 'T2', my: 1, in: false},
        ],
      },
      {
        note: 'T1 unlock: turn++. T2 sees turn==1 → enters. No starvation of ticket holders.',
        ticket: 2,
        turn: 1,
        holders: [
          {id: 'T1', my: 0, in: false},
          {id: 'T2', my: 1, in: true},
        ],
      },
    ],
  },
  park: {
    label: 'Park/queue',
    subtitle: 'Fig 28.9 — spin only on short guard; waiters park; unlock unparks next.',
    steps: [
      {
        note: 'T1 holds flag. T2 fails to get flag → queue_add, release guard, park().',
        flag: 1,
        queue: ['T2'],
        sleeping: ['T2'],
      },
      {
        note: 'T1 unlock: queue not empty → unpark(T2); pass lock (flag stays 1 for T2).',
        flag: 1,
        queue: [],
        sleeping: [],
        running: 'T2',
      },
      {
        note: 'Avoids wasting whole timeslices spinning. Needs setpark() against wakeup/wait race.',
        flag: 0,
        queue: [],
        sleeping: [],
      },
    ],
  },
};

function FlagBox({flag, owner}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: flag ? '#ffcdd2' : '#c8e6c9',
        fontFamily: 'monospace',
        fontWeight: 700,
        minWidth: 160,
      }}
    >
      flag={flag} {owner ? `· owner ${owner}` : '· free'}
    </Box>
  );
}

export default function LocksSimulator() {
  const [scenario, setScenario] = useState('idea');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Locks"
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
      {(scenario === 'idea' || scenario === 'tas') && (
        <Stack spacing={1}>
          <FlagBox flag={cur.flag} owner={cur.owner} />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(cur.waiters || []).map((w) => (
              <Chip key={w} label={`wait ${w}`} sx={{bgcolor: '#ffb74d'}} />
            ))}
            {(cur.spinning || []).map((w) => (
              <Chip key={w} label={`spin ${w}`} sx={{bgcolor: '#ffb74d'}} />
            ))}
            {cur.next && <Chip color="success" label={`next ${cur.next}`} />}
          </Stack>
        </Stack>
      )}
      {scenario === 'broken' && (
        <Stack spacing={1}>
          <FlagBox flag={cur.flag} />
          <Typography fontFamily="monospace">T1: {cur.t1}</Typography>
          <Typography fontFamily="monospace">T2: {cur.t2}</Typography>
          {cur.bad && <Chip color="error" label="both in CS — race" />}
        </Stack>
      )}
      {scenario === 'ticket' && (
        <Stack spacing={1}>
          <Typography fontFamily="monospace" fontWeight={700}>
            ticket={cur.ticket} · turn={cur.turn}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(cur.holders || []).map((h) => (
              <Chip
                key={h.id}
                label={`${h.id} my=${h.my}${h.in ? ' IN' : ' wait'}`}
                sx={{bgcolor: h.in ? '#66bb6a' : '#ffb74d'}}
              />
            ))}
          </Stack>
        </Stack>
      )}
      {scenario === 'park' && (
        <Stack spacing={1}>
          <FlagBox flag={cur.flag} owner={cur.running} />
          <Typography variant="caption">queue: [{(cur.queue || []).join(', ') || 'empty'}]</Typography>
          <Stack direction="row" spacing={1}>
            {(cur.sleeping || []).map((s) => (
              <Chip key={s} label={`park ${s}`} sx={{bgcolor: '#42a5f5'}} />
            ))}
            {cur.running && <Chip color="success" label={`run ${cur.running}`} />}
          </Stack>
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

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
  {key: 'atom', label: 'Atomicity gap', color: '#ef5350', desc: 'Check then use without a lock'},
  {key: 'order', label: 'Order bug', color: '#ffb74d', desc: 'B runs before A was supposed to'},
  {key: 'cycle', label: 'Wait cycle', color: '#ab47bc', desc: 'Circular wait → deadlock'},
  {key: 'ok', label: 'Fixed / safe', color: '#66bb6a', desc: 'Lock, CV, or ordering prevents the bug'},
];

const SCENARIOS = {
  types: {
    label: 'Bug types',
    subtitle: 'Lu et al. [L+08]: ~105 bugs — most non-deadlock (atomicity / order).',
    steps: [
      {
        note: 'Study mix: MySQL, Apache, Mozilla, OpenOffice. 74 non-deadlock, 31 deadlock.',
        nonDl: 74,
        dl: 31,
      },
      {
        note: '97% of non-deadlock bugs were atomicity or order violations — learn those patterns.',
        tip: 'focus tooling here',
      },
    ],
  },
  atomicity: {
    label: 'Atomicity',
    subtitle: 'MySQL-style: check non-NULL then use — must be one atomic region.',
    steps: [
      {
        note: 'T1: if (proc_info) … interrupted before fputs. T2 sets proc_info=NULL → crash.',
        t1: 'checked',
        t2: 'NULLed',
        bad: true,
      },
      {
        note: 'Fix: hold proc_info_lock around check+use and around the NULL write.',
        t1: 'locked CS',
        t2: 'waits',
        ok: true,
      },
    ],
  },
  order: {
    label: 'Order',
    subtitle: 'Init must finish before the child reads mThread — enforce with a CV.',
    steps: [
      {
        note: 'Child mMain runs before init stores mThread → NULL deref (order flipped).',
        init: 'partial',
        child: 'reads early',
        bad: true,
      },
      {
        note: 'mtInit + mtCond: child waits while mtInit==0; init signals after create.',
        init: 'signaled',
        child: 'proceeds',
        ok: true,
      },
    ],
  },
  deadlock: {
    label: 'Deadlock',
    subtitle: 'Four Coffman conditions. Break any one → no deadlock.',
    steps: [
      {
        note: 'T1 holds L1 wants L2; T2 holds L2 wants L1. Cycle in the wait-for graph.',
        edges: ['T1→L2', 'T2→L1'],
        holds: ['T1:L1', 'T2:L2'],
        bad: true,
      },
      {
        note: 'Prevention: total/partial lock order (always L1 then L2), or sort by lock address.',
        tip: 'break circular wait',
        ok: true,
      },
      {
        note: 'trylock + release on failure avoids hold-and-wait — watch for livelock (add backoff).',
        tip: 'trylock / unlock / retry',
      },
      {
        note: 'Detect & recover: rare deadlock → reboot / DB abort a txn (Tom West: not always perfect).',
        tip: 'pragmatic recovery',
      },
    ],
  },
  lockfree: {
    label: 'Lock-free',
    subtitle: 'Avoid mutual exclusion with CAS — no locks → no deadlock (livelock still possible).',
    steps: [
      {
        note: 'CAS loop AtomicIncrement: read old, CAS(old, old+amt) until success.',
        op: 'increment',
      },
      {
        note: 'Lock-free list insert: n->next=head; CAS(&head, n->next, n) — retry if head moved.',
        op: 'insert',
        ok: true,
      },
    ],
  },
};

export default function ConcurrencyBugsSimulator() {
  const [scenario, setScenario] = useState('types');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Common concurrency bugs"
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
      {scenario === 'types' && (
        <Stack spacing={1}>
          {cur.nonDl != null && (
            <Stack direction="row" spacing={1}>
              <Chip label={`non-deadlock ${cur.nonDl}`} sx={{bgcolor: '#ffb74d'}} />
              <Chip label={`deadlock ${cur.dl}`} sx={{bgcolor: '#ab47bc'}} />
            </Stack>
          )}
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'atomicity' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Chip label={`T1: ${cur.t1}`} sx={{bgcolor: cur.bad ? '#ef5350' : '#66bb6a'}} />
            <Chip label={`T2: ${cur.t2}`} sx={{bgcolor: cur.bad ? '#ffb74d' : '#42a5f5'}} />
          </Stack>
          {cur.bad && <Chip color="error" size="small" label="atomicity violation" />}
          {cur.ok && <Chip color="success" size="small" label="same lock both sides" />}
        </Stack>
      )}
      {scenario === 'order' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Chip label={`init: ${cur.init}`} sx={{bgcolor: cur.bad ? '#ffb74d' : '#66bb6a'}} />
            <Chip label={`child: ${cur.child}`} sx={{bgcolor: cur.bad ? '#ef5350' : '#42a5f5'}} />
          </Stack>
          {cur.bad && <Chip color="error" size="small" label="order violation" />}
          {cur.ok && <Chip color="success" size="small" label="CV enforces order" />}
        </Stack>
      )}
      {scenario === 'deadlock' && (
        <Stack spacing={1}>
          {cur.holds && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {cur.holds.map((h) => (
                <Chip key={h} size="small" label={h} sx={{bgcolor: '#ef5350'}} />
              ))}
              {(cur.edges || []).map((e) => (
                <Chip key={e} size="small" label={e} sx={{bgcolor: '#ab47bc'}} />
              ))}
            </Stack>
          )}
          {cur.bad && <Chip color="error" size="small" label="cycle → deadlock" />}
          {cur.ok && <Chip color="success" size="small" label="lock order / address sort" />}
          {cur.tip && !cur.ok && !cur.bad && (
            <Chip size="small" variant="outlined" label={cur.tip} />
          )}
        </Stack>
      )}
      {scenario === 'lockfree' && (
        <Stack spacing={1}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#e8f5e9',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            CAS: {cur.op}
          </Box>
          {cur.ok && <Chip color="success" size="small" label="no lock held → no deadlock" />}
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

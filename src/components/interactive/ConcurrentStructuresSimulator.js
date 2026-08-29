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
  {key: 'lock', label: 'Lock held', color: '#ef5350', desc: 'Mutex protecting structure or node'},
  {key: 'local', label: 'Local counter', color: '#42a5f5', desc: 'Per-CPU approximate count'},
  {key: 'global', label: 'Global', color: '#66bb6a', desc: 'Aggregated / shared structure'},
  {key: 'bucket', label: 'Bucket', color: '#ab47bc', desc: 'Hash bucket with its own list lock'},
];

const SCENARIOS = {
  counter: {
    label: 'Counters',
    subtitle: 'One big lock vs approximate (sloppy) counters with threshold S.',
    steps: [
      {
        note: 'Precise: every ++ grabs one mutex. Correct, but hot lock → terrible scaling (Fig 29.3).',
        view: 'precise',
        value: 4,
        locked: true,
      },
      {
        note: 'Approximate: per-CPU local counters + locks. Increment local; low contention across CPUs.',
        view: 'approx',
        locals: [2, 1, 3, 0],
        global: 0,
        s: 5,
      },
      {
        note: 'When local ≥ S, transfer to global under glock and reset local (Fig 29.4). get() reads global (approximate).',
        view: 'approx',
        locals: [0, 1, 3, 0],
        global: 5,
        s: 5,
        transfer: 'L1→G',
      },
    ],
  },
  list: {
    label: 'Lists',
    subtitle: 'Big lock around list ops; malloc outside CS; hand-over-hand rarely wins.',
    steps: [
      {
        note: 'Single list lock for insert/lookup. Simple and often fast enough (Knuth: don’t optimize early).',
        nodes: [10, 20, 30],
        held: 'list',
      },
      {
        note: 'Rewrite insert: malloc outside the lock; only splice under lock. Fewer unlock paths on errors.',
        nodes: [5, 10, 20],
        held: 'list',
        tip: 'minimize lock+return paths',
      },
      {
        note: 'Hand-over-hand: lock per node, acquire next then release current. More concurrency, high lock overhead — often slower.',
        nodes: [10, 20, 30],
        held: 'node20',
        hand: true,
      },
    ],
  },
  queue: {
    label: 'Queues',
    subtitle: 'Michael & Scott: headLock + tailLock + dummy node → concurrent enq/deq.',
    steps: [
      {
        note: 'Init: dummy node; head=tail=dummy. Two locks enable parallel enqueue and dequeue.',
        head: 'D',
        tail: 'D',
        nodes: ['D'],
      },
      {
        note: 'Enqueue locks only tailLock; links after tail. Dequeue locks only headLock (common case).',
        head: 'D',
        tail: 'A',
        nodes: ['D', 'A'],
        enq: true,
      },
      {
        note: 'Dequeue advances head; frees old dummy. Empty when head→next is NULL.',
        head: 'A',
        tail: 'A',
        nodes: ['A'],
        deq: true,
      },
    ],
  },
  hash: {
    label: 'Hash table',
    subtitle: 'Array of concurrent lists — lock per bucket. Scales when keys spread out.',
    steps: [
      {
        note: 'BUCKETS lists, each with its own lock. Insert/lookup: key % BUCKETS → that list.',
        buckets: [
          {id: 0, keys: [101]},
          {id: 1, keys: []},
          {id: 2, keys: [2, 203]},
        ],
        active: null,
      },
      {
        note: 'Threads on different buckets run in parallel. Same bucket still serializes on that list lock.',
        buckets: [
          {id: 0, keys: [101], busy: true},
          {id: 1, keys: [12], busy: true},
          {id: 2, keys: [2, 203]},
        ],
        active: 'parallel',
      },
      {
        note: 'Fig 29.11: concurrent hash scales; single-lock list does not. Start simple, refine if measured slow.',
        buckets: [
          {id: 0, keys: [101]},
          {id: 1, keys: [12]},
          {id: 2, keys: [2, 203]},
        ],
        active: 'scale',
      },
    ],
  },
};

function CounterView({cur}) {
  if (cur.view === 'precise') {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label={`value=${cur.value}`} sx={{bgcolor: '#66bb6a', fontFamily: 'monospace'}} />
        {cur.locked && <Chip label="ONE mutex" color="error" size="small" />}
      </Stack>
    );
  }
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {(cur.locals || []).map((v, i) => (
          <Box
            key={i}
            sx={{
              px: 1.5,
              py: 1,
              bgcolor: '#42a5f5',
              borderRadius: 1,
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            L{i + 1}={v}
          </Box>
        ))}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            bgcolor: '#66bb6a',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
        >
          G={cur.global} (S={cur.s})
        </Box>
      </Stack>
      {cur.transfer && <Chip size="small" color="primary" label={cur.transfer} />}
    </Stack>
  );
}

function ListView({cur}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography fontFamily="monospace">head→</Typography>
      {(cur.nodes || []).map((k) => (
        <Chip
          key={k}
          label={k}
          sx={{
            bgcolor:
              cur.held === `node${k}` || (cur.hand && k === 20)
                ? '#ef5350'
                : cur.held === 'list'
                  ? '#ffcdd2'
                  : '#e0e0e0',
            fontFamily: 'monospace',
          }}
        />
      ))}
      {cur.hand && <Chip size="small" label="hand-over-hand" />}
      {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
    </Stack>
  );
}

function QueueView({cur}) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {(cur.nodes || []).map((n) => (
          <Chip
            key={n}
            label={n}
            sx={{
              bgcolor: n === 'D' ? '#bdbdbd' : '#ab47bc',
              color: n === 'D' ? '#212121' : '#fff',
              fontFamily: 'monospace',
            }}
          />
        ))}
      </Stack>
      <Typography variant="caption" fontFamily="monospace">
        head={cur.head} · tail={cur.tail}
        {cur.enq ? ' · enq(tailLock)' : ''}
        {cur.deq ? ' · deq(headLock)' : ''}
      </Typography>
    </Stack>
  );
}

function HashView({cur}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {(cur.buckets || []).map((b) => (
        <Box
          key={b.id}
          sx={{
            p: 1,
            minWidth: 72,
            borderRadius: 1,
            bgcolor: b.busy ? '#ce93d8' : '#f3e5f5',
            border: '1px solid #ab47bc',
          }}
        >
          <Typography variant="caption" display="block">
            bucket {b.id}
          </Typography>
          <Typography fontFamily="monospace" fontSize={12}>
            [{(b.keys || []).join(',') || '∅'}]
          </Typography>
        </Box>
      ))}
      {cur.active === 'parallel' && <Chip size="small" color="success" label="parallel buckets" />}
      {cur.active === 'scale' && <Chip size="small" color="primary" label="scales vs list" />}
    </Stack>
  );
}

export default function ConcurrentStructuresSimulator() {
  const [scenario, setScenario] = useState('counter');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Lock-based concurrent structures"
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
      {scenario === 'counter' && <CounterView cur={cur} />}
      {scenario === 'list' && <ListView cur={cur} />}
      {scenario === 'queue' && <QueueView cur={cur} />}
      {scenario === 'hash' && <HashView cur={cur} />}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

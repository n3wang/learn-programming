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
  {key: 'loop', label: 'Event loop', color: '#66bb6a', desc: 'One handler at a time = scheduling'},
  {key: 'ready', label: 'FD ready', color: '#42a5f5', desc: 'select/poll reports readable/writable'},
  {key: 'block', label: 'Blocked (bad)', color: '#ef5350', desc: 'Blocking call stalls the whole server'},
  {key: 'aio', label: 'Async I/O', color: '#ab47bc', desc: 'Issue I/O, return; poll/signal later'},
  {key: 'cont', label: 'Continuation', color: '#ffb74d', desc: 'Manual stack: save sd keyed by fd'},
];

const SCENARIOS = {
  loop: {
    label: 'Event loop',
    subtitle: 'getEvents → process each handler. You schedule; no other thread interrupts on 1 CPU.',
    steps: [
      {
        note: 'Loop blocks in select/getEvents until something is ready — then run one handler at a time.',
        phase: 'wait',
        fds: [],
      },
      {
        note: 'Two FDs ready. Handlers run sequentially: processFD(3), then processFD(7). That order is your schedule.',
        phase: 'handle',
        fds: [3, 7],
        current: 3,
      },
      {
        note: 'Single-threaded on one CPU → no locks needed between handlers. (Multicore changes that.)',
        phase: 'done',
        fds: [3, 7],
        tip: 'explicit scheduling',
      },
    ],
  },
  select: {
    label: 'select()',
    subtitle: 'FD_ZERO / FD_SET / select / FD_ISSET — check which descriptors are ready.',
    steps: [
      {
        note: 'Build readFDs for sockets minFD…maxFD, then select(maxFD+1, &readFDs, …).',
        ready: [],
      },
      {
        note: 'select returns; FD_ISSET finds fd 4 and 9 readable → process those only.',
        ready: [4, 9],
      },
      {
        note: 'Timeout NULL = wait forever; timeout 0 = poll and return immediately.',
        ready: [4],
        tip: 'timeout policy',
      },
    ],
  },
  block: {
    label: 'Don’t block',
    subtitle: 'A blocking open/read in a handler freezes the whole event server.',
    steps: [
      {
        note: 'HTTP-like request: open+read file. In threads, other threads run while this one waits on disk.',
        mode: 'threads',
        ok: true,
      },
      {
        note: 'Same blocking read in the only event-loop thread → clients starve until I/O finishes.',
        mode: 'events',
        bad: true,
      },
      {
        note: 'Rule: never block in an event handler. Use async I/O (or a hybrid thread pool for disk).',
        tip: 'aio_read / hybrid',
      },
    ],
  },
  aio: {
    label: 'Async I/O',
    subtitle: 'Fill aiocb, aio_read returns immediately; aio_error / signal says when done.',
    steps: [
      {
        note: 'Issue aio_read(&cb) — returns right away. Event loop keeps selecting on network FDs.',
        ios: ['inflight'],
      },
      {
        note: 'Later aio_error(&cb)==0 → buffer ready. Without signals, you poll outstanding AIO control blocks.',
        ios: ['done'],
        ok: true,
      },
      {
        note: 'Hybrid (Flash [PDZ99]): events for network, thread pool for blocking disk when AIO is weak.',
        tip: 'network events + disk threads',
      },
    ],
  },
  cont: {
    label: 'Continuations',
    subtitle: 'Manual stack management: save sd keyed by fd until the read completes.',
    steps: [
      {
        note: 'Threads: read(fd); write(sd,…) — sd lives on the stack across the blocking read.',
        style: 'thread',
      },
      {
        note: 'Events: after aio_read(fd), stash continuation {sd} in a table indexed by fd.',
        style: 'save',
        table: {3: 'sd=8'},
      },
      {
        note: 'When fd 3 completes, look up sd=8 and write. That package is the continuation [A+02].',
        style: 'resume',
        table: {3: 'sd=8'},
        ok: true,
      },
    ],
  },
};

export default function EventBasedConcurrencySimulator() {
  const [scenario, setScenario] = useState('loop');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Event-based concurrency"
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
      {scenario === 'loop' && (
        <Stack spacing={1}>
          <Chip
            label={`phase: ${cur.phase}`}
            sx={{bgcolor: cur.phase === 'wait' ? '#42a5f5' : '#66bb6a', width: 'fit-content'}}
          />
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.fds || []).map((fd) => (
              <Chip
                key={fd}
                size="small"
                label={`fd ${fd}${cur.current === fd ? ' ←' : ''}`}
                sx={{bgcolor: cur.current === fd ? '#ab47bc' : '#bbdefb'}}
              />
            ))}
          </Stack>
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'select' && (
        <Stack spacing={1}>
          <Typography fontFamily="monospace" fontWeight={700}>
            ready FDs: [{(cur.ready || []).join(', ') || '—'}]
          </Typography>
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'block' && (
        <Stack spacing={1}>
          {cur.mode && (
            <Chip
              label={cur.mode === 'threads' ? 'threaded server' : 'event loop'}
              sx={{bgcolor: cur.bad ? '#ef5350' : '#66bb6a', width: 'fit-content'}}
            />
          )}
          {cur.bad && <Chip color="error" size="small" label="whole server blocked" />}
          {cur.ok && <Chip color="success" size="small" label="other threads progress" />}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'aio' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            {(cur.ios || []).map((s) => (
              <Chip
                key={s}
                label={s}
                sx={{bgcolor: s === 'done' ? '#66bb6a' : '#ab47bc'}}
              />
            ))}
          </Stack>
          {cur.ok && <Chip color="success" size="small" label="buffer ready" />}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'cont' && (
        <Stack spacing={1}>
          <Chip
            label={cur.style}
            sx={{
              bgcolor:
                cur.style === 'thread' ? '#66bb6a' : cur.style === 'save' ? '#ffb74d' : '#ab47bc',
              width: 'fit-content',
            }}
          />
          {cur.table && (
            <Box sx={{p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, fontFamily: 'monospace'}}>
              continuation[fd=3] → {cur.table[3]}
            </Box>
          )}
          {cur.ok && <Chip color="success" size="small" label="resume write(sd)" />}
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

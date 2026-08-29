import React, {useState} from 'react';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const LEGEND = [
  {key: 'client', label: 'Client FS', color: '#42a5f5', desc: 'POSIX API + cache + handles'},
  {key: 'server', label: 'File server', color: '#66bb6a', desc: 'Stateless request handler'},
  {key: 'proto', label: 'Protocol', color: '#ab47bc', desc: 'FH + offset + count in each msg'},
  {key: 'cache', label: 'Cache', color: '#ffb74d', desc: 'Client cache + consistency'},
  {key: 'fail', label: 'Retry', color: '#ef5350', desc: 'Idempotent replay on timeout'},
];

const SCENARIOS = {
  why: {
    label: 'Why DFS',
    subtitle: 'Clients share one namespace on a server’s disks: easy sharing, central backup/admin, locked machine room.',
    steps: [
      {
        note: 'Apps use the usual open/read/write/close — transparent access. Client-side FS + file server decide all behavior.',
        tip: 'same API, remote data',
      },
    ],
  },
  stateless: {
    label: 'Stateless',
    subtitle: 'NFSv2 goal: simple/fast server crash recovery. Server keeps no open-file or cursor state — every request is self-contained.',
    steps: [
      {
        note: 'Stateful open→fd shared with server breaks on crash: server forgets fd. Client crashes leave server opens dangling. Stateless avoids both.',
        tip: 'no distributed open state',
      },
      {
        note: 'File handle = volume ID + inode # + generation #. LOOKUP returns FH; READ/WRITE pass FH + offset + count (+ data).',
        tip: 'FH replaces server fd',
      },
      {
        note: 'Client tracks fd→FH and file offset locally. close() is local cleanup — no server message required.',
        tip: 'client holds the state',
      },
    ],
  },
  idem: {
    label: 'Idempotent',
    subtitle: 'On timeout: just retry. Lost request, down server, or lost reply — same client action. Works because most ops are idempotent.',
    steps: [
      {
        note: 'WRITE includes exact offset + data → repeating equals doing once. LOOKUP/READ trivially idempotent.',
        tip: 'retry unifies all loss cases',
      },
      {
        note: 'MKDIR etc. are imperfect (success then lost reply → retry “fails”). Voltaire’s Law: good enough for the common case.',
        tip: 'perfect ≠ required',
      },
    ],
  },
  cache: {
    label: 'Caching',
    subtitle: 'Client caches data/metadata and buffers writes. Consistency: flush-on-close + GETATTR (with attribute cache).',
    steps: [
      {
        note: 'Update visibility: C2’s buffered F[v2] invisible elsewhere until flush. Stale cache: C1 keeps F[v1] after server has F[v2].',
        tip: 'cache consistency problem',
      },
      {
        note: 'Close-to-open: close flushes dirty pages so a later open elsewhere sees updates. Before using cache: GETATTR; newer mtime → invalidate.',
        tip: 'flush-on-close + validate',
      },
      {
        note: 'Attribute cache (~3s) cuts GETATTR storms; also makes “which version?” fuzzy — engineering over crisp semantics.',
        tip: 'weird but fast',
      },
    ],
  },
  server: {
    label: 'Server writes',
    subtitle: 'NFS server must commit WRITE to stable storage before success — else crash can leave holes clients think were written.',
    steps: [
      {
        note: 'Buffered “success” then crash → client sees a,b,c succeed but disk has a, old, c. Force to disk/NVRAM first (NetApp, WAFL, …).',
        tip: 'stable before ack',
      },
      {
        note: 'VFS/vnode (Sun) let NFS plug beside local FS — lasting OS contribution beyond NFS itself.',
        tip: 'VFS lives on',
      },
    ],
  },
};

export default function NfsSimulator() {
  const [scenario, setScenario] = useState('why');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Sun NFS"
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
      {cur.tip && (
        <Chip size="small" variant="outlined" label={cur.tip} sx={{mb: 1, width: 'fit-content'}} />
      )}
      <Typography variant="body2">{cur.note}</Typography>
    </CEBlock>
  );
}

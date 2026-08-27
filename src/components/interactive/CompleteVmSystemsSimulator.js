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
  {key: 'user', label: 'User / process', color: '#42a5f5', desc: 'P0/P1 or Linux user VA'},
  {key: 'kern', label: 'Kernel', color: '#ab47bc', desc: 'Shared system / kernel mapping'},
  {key: 'inval', label: 'Invalid / guard', color: '#e0e0e0', desc: 'Null page or inaccessible'},
  {key: 'cow', label: 'COW / lazy', color: '#ffb74d', desc: 'Shared read-only until write'},
  {key: 'active', label: 'Active list', color: '#66bb6a', desc: 'Linux 2Q — re-referenced pages'},
  {key: 'inactive', label: 'Inactive list', color: '#ffb74d', desc: 'Linux 2Q — first-touch / reclaim candidates'},
];

const SCENARIOS = {
  vaxas: {
    label: 'VAX AS',
    subtitle: 'Fig 23.1 — P0 (code/heap), P1 (stack), S (kernel shared). Page 0 invalid.',
    steps: [
      {
        note: '32-bit VA, 512B pages → huge linear tables. Hybrid: top VPN bits select P0 / P1 / S.',
        regions: [
          {name: 'Page 0', kind: 'inval'},
          {name: 'Code+Heap P0', kind: 'user'},
          {name: 'Stack P1', kind: 'user'},
          {name: 'Kernel S', kind: 'kern'},
        ],
      },
      {
        note: 'Context switch: reload P0/P1 base+bounds; leave S alone → same kernel in every process.',
        regions: [
          {name: 'Page 0', kind: 'inval'},
          {name: 'P0 PT → user', kind: 'user'},
          {name: 'P1 PT → stack', kind: 'user'},
          {name: 'S unchanged', kind: 'kern'},
        ],
      },
      {
        note: 'User PTs live in kernel VA (segment S) and can be swapped under pressure — translation may walk system PT first.',
        regions: [
          {name: 'User PTE', kind: 'user'},
          {name: 'via S PT', kind: 'kern'},
          {name: 'TLB hides cost', kind: 'active'},
        ],
      },
    ],
  },
  segfifo: {
    label: 'Seg. FIFO',
    subtitle: 'Per-process RSS FIFO + global clean/dirty second-chance lists (no hardware ref bit).',
    steps: [
      {
        note: 'Each process capped by resident set size (RSS). Pages on a per-process FIFO.',
        rss: ['A', 'B', 'C'],
        clean: [],
        dirty: [],
      },
      {
        note: 'Exceed RSS → pop first-in. Clean → global clean list; dirty → dirty list (still reclaimable).',
        rss: ['B', 'C'],
        clean: ['A'],
        dirty: [],
        evict: 'A',
      },
      {
        note: 'Another process takes from clean list. If original process faults on A before reclaim → salvage (no disk).',
        rss: ['B', 'C'],
        clean: [],
        dirty: [],
        salvage: 'A',
      },
      {
        note: 'Bigger second-chance lists → closer to LRU. Clustering writes dirty batches for efficient I/O.',
        rss: ['B', 'C', 'D'],
        clean: ['E', 'F'],
        dirty: ['G', 'H', 'I'],
        cluster: true,
      },
    ],
  },
  lazy: {
    label: 'Lazy opts',
    subtitle: 'Demand zeroing and copy-on-write — put work off until (if) needed.',
    steps: [
      {
        note: 'sbrk/heap grow: map page invalid (demand-zero). No frame yet.',
        view: 'dz0',
      },
      {
        note: 'First access traps → OS allocates, zeroes, maps. Never touched → work skipped.',
        view: 'dz1',
      },
      {
        note: 'fork(): map parent pages R/O into child (COW). Shared libraries too.',
        view: 'cow0',
      },
      {
        note: 'Write trap → private copy for writer. Avoids copying then discarding via exec().',
        view: 'cow1',
      },
    ],
  },
  linux: {
    label: 'Linux',
    subtitle: 'User/kernel split, huge pages, page cache 2Q, ASLR / NX.',
    steps: [
      {
        note: '32-bit classic: user below 0xC0000000; kernel above. Kernel logical = direct map (DMA-friendly); vmalloc = kernel virtual.',
        view: 'split',
      },
      {
        note: 'Huge pages (2MB/1GB): fewer TLB entries for big working sets. Explicit then transparent huge pages.',
        view: 'huge',
      },
      {
        note: 'Page cache 2Q: first touch → inactive; re-ref → active. Reclaim from inactive — resists single large-file scans.',
        view: '2q',
        inactive: ['f1', 'f2', 'f3'],
        active: ['hot', 'lib'],
      },
      {
        note: 'NX blocks stack execution; ASLR randomizes code/stack/heap (and KASLR). Meltdown/Spectre → KPTI tradeoffs.',
        view: 'sec',
      },
    ],
  },
};

function RegionRow({regions}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {regions.map((r) => {
        const bg =
          r.kind === 'user'
            ? '#42a5f5'
            : r.kind === 'kern'
              ? '#ab47bc'
              : r.kind === 'active'
                ? '#66bb6a'
                : r.kind === 'cow'
                  ? '#ffb74d'
                  : '#e0e0e0';
        return (
          <Box
            key={r.name}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: bg,
              color: r.kind === 'inval' ? '#424242' : '#fff',
              fontWeight: 700,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {r.name}
          </Box>
        );
      })}
    </Stack>
  );
}

function ListRow({title, items, color}) {
  return (
    <Box sx={{mb: 1}}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mt: 0.5}}>
        {items.length === 0 && (
          <Typography variant="caption" color="text.disabled">
            (empty)
          </Typography>
        )}
        {items.map((p) => (
          <Chip key={`${title}-${p}`} size="small" label={p} sx={{bgcolor: color, fontFamily: 'monospace'}} />
        ))}
      </Stack>
    </Box>
  );
}

function LazyView({view}) {
  const labels = {
    dz0: 'PTE: invalid · demand-zero flag',
    dz1: 'Trap → alloc + zero + map R/W',
    cow0: 'Parent+child share R/O frame',
    cow1: 'Write → copy frame → private map',
  };
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: view.startsWith('cow') ? '#fff3e0' : '#e3f2fd',
        fontFamily: 'monospace',
        fontWeight: 600,
      }}
    >
      {labels[view]}
    </Box>
  );
}

function LinuxView({cur}) {
  if (cur.view === '2q') {
    return (
      <>
        <ListRow title="Inactive (A1)" items={cur.inactive || []} color="#ffb74d" />
        <ListRow title="Active (Aq)" items={cur.active || []} color="#66bb6a" />
      </>
    );
  }
  const text = {
    split: '0 … user … 0xC0000000 … kernel logical / kernel virtual … 0xFFFFFFFF',
    huge: '4KB default · 2MB / 1GB huge pages → TLB coverage',
    sec: 'NX bit · ASLR / KASLR · KPTI (separate kernel PT)',
  };
  return (
    <Box sx={{p: 2, borderRadius: 1, bgcolor: '#f3e5f5', fontFamily: 'monospace', fontSize: 13}}>
      {text[cur.view]}
    </Box>
  );
}

export default function CompleteVmSystemsSimulator() {
  const [scenario, setScenario] = useState('vaxas');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Complete VM systems"
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
      {scenario === 'vaxas' && <RegionRow regions={cur.regions} />}
      {scenario === 'segfifo' && (
        <>
          <ListRow title="Process RSS FIFO" items={cur.rss || []} color="#42a5f5" />
          <ListRow title="Global clean" items={cur.clean || []} color="#c8e6c9" />
          <ListRow title="Global dirty" items={cur.dirty || []} color="#ffcc80" />
          {cur.evict && <Chip size="small" label={`evict ${cur.evict}`} sx={{mr: 1}} />}
          {cur.salvage && <Chip size="small" color="success" label={`salvage ${cur.salvage}`} />}
          {cur.cluster && <Chip size="small" color="primary" label="cluster writeback" sx={{ml: 1}} />}
        </>
      )}
      {scenario === 'lazy' && <LazyView view={cur.view} />}
      {scenario === 'linux' && <LinuxView cur={cur} />}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

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
  {key: 'ram', label: 'In memory', color: '#66bb6a', desc: 'Present bit = 1; PFN valid'},
  {key: 'swap', label: 'On swap / disk', color: '#ffb74d', desc: 'Present bit = 0; disk address in PTE'},
  {key: 'free', label: 'Free frame / block', color: '#e0e0e0', desc: 'Available for paging in'},
  {key: 'fault', label: 'Page fault', color: '#ef5350', desc: 'Access with present=0 → OS handler'},
];

/** Fig 21.1 toy: 4 PFNs, 8 swap blocks */
const MEM_SWAP_STEPS = [
  {
    note: 'Four physical frames; eight swap blocks. Three processes share RAM; some pages live only on disk.',
    mem: [
      {label: 'P0 VPN0', kind: 'ram'},
      {label: 'P1 VPN2', kind: 'ram'},
      {label: 'P1 VPN3', kind: 'ram'},
      {label: 'P2 VPN0', kind: 'ram'},
    ],
    swap: [
      {label: 'P0 VPN1', kind: 'swap'},
      {label: 'P0 VPN2', kind: 'swap'},
      {label: 'free', kind: 'free'},
      {label: 'P1 VPN0', kind: 'swap'},
      {label: 'P1 VPN1', kind: 'swap'},
      {label: 'P3 VPN0', kind: 'swap'},
      {label: 'P2 VPN1', kind: 'swap'},
      {label: 'P3 VPN1', kind: 'swap'},
    ],
  },
  {
    note: 'Proc 3 is entirely swapped out — not runnable until pages return. Illusion: more virtual memory than RAM.',
    mem: [
      {label: 'P0 VPN0', kind: 'ram'},
      {label: 'P1 VPN2', kind: 'ram'},
      {label: 'P1 VPN3', kind: 'ram'},
      {label: 'P2 VPN0', kind: 'ram'},
    ],
    swap: [
      {label: 'P0 VPN1', kind: 'swap'},
      {label: 'P0 VPN2', kind: 'swap'},
      {label: 'free', kind: 'free'},
      {label: 'P1 VPN0', kind: 'swap'},
      {label: 'P1 VPN1', kind: 'swap'},
      {label: 'P3 VPN0', kind: 'swap'},
      {label: 'P2 VPN1', kind: 'swap'},
      {label: 'P3 VPN1', kind: 'swap'},
    ],
    highlight: 'P3',
  },
];

const FAULT_STEPS = [
  {
    phase: 'tlb-hit',
    note: 'TLB hit → form PA, AccessMemory. Fast path; no page table.',
  },
  {
    phase: 'tlb-miss-present',
    note: 'TLB miss, PTE valid + present=1 → insert TLB, retry → hit.',
  },
  {
    phase: 'page-fault',
    note: 'TLB miss, PTE valid but present=0 → PAGE_FAULT. OS page-fault handler runs.',
  },
  {
    phase: 'handler',
    note: 'FindFreePhysicalPage (or EvictPage) → DiskRead(diskAddr, PFN) → set present=1, PFN → RetryInstruction.',
  },
  {
    phase: 'blocked',
    note: 'While I/O runs, the faulting process is blocked; OS runs other ready work — multiprogramming hides latency.',
  },
];

const WATERMARK_STEPS = [
  {
    note: 'Do not wait until RAM is 100% full. Low watermark (LW): start reclaiming. High watermark (HW): stop.',
    free: 2,
    lw: 3,
    hw: 6,
    total: 10,
    daemon: false,
  },
  {
    note: 'Free < LW → page daemon (swap daemon) wakes, evicts until free ≥ HW, then sleeps.',
    free: 2,
    lw: 3,
    hw: 6,
    total: 10,
    daemon: true,
  },
  {
    note: 'Batch evictions enable write clustering — fewer seeks/rotations on disk [LL82].',
    free: 6,
    lw: 3,
    hw: 6,
    total: 10,
    daemon: false,
    clustered: true,
  },
];

const SCENARIOS = {
  swap: {
    label: 'Swap space',
    subtitle: 'Fig 21.1 — physical memory + swap; more virtual pages than frames.',
    steps: MEM_SWAP_STEPS,
  },
  fault: {
    label: 'Page fault',
    subtitle: 'Present bit + control flow — TLB hit, present miss, or OS page-fault path.',
    steps: FAULT_STEPS,
  },
  watermark: {
    label: 'Watermarks',
    subtitle: 'Background reclaim between LW and HW instead of waiting for “memory full”.',
    steps: WATERMARK_STEPS,
  },
};

function SlotGrid({title, items}) {
  return (
    <Box sx={{mb: 1.5}}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 0.5}}>
        {title}
      </Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {items.map((it, i) => {
          const bg =
            it.kind === 'ram' ? '#66bb6a' : it.kind === 'swap' ? '#ffb74d' : '#e0e0e0';
          return (
            <Box
              key={`${title}-${i}`}
              sx={{
                px: 1,
                py: 0.75,
                minWidth: 72,
                borderRadius: 1,
                bgcolor: bg,
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {it.label}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function FaultFlow({phase}) {
  const stages = [
    {id: 'tlb-hit', label: 'TLB hit'},
    {id: 'tlb-miss-present', label: 'Miss, present'},
    {id: 'page-fault', label: 'Page fault'},
    {id: 'handler', label: 'OS handler'},
    {id: 'blocked', label: 'Blocked + I/O'},
  ];
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {stages.map((s) => {
        const active = s.id === phase;
        const passed = stages.findIndex((x) => x.id === phase) >= stages.findIndex((x) => x.id === s.id);
        return (
          <Chip
            key={s.id}
            label={s.label}
            size="small"
            sx={{
              bgcolor: active ? '#ef5350' : passed ? '#ffcdd2' : '#eee',
              fontWeight: active ? 700 : 400,
            }}
          />
        );
      })}
    </Stack>
  );
}

function WatermarkBar({free, lw, hw, total, daemon}) {
  const pct = (n) => `${(n / total) * 100}%`;
  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          height: 28,
          bgcolor: '#eceff1',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: pct(free),
            bgcolor: '#66bb6a',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: pct(lw),
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: '#ef5350',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: pct(hw),
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: '#1976d2',
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{mt: 0.5}}>
        Free {free}/{total} · LW={lw} (red) · HW={hw} (blue)
        {daemon ? ' · page daemon running' : ''}
      </Typography>
    </Box>
  );
}

export default function BeyondPhysMechanismsSimulator() {
  const [scenario, setScenario] = useState('swap');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Beyond physical memory — mechanisms"
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
      {scenario === 'swap' && (
        <>
          <SlotGrid title="Physical memory (PFNs)" items={cur.mem} />
          <SlotGrid title="Swap space (blocks)" items={cur.swap} />
        </>
      )}
      {scenario === 'fault' && <FaultFlow phase={cur.phase} />}
      {scenario === 'watermark' && (
        <WatermarkBar
          free={cur.free}
          lw={cur.lw}
          hw={cur.hw}
          total={cur.total}
          daemon={cur.daemon}
        />
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
      {cur.clustered && (
        <Chip size="small" label="clustered writeback" sx={{mt: 1}} color="primary" variant="outlined" />
      )}
    </CEBlock>
  );
}

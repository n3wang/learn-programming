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
  {key: 'dir', label: 'Page directory', color: '#ab47bc', desc: 'PDE → page of the page table (or invalid)'},
  {key: 'pt', label: 'PT page', color: '#42a5f5', desc: 'Allocated chunk of PTEs'},
  {key: 'miss', label: 'Not allocated', color: '#e0e0e0', desc: 'Entire PT page skipped — space saved'},
  {key: 'hit', label: 'Valid PTE', color: '#66bb6a', desc: 'Mapped VPN'},
];

const SCENARIOS = {
  bigger: {
    label: 'Bigger pages',
    subtitle: '16KB pages cut a 32-bit linear table ~4× — but internal fragmentation grows.',
    steps: [
      {
        note: '4KB pages → 2^20 PTEs × 4B ≈ 4MB per process. Too big with many processes.',
        size: '4MB',
      },
      {
        note: '16KB pages → 2^18 PTEs × 4B ≈ 1MB. Smaller table, but waste inside each page.',
        size: '1MB',
        warn: 'internal fragmentation',
      },
      {
        note: 'Multiple page sizes (huge pages) mainly help TLB coverage, not table size — OS complexity rises.',
        size: 'mixed',
      },
    ],
  },
  hybrid: {
    label: 'Hybrid',
    subtitle: 'Paging + segments — one page table per segment; bounds trim unused VPNs.',
    steps: [
      {
        note: 'Sparse 16KB AS: code VPN0, heap VPN4, stack VPN14–15. Linear table mostly invalid entries.',
        waste: true,
      },
      {
        note: 'Three page tables (code/heap/stack). Base register → physical address of that segment’s PT; bounds → max valid page.',
        hybrid: true,
      },
      {
        note: 'Saves the empty middle — but still assumes segment layout; sparse heaps and external fragmentation for PTs remain.',
        limit: true,
      },
    ],
  },
  multilevel: {
    label: 'Multi-level',
    subtitle: 'Fig 20.3 — chop the linear table into pages; page directory tracks which PT pages exist.',
    steps: [
      {
        note: 'Linear table allocates frames even for invalid middle regions.',
        view: 'linear',
      },
      {
        note: 'Page directory: only first and last PT pages valid → those frames allocated; middle disappears.',
        view: 'multi',
      },
      {
        note: 'TLB miss cost: PDE fetch + PTE fetch (time–space trade-off). Every piece fits in a page → easy free-list alloc.',
        view: 'multi',
        callout: '2 memory accesses on miss',
      },
    ],
  },
  translate: {
    label: 'Translate 0x3F80',
    subtitle: '16KB AS, 64B pages — VPN 254 → PD index 15, PT index 14 → PFN 55 → PA 0x0DC0.',
    steps: [
      {
        note: 'VA 0x3F80 = 11 1111 1000 0000. Top 4 VPN bits → PD index 1111 (15).',
        phase: 'pd',
      },
      {
        note: 'PDE[15] valid → PT page at PFN 101. Next 4 bits 1110 → PT index 14.',
        phase: 'pt',
      },
      {
        note: 'PTE says PFN 55. Offset 000000 → PhysAddr = (55 << 6) | 0 = 0x0DC0.',
        phase: 'pa',
      },
    ],
  },
};

function LinearVsMulti({mode}) {
  const cells = Array.from({length: 8}, (_, i) => {
    const allocated = mode === 'linear' || i === 0 || i === 7;
    return (
      <Box
        key={i}
        sx={{
          flex: 1,
          height: 36,
          backgroundColor: allocated ? '#42a5f5' : '#e0e0e0',
          borderRadius: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          fontWeight: 700,
          color: allocated ? '#fff' : '#9e9e9e',
        }}
      >
        {allocated ? `PT${i}` : '—'}
      </Box>
    );
  });
  return (
    <Box mb={1}>
      {mode === 'multi' && (
        <Stack direction="row" spacing={0.5} mb={0.5}>
          {Array.from({length: 8}, (_, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                py: 0.5,
                textAlign: 'center',
                fontSize: 9,
                fontWeight: 700,
                backgroundColor: i === 0 || i === 7 ? '#ab47bc' : '#f3e5f5',
                color: i === 0 || i === 7 ? '#fff' : '#9e9e9e',
                borderRadius: 0.5,
              }}
            >
              {i === 0 || i === 7 ? '1' : '0'}
            </Box>
          ))}
        </Stack>
      )}
      <Stack direction="row" spacing={0.5}>
        {cells}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {mode === 'linear' ? 'linear page table pages' : 'directory above · only valid PT pages below'}
      </Typography>
    </Box>
  );
}

export default function SmallerPageTablesSimulator() {
  const [scenario, setScenario] = useState('translate');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  const switchScenario = (_, v) => {
    if (!v) return;
    setScenario(v);
    setStep(0);
  };

  return (
    <CEBlock title="Smaller Page Tables" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small" sx={{flexWrap: 'wrap'}}>
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key} sx={{textTransform: 'none'}}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="Step">
        {current.view && <LinearVsMulti mode={current.view} />}
        {current.size && (
          <Chip size="small" label={`table ≈ ${current.size}`} color="primary" sx={{mb: 1, mr: 1}} />
        )}
        {current.warn && <Chip size="small" label={current.warn} color="warning" sx={{mb: 1}} />}
        {current.phase === 'pd' && (
          <Chip size="small" label="PDIndex = 1111 (15)" sx={{backgroundColor: '#ab47bc', color: '#fff', mb: 1}} />
        )}
        {current.phase === 'pt' && (
          <Chip size="small" label="PT @ PFN 101 · PTIndex = 1110 (14)" sx={{backgroundColor: '#42a5f5', color: '#fff', mb: 1}} />
        )}
        {current.phase === 'pa' && (
          <Chip size="small" label="PFN 55 → PA 0x0DC0" sx={{backgroundColor: '#66bb6a', color: '#fff', mb: 1}} />
        )}
        {current.callout && (
          <Chip size="small" label={current.callout} variant="outlined" color="warning" sx={{mb: 1}} />
        )}
        {(current.waste || current.hybrid || current.limit) && (
          <Chip
            size="small"
            label={current.waste ? 'mostly invalid PTEs' : current.hybrid ? '3 segment PTs' : 'still not ideal'}
            variant="outlined"
            sx={{mb: 1}}
          />
        )}
        <Typography variant="body2" mt={1} color="text.secondary" lineHeight={1.55}>
          {current.note}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <ColorLegend items={LEGEND} />
        <Box mt={1}>
          <StepControls step={step} max={data.steps.length - 1} onStep={setStep} label="Step" />
        </Box>
      </CEBlock.Section>
    </CEBlock>
  );
}

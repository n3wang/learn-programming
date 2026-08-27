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
  {key: 'ok', label: 'Valid translation', color: '#66bb6a', desc: '0 <= vaddr < bounds → physical = base + vaddr'},
  {key: 'fault', label: 'Fault', color: '#ef5350', desc: 'Out of bounds — CPU traps to OS'},
  {key: 'hw', label: 'MMU', color: '#ab47bc', desc: 'Base + bounds registers per CPU'},
];

const SCENARIOS = {
  relocate: {
    label: 'Relocated process',
    subtitle: 'Fig 15.2 — 16 KB space loaded at physical 32 KB; OS uses slot 0.',
    base: 32768,
    bounds: 16384,
    steps: [
      {
        note: 'Program compiled as if at virtual 0. OS sets base = 32 KB before running.',
        action: 'setup',
        base: 32768,
        bounds: 16384,
      },
      {
        note: 'Physical RAM: OS at 0, process occupies 32–48 KB, other slots free.',
        action: 'memory',
        slots: [
          {label: 'OS', start: 0, end: 16384, color: '#ef5350'},
          {label: 'free', start: 16384, end: 32768, color: '#e0e0e0'},
          {label: 'Process', start: 32768, end: 49152, color: '#42a5f5'},
          {label: 'free', start: 49152, end: 65536, color: '#e0e0e0'},
        ],
      },
      {
        note: 'Internal fragmentation: code+stack use little of the 16 KB slot — wasted space inside the allocation.',
        action: 'fragment',
        callout: 'Fixed-size slots → internal fragmentation',
      },
    ],
  },
  example: {
    label: 'Example table',
    subtitle: '4 KB space at physical 16 KB — OSTEP translation examples.',
    base: 16384,
    bounds: 4096,
    steps: [
      {vaddr: 0, note: 'Virtual 0 → 16384 + 0 = 16 KB'},
      {vaddr: 1024, note: 'Virtual 1 KB → 17 KB'},
      {vaddr: 3000, note: 'Virtual 3000 → 19384 (stack variable x)'},
      {vaddr: 4400, note: 'Virtual 4400 ≥ bounds (4096) → fault', fault: true},
    ],
  },
  trace: {
    label: 'Instruction trace',
    subtitle: 'Fig 15.1 — movl at virt 128; load/store at virt 15 KB with base 32 KB.',
    base: 32768,
    bounds: 16384,
    steps: [
      {
        note: 'Fetch instruction at virtual PC 128 → physical 32896 (128 + 32768).',
        vaddr: 128,
        kind: 'fetch',
      },
      {
        note: 'Execute load from virtual 15 KB (15360) → physical 48128 (15360 + 32768).',
        vaddr: 15360,
        kind: 'load',
      },
      {
        note: 'Store back to virtual 15 KB — same translation on every memory access.',
        vaddr: 15360,
        kind: 'store',
      },
    ],
  },
  switch: {
    label: 'Context switch',
    subtitle: 'Fig 15.5 — one base/bounds pair per CPU; OS saves/restores in PCB.',
    base: 32768,
    bounds: 16384,
    steps: [
      {
        note: 'Process A running: hardware translates with A’s base/bounds — no OS on each access.',
        proc: 'A',
        base: 32768,
      },
      {
        note: 'Timer interrupt → OS saves A’s base/bounds in proc-struct(A).',
        proc: 'A',
        action: 'save',
      },
      {
        note: 'Restore B’s base/bounds from proc-struct(B); return-from-trap into B.',
        proc: 'B',
        base: 49152,
        action: 'restore',
      },
      {
        note: 'B issues illegal load → fault → OS terminates B and frees its slot.',
        proc: 'B',
        vaddr: 20000,
        fault: true,
      },
    ],
  },
};

function formatAddr(n) {
  if (n >= 1024 && n % 1024 === 0) {
    return `${n / 1024} KB`;
  }
  return String(n);
}

function TranslationRow({vaddr, base, bounds, fault}) {
  const outOfBounds = vaddr < 0 || vaddr >= bounds;
  const isFault = fault || outOfBounds;
  const physical = isFault ? null : base + vaddr;

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{py: 0.75}}>
      <Chip size="small" label={`virt ${formatAddr(vaddr)}`} sx={{fontFamily: 'monospace'}} />
      <Typography variant="body2">→</Typography>
      {isFault ? (
        <Chip size="small" label="FAULT" sx={{backgroundColor: '#ef5350', color: '#fff', fontWeight: 700}} />
      ) : (
        <Chip size="small" label={`phys ${formatAddr(physical)}`} sx={{backgroundColor: '#66bb6a', color: '#fff', fontWeight: 700}} />
      )}
    </Stack>
  );
}

function MemorySlots({slots}) {
  const max = 65536;
  return (
    <Box sx={{position: 'relative', height: 32, backgroundColor: '#fafafa', borderRadius: 1, border: '1px solid #ccc'}}>
      {slots.map((s) => (
        <Box
          key={s.label}
          sx={{
            position: 'absolute',
            left: `${(s.start / max) * 100}%`,
            width: `${((s.end - s.start) / max) * 100}%`,
            top: 4,
            bottom: 4,
            backgroundColor: s.color,
            borderRadius: 0.5,
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: s.color === '#e0e0e0' ? '#757575' : '#fff',
          }}
        >
          {s.label}
        </Box>
      ))}
    </Box>
  );
}

export default function AddressTranslationSimulator() {
  const [scenario, setScenario] = useState('example');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  const switchScenario = (_, v) => {
    if (!v) {
      return;
    }
    setScenario(v);
    setStep(0);
  };

  const base = data.base ?? current.base ?? 0;
  const bounds = data.bounds ?? current.bounds ?? 4096;

  return (
    <CEBlock title="Base and Bounds Translation" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small" sx={{flexWrap: 'wrap'}}>
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key} sx={{textTransform: 'none'}}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" variant="outlined" label={`base = ${formatAddr(base)}`} />
          <Chip size="small" variant="outlined" label={`bounds = ${formatAddr(bounds)}`} />
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Step">
        {scenario === 'relocate' && current.slots && <MemorySlots slots={current.slots} />}
        {scenario === 'example' && (
          <TranslationRow vaddr={current.vaddr} base={base} bounds={bounds} fault={current.fault} />
        )}
        {scenario === 'trace' && current.vaddr != null && (
          <TranslationRow vaddr={current.vaddr} base={base} bounds={bounds} />
        )}
        {scenario === 'switch' && current.vaddr != null && (
          <TranslationRow vaddr={current.vaddr} base={current.base ?? base} bounds={bounds} fault={current.fault} />
        )}
        {scenario === 'switch' && current.proc && !current.vaddr && (
          <Chip label={`Process ${current.proc}${current.action ? `: ${current.action}` : ''}`} color="primary" size="small" />
        )}
        {current.callout && (
          <Chip size="small" label={current.callout} sx={{mt: 1}} color="warning" variant="outlined" />
        )}
        <Typography variant="body2" mt={1.5} color="text.secondary" lineHeight={1.55}>
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

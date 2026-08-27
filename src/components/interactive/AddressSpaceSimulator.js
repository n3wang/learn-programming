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

const COLORS = {
  os: '#ef5350',
  procA: '#42a5f5',
  procB: '#66bb6a',
  procC: '#ffb74d',
  free: '#e0e0e0',
  code: '#546e7a',
  heap: '#ab47bc',
  stack: '#26a69a',
};

const LEGEND = [
  {key: 'os', label: 'OS', color: COLORS.os, desc: 'Kernel code and data in physical memory'},
  {key: 'proc', label: 'Process', color: COLORS.procA, desc: 'A process loaded at some physical offset'},
  {key: 'free', label: 'Free', color: COLORS.free, desc: 'Unused physical RAM'},
  {key: 'virt', label: 'Virtual layout', color: COLORS.code, desc: 'What the program sees — code / heap / stack'},
];

const SCENARIOS = {
  early: {
    label: 'Early days',
    subtitle: 'Fig 13.1 — OS at physical 0; one program uses the rest. Few illusions.',
    maxKb: 256,
    steps: [
      {
        note: 'Physical memory: OS routines live at the bottom (e.g. 0 KB). One running program starts at 64 KB.',
        regions: [
          {label: 'OS (code, data)', color: COLORS.os, startKb: 0, endKb: 64},
          {label: 'Current program', color: COLORS.procA, startKb: 64, endKb: 256},
        ],
      },
      {
        note: 'No virtual address space — the program knows where it really lives in physical RAM.',
        regions: [
          {label: 'OS (code, data)', color: COLORS.os, startKb: 0, endKb: 64},
          {label: 'Current program', color: COLORS.procA, startKb: 64, endKb: 256},
        ],
        callout: 'User expects little; life was easy for OS writers.',
      },
    ],
  },
  multi: {
    label: 'Multiprogramming',
    subtitle: 'Fig 13.2 — A, B, C share 512 KB physical memory; OS switches without swapping all RAM to disk.',
    maxKb: 512,
    steps: [
      {
        note: '512 KB physical memory carved among three processes plus OS. CPU runs A; B and C are Ready.',
        regions: [
          {label: 'OS', color: COLORS.os, startKb: 0, endKb: 64},
          {label: 'A', color: COLORS.procA, startKb: 64, endKb: 128},
          {label: 'free', color: COLORS.free, startKb: 128, endKb: 192},
          {label: 'B', color: COLORS.procB, startKb: 192, endKb: 256},
          {label: 'free', color: COLORS.free, startKb: 256, endKb: 320},
          {label: 'C', color: COLORS.procC, startKb: 320, endKb: 384},
          {label: 'free', color: COLORS.free, startKb: 384, endKb: 512},
        ],
      },
      {
        note: 'Each process loaded at a different physical address — but each still wants to use addresses starting near 0 in its own view.',
        regions: [
          {label: 'OS', color: COLORS.os, startKb: 0, endKb: 64},
          {label: 'A @ 64K', color: COLORS.procA, startKb: 64, endKb: 128},
          {label: 'free', color: COLORS.free, startKb: 128, endKb: 192},
          {label: 'B @ 192K', color: COLORS.procB, startKb: 192, endKb: 256},
          {label: 'free', color: COLORS.free, startKb: 256, endKb: 320},
          {label: 'C @ 320K', color: COLORS.procC, startKb: 320, endKb: 384},
          {label: 'free', color: COLORS.free, startKb: 384, endKb: 512},
        ],
        callout: 'Protection needed — A must not read/write B’s physical bytes.',
      },
      {
        note: 'Crux: Process A loads from virtual address 0 must hit physical ~320 KB (where C lives in this figure) — translation required.',
        regions: [
          {label: 'OS', color: COLORS.os, startKb: 0, endKb: 64},
          {label: 'A phys', color: COLORS.procA, startKb: 64, endKb: 128},
          {label: 'free', color: COLORS.free, startKb: 128, endKb: 192},
          {label: 'B phys', color: COLORS.procB, startKb: 192, endKb: 256},
          {label: 'free', color: COLORS.free, startKb: 256, endKb: 320},
          {label: 'C phys', color: COLORS.procC, startKb: 320, endKb: 384},
          {label: 'free', color: COLORS.free, startKb: 384, endKb: 512},
        ],
        callout: 'virtual 0 (A) → physical 64 KB · OS + hardware translate every access',
      },
    ],
  },
  layout: {
    label: 'Address space',
    subtitle: 'Fig 13.3 — 16 KB virtual layout: code, heap (grows), stack (grows). Convention, not law.',
    maxKb: 16,
    virtual: true,
    steps: [
      {
        note: 'Program code is static at the low end (here 0–1 KB).',
        regions: [
          {label: 'code', color: COLORS.code, startKb: 0, endKb: 1},
          {label: 'heap →', color: COLORS.heap, startKb: 1, endKb: 8},
          {label: '(free)', color: COLORS.free, startKb: 8, endKb: 14},
          {label: '← stack', color: COLORS.stack, startKb: 14, endKb: 16},
        ],
      },
      {
        note: 'malloc() grows the heap; calls grow the stack — opposite directions meet in the middle.',
        regions: [
          {label: 'code', color: COLORS.code, startKb: 0, endKb: 1},
          {label: 'heap (grown)', color: COLORS.heap, startKb: 1, endKb: 10},
          {label: '(free)', color: COLORS.free, startKb: 10, endKb: 12},
          {label: 'stack (grown)', color: COLORS.stack, startKb: 12, endKb: 16},
        ],
        callout: 'This is the abstraction — not necessarily contiguous physical frames.',
      },
      {
        note: 'Every pointer you print in user code (code, heap, stack) is a virtual address.',
        regions: [
          {label: 'code', color: COLORS.code, startKb: 0, endKb: 1},
          {label: 'heap', color: COLORS.heap, startKb: 1, endKb: 10},
          {label: '(free)', color: COLORS.free, startKb: 10, endKb: 12},
          {label: 'stack', color: COLORS.stack, startKb: 12, endKb: 16},
        ],
        callout: 'Only the OS + MMU know the physical locations.',
      },
    ],
  },
  translate: {
    label: 'Virtual → physical',
    subtitle: 'Process A thinks it owns address 0; hardware maps to its load address in RAM.',
    maxKb: 128,
    steps: [
      {
        note: 'Process A’s virtual address space: load at virtual 0 feels like “the beginning of memory”.',
        regions: [
          {label: 'virt 0: code', color: COLORS.code, startKb: 0, endKb: 32},
          {label: 'virt: heap/stack…', color: COLORS.heap, startKb: 32, endKb: 128},
        ],
        virtual: true,
      },
      {
        note: 'Physical RAM: A is actually loaded starting at 64 KB (example).',
        regions: [
          {label: 'OS', color: COLORS.os, startKb: 0, endKb: 64},
          {label: 'A @ 64K', color: COLORS.procA, startKb: 64, endKb: 128},
        ],
      },
      {
        note: 'Load from virtual address 0 → physical address 64 KB. Transparency: the program never sees the difference.',
        regions: [
          {label: 'OS', color: COLORS.os, startKb: 0, endKb: 64},
          {label: 'A @ 64K (= virt 0)', color: COLORS.procA, startKb: 64, endKb: 128},
        ],
        callout: 'virtual 0 + base 64K → physical 64K',
      },
    ],
  },
};

function MemoryBar({regions, maxKb, virtual}) {
  return (
    <Box>
      {virtual && (
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Virtual view
        </Typography>
      )}
      <Box
        sx={{
          position: 'relative',
          height: 36,
          backgroundColor: '#fafafa',
          borderRadius: 1,
          border: '1px solid #ccc',
          overflow: 'hidden',
        }}
      >
        {regions.map((r) => (
          <Box
            key={`${r.label}-${r.startKb}`}
            sx={{
              position: 'absolute',
              left: `${(r.startKb / maxKb) * 100}%`,
              width: `${((r.endKb - r.startKb) / maxKb) * 100}%`,
              top: 4,
              bottom: 4,
              backgroundColor: r.color,
              borderRadius: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 700,
              color: r.color === COLORS.free ? '#757575' : '#fff',
              overflow: 'hidden',
              px: 0.25,
            }}
          >
            {r.label}
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: 'block'}}>
        0 KB — {maxKb} KB
      </Typography>
    </Box>
  );
}

export default function AddressSpaceSimulator() {
  const [scenario, setScenario] = useState('layout');
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

  return (
    <CEBlock title="Address Spaces" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small" sx={{flexWrap: 'wrap'}}>
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key} sx={{textTransform: 'none'}}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="Memory layout">
        <MemoryBar regions={current.regions} maxKb={data.maxKb} virtual={data.virtual || current.virtual} />
        {current.callout && (
          <Chip size="small" label={current.callout} sx={{mt: 1}} color="primary" variant="outlined" />
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

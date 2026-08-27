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

const PAGE_COLORS = {
  0: '#42a5f5',
  1: '#66bb6a',
  2: '#ffb74d',
  3: '#ab47bc',
  os: '#ef5350',
  free: '#e0e0e0',
};

const LEGEND = [
  {key: 'vpn', label: 'VPN', color: '#42a5f5', desc: 'Virtual page number — index into page table'},
  {key: 'pfn', label: 'PFN', color: '#66bb6a', desc: 'Physical frame number'},
  {key: 'off', label: 'Offset', color: '#ffb74d', desc: 'Byte within the page — not translated'},
  {key: 'pte', label: 'PTE fetch', color: '#ab47bc', desc: 'Extra memory access to the page table'},
];

/** Tiny example: 64B AS, 16B pages, 128B phys. VP0→3, VP1→7, VP2→5, VP3→2 */
const PAGE_TABLE = {0: 3, 1: 7, 2: 5, 3: 2};

const SCENARIOS = {
  layout: {
    label: 'Layout',
    subtitle: 'Figs 18.1–18.2 — 64-byte AS (4×16B pages) placed in 128-byte physical memory.',
    steps: [
      {
        note: 'Virtual address space: pages 0–3, each 16 bytes. No assumptions about heap/stack growth.',
        view: 'virtual',
      },
      {
        note: 'Physical frames: OS in frame 0; VP0→PF3, VP1→PF7, VP2→PF5, VP3→PF2. Frames 1,4,6 free.',
        view: 'physical',
      },
      {
        note: 'Free-space management is easy: grab four free frames from a free list — no external fragmentation.',
        view: 'physical',
        callout: 'Fixed-size slots → simple free list',
      },
    ],
  },
  translate: {
    label: 'Translate VA 21',
    subtitle: 'Fig 18.3 — virtual 21 → VPN 1, offset 5 → PFN 7 → physical 117.',
    steps: [
      {
        note: 'Virtual address 21 = binary 010101. Need 6 bits for a 64-byte space.',
        va: 21,
        phase: 'split',
      },
      {
        note: 'Page size 16 → 4 offset bits, 2 VPN bits. VPN=01 (1), offset=0101 (5).',
        va: 21,
        phase: 'vpn',
      },
      {
        note: 'Page table[1] = PFN 7 (111). Replace VPN with PFN; offset unchanged → physical 1110101 = 117.',
        va: 21,
        phase: 'phys',
      },
    ],
  },
  pte: {
    label: 'PTE bits',
    subtitle: 'Linear page table entries: valid, protect, present, dirty, referenced, PFN.',
    steps: [
      {
        note: 'Valid bit: unused sparse regions marked invalid — no physical frame allocated.',
        bit: 'valid',
      },
      {
        note: 'Protection bits: read / write / execute. Illegal access → trap (protection fault).',
        bit: 'protect',
      },
      {
        note: 'Present / dirty / referenced: for swapping and replacement (later chapters).',
        bit: 'extra',
      },
    ],
  },
  cost: {
    label: 'Extra access',
    subtitle: 'Fig 18.6 — every memory reference needs a PTE fetch first → ~2× memory traffic.',
    steps: [
      {
        note: 'movl 21, %eax — before loading data, hardware must fetch PTE for VPN 1.',
        accesses: ['PTE fetch @ page-table[1]', 'data load @ phys 117'],
      },
      {
        note: 'PTEAddr = PTBR + VPN × sizeof(PTE). Then PhysAddr = (PFN << SHIFT) | offset.',
        accesses: ['index page table', 'translate', 'AccessMemory(PhysAddr)'],
      },
      {
        note: 'Instruction fetches also translate — every reference pays an extra memory access. Too slow without help (TLB next).',
        accesses: ['fetch + PTE', 'load + PTE', 'store + PTE'],
        callout: 'Two problems: size + speed',
      },
    ],
  },
};

function VirtualBar() {
  return (
    <Stack direction="row" spacing={0.5}>
      {[0, 1, 2, 3].map((p) => (
        <Box
          key={p}
          sx={{
            flex: 1,
            py: 1.5,
            textAlign: 'center',
            backgroundColor: PAGE_COLORS[p],
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            borderRadius: 1,
          }}
        >
          VP {p}
        </Box>
      ))}
    </Stack>
  );
}

function PhysicalBar() {
  const frames = [
    {label: 'OS', color: PAGE_COLORS.os},
    {label: 'free', color: PAGE_COLORS.free},
    {label: 'VP3', color: PAGE_COLORS[3]},
    {label: 'VP0', color: PAGE_COLORS[0]},
    {label: 'free', color: PAGE_COLORS.free},
    {label: 'VP2', color: PAGE_COLORS[2]},
    {label: 'free', color: PAGE_COLORS.free},
    {label: 'VP1', color: PAGE_COLORS[1]},
  ];
  return (
    <Box>
      <Stack direction="row" spacing={0.25}>
        {frames.map((f, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              py: 1.2,
              textAlign: 'center',
              backgroundColor: f.color,
              color: f.color === PAGE_COLORS.free ? '#757575' : '#fff',
              fontWeight: 700,
              fontSize: 10,
              borderRadius: 0.5,
            }}
          >
            {f.label}
          </Box>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        frames 0 — 7 (128 bytes)
      </Typography>
    </Box>
  );
}

function TranslatePanel({va, phase}) {
  const vpn = (va >> 4) & 0x3;
  const offset = va & 0xf;
  const pfn = PAGE_TABLE[vpn];
  const phys = (pfn << 4) | offset;

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip size="small" label={`VA ${va} = ${va.toString(2).padStart(6, '0')}`} sx={{fontFamily: 'monospace'}} />
        {(phase === 'vpn' || phase === 'phys') && (
          <>
            <Chip size="small" label={`VPN ${vpn}`} sx={{backgroundColor: '#42a5f5', color: '#fff'}} />
            <Chip size="small" label={`offset ${offset}`} sx={{backgroundColor: '#ffb74d', color: '#fff'}} />
          </>
        )}
        {phase === 'phys' && (
          <>
            <Chip size="small" label={`PFN ${pfn}`} sx={{backgroundColor: '#66bb6a', color: '#fff'}} />
            <Chip size="small" label={`PA ${phys}`} sx={{backgroundColor: '#66bb6a', color: '#fff', fontWeight: 700}} />
          </>
        )}
      </Stack>
      {phase === 'phys' && (
        <Typography variant="caption" fontFamily="monospace">
          page table: [{Object.entries(PAGE_TABLE).map(([v, p]) => `${v}→${p}`).join(', ')}]
        </Typography>
      )}
    </Stack>
  );
}

export default function PagingIntroSimulator() {
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
    <CEBlock title="Paging Introduction" subtitle={data.subtitle}>
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
        {current.view === 'virtual' && <VirtualBar />}
        {current.view === 'physical' && <PhysicalBar />}
        {current.va != null && <TranslatePanel va={current.va} phase={current.phase} />}
        {current.bit && (
          <Chip
            size="small"
            label={
              current.bit === 'valid'
                ? 'valid'
                : current.bit === 'protect'
                  ? 'R/W/X protect'
                  : 'present · dirty · referenced'
            }
            color="primary"
            sx={{mb: 1}}
          />
        )}
        {current.accesses && (
          <Stack spacing={0.5} mb={1}>
            {current.accesses.map((a) => (
              <Chip key={a} size="small" label={a} sx={{backgroundColor: '#ab47bc22'}} />
            ))}
          </Stack>
        )}
        {current.callout && (
          <Chip size="small" label={current.callout} color="warning" variant="outlined" sx={{mb: 1}} />
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

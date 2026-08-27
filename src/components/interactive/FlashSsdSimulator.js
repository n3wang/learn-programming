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
  {key: 'erased', label: 'Erased (E)', color: '#90caf9', desc: 'Programmable pages'},
  {key: 'valid', label: 'Valid (V)', color: '#66bb6a', desc: 'Programmed live data'},
  {key: 'dead', label: 'Garbage', color: '#ef5350', desc: 'Old version after overwrite'},
  {key: 'ftl', label: 'FTL map', color: '#ab47bc', desc: 'Logical → physical'},
  {key: 'wear', label: 'Wear / GC', color: '#ffb74d', desc: 'Leveling & reclaim'},
];

const SCENARIOS = {
  raw: {
    label: 'Raw flash',
    subtitle: 'Banks → erase blocks (128–256 KB) → pages (few KB). Read a page; write = erase block then program pages.',
    steps: [
      {
        note: 'SLC/MLC/TLC pack 1–3 bits/cell. Reads ~10s μs (random-access). Program ~100s μs; erase ~ms — and wipe the whole block.',
        tip: 'page ≠ disk block',
      },
      {
        note: 'States: INVALID → erase → ERASED → program → VALID. Re-program requires erase of the entire block first.',
        states: ['i', 'E', 'V'],
        tip: 'cannot overwrite in place',
      },
      {
        note: 'Wear out: ~10k P/E (MLC) / ~100k (SLC). Also read/program disturb on neighbors.',
        tip: 'reliability focus',
      },
    ],
  },
  direct: {
    label: 'Bad FTL',
    subtitle: 'Direct map logical N → physical N: each write reads block, erases, reprograms → huge write amp + hot-spot wear.',
    steps: [
      {
        note: 'Write amplification ≈ pages/block. Client workload controls which flash blocks die first.',
        tip: 'never ship this',
      },
    ],
  },
  log: {
    label: 'Log FTL',
    subtitle: 'Append writes to next free page; keep LBA→physical map. Erases rare; wear spreads. Like a tiny LFS inside the drive.',
    steps: [
      {
        note: 'Write(100)=a1 → erase block 0, program page 0, map 100→0. Then 101,2000,2001 fill the block.',
        map: ['100→0', '101→1', '2000→2', '2001→3'],
        pages: ['a1', 'a2', 'b1', 'b2'],
      },
      {
        note: 'Overwrite 100,101 → append to next block; old pages become garbage. GC: copy live pages, erase dead block.',
        tip: 'write amplification from GC',
      },
      {
        note: 'TRIM tells the FTL LBAs are dead → drop map entries, reclaim sooner. Persist maps via OOB scan or logging/checkpoints.',
        tip: 'TRIM + map persistence',
      },
    ],
  },
  map: {
    label: 'Maps',
    subtitle: 'Page maps need too much DRAM. Block maps save memory but small writes copy whole blocks. Hybrid: page-map log blocks + block-map data.',
    steps: [
      {
        note: '1 TB @ 4 KB pages ≈ 1 GB of 4-byte entries — too big for device SRAM.',
        tip: 'page-level cost',
      },
      {
        note: 'Hybrid merges: switch (best), partial (copy siblings), full (expensive — avoid). Or cache hot page-map entries (DFTL).',
        tip: 'switch / partial / full',
      },
    ],
  },
  wear: {
    label: 'Wear & cost',
    subtitle: 'Wear leveling relocates cold long-lived data so every block gets P/E share. SSDs win on random I/O; HDDs still win $/GB.',
    steps: [
      {
        note: 'Log + GC help; still migrate cold blocks periodically → extra write amp for fairness.',
        tip: 'wear leveling',
      },
      {
        note: 'Random IOPS: SSD ≫ HDD. Sequential gap smaller. Log FTL makes random writes look sequential internally.',
        tip: 'hybrid tiers common',
      },
    ],
  },
};

export default function FlashSsdSimulator() {
  const [scenario, setScenario] = useState('raw');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Flash-based SSDs"
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
      {cur.states && (
        <Stack direction="row" spacing={0.5} sx={{mb: 1}}>
          {cur.states.map((s) => (
            <Chip
              key={s}
              size="small"
              label={s}
              sx={{
                fontFamily: 'monospace',
                bgcolor: s === 'V' ? '#66bb6a' : s === 'E' ? '#90caf9' : '#bdbdbd',
                color: '#fff',
              }}
            />
          ))}
        </Stack>
      )}
      {cur.pages && (
        <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1}}>
          {cur.pages.map((p) => (
            <Chip key={p} size="small" label={p} color="success" sx={{fontFamily: 'monospace'}} />
          ))}
        </Box>
      )}
      {cur.map && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{mb: 1}}>
          {cur.map.map((m) => (
            <Chip key={m} size="small" label={m} sx={{bgcolor: '#ab47bc', color: '#fff', fontFamily: 'monospace'}} />
          ))}
        </Stack>
      )}
      {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} sx={{mb: 1, width: 'fit-content'}} />}
      <Typography variant="body2">{cur.note}</Typography>
    </CEBlock>
  );
}

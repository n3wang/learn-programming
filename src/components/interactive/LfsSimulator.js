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
  {key: 'seg', label: 'Segment', color: '#42a5f5', desc: 'Buffered sequential write'},
  {key: 'live', label: 'Live', color: '#66bb6a', desc: 'Current version'},
  {key: 'garbage', label: 'Garbage', color: '#ef5350', desc: 'Old version to clean'},
  {key: 'imap', label: 'imap / CR', color: '#ab47bc', desc: 'Indirection + fixed root'},
  {key: 'clean', label: 'Cleaning', color: '#ffb74d', desc: 'Compact live → free segments'},
];

const SCENARIOS = {
  why: {
    label: 'Why LFS',
    subtitle: 'Caches absorb reads → disk is write-dominated. Sequential >> random; FFS still does many small metadata writes.',
    steps: [
      {
        note: 'Create one-block file in FFS: inode, ibitmap, dir data, dir inode, data, dbitmap — short seeks even in one group.',
        tip: 'not peak bandwidth',
      },
      {
        note: 'RAID-4/5 small-write problem: one logical block → ~4 physical I/Os. Ideal FS: all writes sequential + RAID-friendly.',
        tip: 'crux: sequentialize writes',
      },
    ],
  },
  write: {
    label: 'Write path',
    subtitle: 'Buffer updates in a segment; flush one large sequential transfer to free space. Never overwrite in place (COW).',
    steps: [
      {
        note: 'Address order alone isn’t enough — wait δ and the platter rotates. Need large contiguous writes (segments of a few MB).',
        blocks: ['D', 'I', 'imap'],
        tip: 'write buffering',
      },
      {
        note: 'Example: four blocks for file j + one for k + both inodes → one segment write. Amortize Tposition: D ≈ F·R·T/(1−F).',
        blocks: ['Dj0', 'Dj1', 'Dj2', 'Dj3', 'I[j]', 'Dk', 'I[k]'],
        tip: 'e.g. ~9 MB for 90% of 100 MB/s @ 10 ms',
      },
    ],
  },
  find: {
    label: 'Finding',
    subtitle: 'Inodes move with every write → imap maps inode# → latest disk addr; CR at a fixed place points at imap pieces.',
    steps: [
      {
        note: 'FFS: fixed inode array (or per-group chunks). LFS: scatter + never overwrite → need indirection.',
        tip: 'inode map',
      },
      {
        note: 'Write data + inode + imap chunk together. CR updated periodically (~30s) so seeks to a fixed imap don’t kill write path.',
        layout: ['CR', '…', 'D', 'I[k]', 'imap'],
        tip: 'CR → imap → inode → data',
      },
      {
        note: 'Directories still store (name, inum). imap absorbs inode moves → no recursive update up the tree.',
        tip: 'avoids recursive update',
      },
    ],
  },
  clean: {
    label: 'Cleaning',
    subtitle: 'Old versions are garbage. Clean segment-by-segment: read M, compact live into N < M, free the old.',
    steps: [
      {
        note: 'Overwrite: old D+I become garbage. Append: old I garbage, old data still live.',
        live: ['D0′', 'I′'],
        garbage: ['D0', 'I'],
      },
      {
        note: 'Segment summary (inum, offset) + imap: live iff inode[T] still points here. Version# short-circuits deletes.',
        tip: 'liveness check',
      },
      {
        note: 'Policy: clean cold sooner, hot later (more blocks die). Cleaning cost limited early LFS adoption; WAFL/ZFS/btrfs inherit COW.',
        tip: 'hot vs cold',
      },
    ],
  },
  crash: {
    label: 'Crash',
    subtitle: 'Two CRs with timestamped header/body/trailer; roll forward from last good CR along the log.',
    steps: [
      {
        note: 'Alternate CR updates; inconsistent timestamps → discard partial CR. Prefer newest consistent CR.',
        tip: 'atomic CR',
      },
      {
        note: 'Periodic CR alone loses ~30s. Roll forward: from log end in CR, scan later segments for valid updates.',
        tip: 'roll forward',
      },
    ],
  },
};

export default function LfsSimulator() {
  const [scenario, setScenario] = useState('why');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Log-structured FS"
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
      {cur.blocks && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{mb: 1}}>
          {cur.blocks.map((b) => (
            <Chip key={b} size="small" label={b} sx={{bgcolor: '#42a5f5', color: '#fff', fontFamily: 'monospace'}} />
          ))}
        </Stack>
      )}
      {cur.layout && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            mb: 1,
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          {cur.layout.map((x) => (
            <Chip
              key={x}
              size="small"
              label={x}
              sx={{
                bgcolor: x === 'CR' || x === 'imap' ? '#ab47bc' : x === '…' ? 'transparent' : '#66bb6a',
                color: x === '…' ? 'text.secondary' : '#fff',
                fontFamily: 'monospace',
              }}
            />
          ))}
        </Box>
      )}
      {(cur.live || cur.garbage) && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{mb: 1}}>
          {(cur.live || []).map((x) => (
            <Chip key={`l-${x}`} size="small" label={x} color="success" sx={{fontFamily: 'monospace'}} />
          ))}
          {(cur.garbage || []).map((x) => (
            <Chip key={`g-${x}`} size="small" label={x} color="error" sx={{fontFamily: 'monospace'}} />
          ))}
        </Stack>
      )}
      {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} sx={{mb: 1, width: 'fit-content'}} />}
      <Typography variant="body2">{cur.note}</Typography>
    </CEBlock>
  );
}

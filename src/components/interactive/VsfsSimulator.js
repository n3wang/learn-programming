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
  {key: 'S', label: 'Superblock', color: '#ffb74d', desc: 'FS params / magic'},
  {key: 'bmap', label: 'Bitmaps', color: '#ab47bc', desc: 'inode + data free maps'},
  {key: 'I', label: 'Inode table', color: '#66bb6a', desc: 'Per-file metadata'},
  {key: 'D', label: 'Data region', color: '#42a5f5', desc: 'File/dir contents'},
  {key: 'io', label: 'Disk I/O', color: '#ef5350', desc: 'Read/write during access path'},
];

const LAYOUT = ['S', 'i', 'd', 'I', 'I', 'I', 'I', 'I', 'D', 'D', 'D', '…'];

const SCENARIOS = {
  layout: {
    label: 'On-disk',
    subtitle: 'vsfs: superblock, inode/data bitmaps, inode table, data region (4 KB blocks).',
    steps: [
      {
        note: 'Partition = N blocks. Most space is data; inodes hold size, times, mode, block pointers.',
        focus: 'all',
      },
      {
        note: 'Bitmaps: bit 0=free, 1=in-use. Superblock: counts, starts, magic — read first on mount.',
        focus: 'meta',
        tip: 'i-number → inode address',
      },
    ],
  },
  inode: {
    label: 'Inode',
    subtitle: 'Multi-level index: direct + indirect (+ double/triple). Most files are small → optimize directs.',
    steps: [
      {
        note: '12 directs → 48 KB with 4 KB blocks. One indirect (+1024 ptrs) → ~4 MB more.',
        ptrs: '12 direct',
      },
      {
        note: 'Double/triple indirect → multi-GB+. Extents (ptr+len) are a compact alternative when space is contiguous.',
        tip: 'imbalanced tree',
      },
      {
        note: 'Directories = special files: list of (inum, name, …) plus . and .. . Linked list / FAT is another allocation style.',
        tip: 'dir as file',
      },
    ],
  },
  paths: {
    label: 'Access',
    subtitle: 'open walks path (root inode #2). Reads use inode pointers — not bitmaps. Creates allocate heavily.',
    steps: [
      {
        note: 'open(/foo/bar): read root inode→data, find foo; foo inode→data, find bar; load bar inode; return fd.',
        op: 'open',
        ios: 'many reads',
      },
      {
        note: 'read(): inode → data block; update atime (write). Bitmaps untouched for pure reads.',
        op: 'read',
        tip: 'no bitmap on read',
      },
      {
        note: 'Allocating write ≈ 5 I/Os: data bitmap R/W, inode R/W, data W. create() even more (inode bitmap, dir data, …).',
        op: 'write/create',
        bad: true,
      },
    ],
  },
  cache: {
    label: 'Cache',
    subtitle: 'Page cache absorbs path walks; write buffering batches/schedules/avoids I/O — durability trade-off.',
    steps: [
      {
        note: 'Second open of same path often hits cache → near-zero I/O. Unified page cache shares DRAM with VM.',
        tip: 'dynamic partition',
      },
      {
        note: 'Writes still need disk for durability; delay 5–30s for batching. Crash → lose buffered updates. Use fsync when needed.',
        tip: 'durability vs speed',
      },
    ],
  },
};

export default function VsfsSimulator() {
  const [scenario, setScenario] = useState('layout');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="vsfs — file system implementation"
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
      {scenario === 'layout' && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {LAYOUT.map((c, i) => (
            <Chip
              key={`${c}-${i}`}
              size="small"
              label={c}
              sx={{
                bgcolor:
                  c === 'S'
                    ? '#ffe0b2'
                    : c === 'i' || c === 'd'
                      ? '#e1bee7'
                      : c === 'I'
                        ? '#c8e6c9'
                        : '#bbdefb',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            />
          ))}
        </Stack>
      )}
      {scenario === 'inode' && (
        <Stack spacing={1}>
          {cur.ptrs && (
            <Chip label={cur.ptrs} sx={{bgcolor: '#c8e6c9', width: 'fit-content'}} />
          )}
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'paths' && (
        <Stack spacing={1}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: cur.bad ? '#ffcdd2' : '#e3f2fd',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            {cur.op}
            {cur.ios ? ` · ${cur.ios}` : ''}
          </Box>
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
          {cur.bad && <Chip color="error" size="small" label="allocation amplifies I/O" />}
        </Stack>
      )}
      {scenario === 'cache' && cur.tip && (
        <Chip size="small" color="primary" label={cur.tip} sx={{width: 'fit-content'}} />
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

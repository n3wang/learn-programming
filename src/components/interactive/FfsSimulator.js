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
  {key: 'frag', label: 'Fragmented', color: '#ef5350', desc: 'Old FS free-list scatter'},
  {key: 'group', label: 'Block/cylinder group', color: '#42a5f5', desc: 'Locality container'},
  {key: 'rel', label: 'Related files', color: '#66bb6a', desc: 'Same directory → same group'},
  {key: 'large', label: 'Large-file chunk', color: '#ab47bc', desc: 'Spill to other groups'},
  {key: 'amort', label: 'Amortization', color: '#ffb74d', desc: 'Big transfer between seeks'},
];

const SCENARIOS = {
  problem: {
    label: 'Old FS',
    subtitle: 'Old UNIX FS: simple, but ~2% of disk bandwidth — random layout + tiny blocks [MJLF84].',
    steps: [
      {
        note: 'Inode far from data → seek on every open+read. Free list fragments: contiguous file becomes hopscotch.',
        layout: ['A1', 'A2', '·', '·', 'C1', 'C2', 'E1', 'E2', '·', '·', 'E3', 'E4'],
        bad: true,
      },
      {
        note: '512 B blocks: low internal waste, high positioning overhead per transfer.',
        tip: 'disk unaware',
      },
    ],
  },
  groups: {
    label: 'Groups',
    subtitle: 'FFS cylinder/block groups: each has S, ib, db, inodes, data — keep related stuff together.',
    steps: [
      {
        note: 'Modern disks hide geometry → consecutive LBA ranges as block groups (ext*). Replica superblocks for reliability.',
        groups: ['G0: S ib db I… D…', 'G1: …', 'G2: …'],
      },
      {
        note: 'Dirs → group with few dirs + many free inodes. Files → same group as dir; data near inode.',
        tip: 'namespace locality',
      },
      {
        note: '/a/c,/a/d,/a/e cluster in one group; /b/f elsewhere. Spreading inodes alone loses name locality.',
        ok: true,
      },
    ],
  },
  large: {
    label: 'Large files',
    subtitle: 'Don’t fill a group: after directs (or chunk L), spill chunks to other groups; amortize seeks.',
    steps: [
      {
        note: 'Without exception, one huge file monopolizes a group → related files can’t colocate.',
        bad: true,
      },
      {
        note: 'With chunking: first directs local; each indirect tree (≈4 MB @ 4K/32-bit) in another group.',
        tip: 'amortize seek',
      },
      {
        note: '10 ms seek + 40 MB/s → ~410 KB for 50% bandwidth; ~3.7 MB for 90%. Mechanicals lag transfer rates.',
        tip: 'chunk sizing',
      },
    ],
  },
  extras: {
    label: 'Extras',
    subtitle: 'Sub-blocks, parameterized skew, long names, symlinks, atomic rename — usable + fast.',
    steps: [
      {
        note: '512 B sub-blocks for small files; promote to 4 KB when full (libc buffers to avoid copy storm).',
        tip: 'space vs I/O',
      },
      {
        note: 'Old disks: skip sectors so next sequential I/O isn’t a full rotation late. Track buffers made this obsolete.',
        tip: 'parameterization',
      },
      {
        note: 'Usability: long names, symbolic links, atomic rename — adoption matters as much as seek math.',
        tip: 'make it usable',
      },
    ],
  },
};

export default function FfsSimulator() {
  const [scenario, setScenario] = useState('problem');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="FFS — locality"
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
      {scenario === 'problem' && cur.layout && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {cur.layout.map((c, i) => (
            <Chip
              key={`${c}-${i}`}
              size="small"
              label={c}
              sx={{
                bgcolor: c.startsWith('E') ? '#ef5350' : c === '·' ? '#eeeeee' : '#bbdefb',
                fontFamily: 'monospace',
              }}
            />
          ))}
        </Stack>
      )}
      {scenario === 'groups' && (
        <Stack spacing={0.75}>
          {(cur.groups || []).map((g) => (
            <Box
              key={g}
              sx={{
                p: 1,
                bgcolor: '#e3f2fd',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {g}
            </Box>
          ))}
          {cur.ok && <Chip color="success" size="small" label="related files colocated" />}
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {(scenario === 'large' || scenario === 'extras') && (
        <Stack spacing={1}>
          {cur.bad && <Chip color="error" size="small" label="group monopolized" />}
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} sx={{width: 'fit-content'}} />}
        </Stack>
      )}
      {scenario === 'problem' && cur.tip && (
        <Chip size="small" variant="outlined" label={cur.tip} sx={{mt: 1}} />
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

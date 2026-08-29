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
  {key: 'meta', label: 'Metadata', color: '#ab47bc', desc: 'Inode / bitmap'},
  {key: 'data', label: 'Data block', color: '#42a5f5', desc: 'User contents'},
  {key: 'log', label: 'Journal', color: '#ffb74d', desc: 'Write-ahead log'},
  {key: 'bad', label: 'Inconsistent', color: '#ef5350', desc: 'Partial update after crash'},
  {key: 'ok', label: 'Committed', color: '#66bb6a', desc: 'Safe to checkpoint / replay'},
];

const SCENARIOS = {
  problem: {
    label: 'Problem',
    subtitle: 'Append needs inode + bitmap + data. Disk does one write at a time — crash mid-update.',
    steps: [
      {
        note: 'Only inode written → points at garbage; bitmap disagrees (inconsistency).',
        wrote: ['I[v2]'],
        bad: true,
      },
      {
        note: 'Only bitmap → space leak (block marked used, nothing points to it).',
        wrote: ['B[v2]'],
        bad: true,
      },
      {
        note: 'Inode+bitmap, no data → consistent metadata, garbage user data. Want atomic multi-block update.',
        wrote: ['I', 'B'],
        tip: 'crash-consistency problem',
      },
    ],
  },
  fsck: {
    label: 'fsck',
    subtitle: 'Let inconsistency happen; scan & repair before mount. Correct but O(disk) — slow on large volumes.',
    steps: [
      {
        note: 'Phases: superblock sanity, rebuild bitmaps from inodes, inode/link/dup/bad-ptr checks, directory integrity.',
        tip: 'trust inodes over bitmaps',
      },
      {
        note: 'Can’t fix “consistent but garbage data.” Scanning whole disk for a 3-block update is wasteful as disks/RAIDs grow.',
        tip: 'too slow',
      },
    ],
  },
  journal: {
    label: 'Journal',
    subtitle: 'Write-ahead log: note intent, then checkpoint. Recovery = replay committed txs (redo).',
    steps: [
      {
        note: 'Data journaling: TxB + blocks + TxE (commit after body). Then checkpoint to final locations; free log later.',
        phase: 'journal → commit → checkpoint → free',
        ok: true,
      },
      {
        note: 'Don’t append TxE until body durable — else garbage looks like a valid tx. Checksums (ext4) allow one-shot writes.',
        tip: 'ordering / barriers',
      },
      {
        note: 'Metadata/ordered journaling: write data first (or before TxE), journal only metadata — avoid double data write.',
        tip: 'pointer after pointees',
      },
    ],
  },
  other: {
    label: 'Other',
    subtitle: 'Soft Updates (ordered writes), COW/ZFS, backpointers, optimistic journaling.',
    steps: [
      {
        note: 'Soft Updates: never leave illegal on-disk states by ordering every write — complex but no log tax.',
        tip: 'Ganger/Patt',
      },
      {
        note: 'COW: write to free space, flip root atomically. Deletes + block reuse need revoke records in metadata journals.',
        tip: 'reuse is hairy',
      },
    ],
  },
};

export default function CrashConsistencySimulator() {
  const [scenario, setScenario] = useState('problem');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Crash consistency"
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
      {scenario === 'problem' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.wrote || []).map((w) => (
              <Chip key={w} size="small" label={w} sx={{bgcolor: '#ef5350', fontFamily: 'monospace'}} />
            ))}
          </Stack>
          {cur.bad && <Chip color="error" size="small" label="partial update" />}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'fsck' && cur.tip && (
        <Chip size="small" color="primary" label={cur.tip} sx={{width: 'fit-content'}} />
      )}
      {scenario === 'journal' && (
        <Stack spacing={1}>
          {cur.phase && (
            <Box sx={{p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, fontFamily: 'monospace', fontWeight: 700, fontSize: 13}}>
              {cur.phase}
            </Box>
          )}
          {cur.ok && <Chip color="success" size="small" label="committed → safe to replay" />}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'other' && cur.tip && (
        <Chip size="small" color="primary" label={cur.tip} sx={{width: 'fit-content'}} />
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

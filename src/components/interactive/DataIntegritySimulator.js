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
  {key: 'ok', label: 'Good', color: '#66bb6a', desc: 'Checksum matches'},
  {key: 'lse', label: 'LSE', color: '#ffb74d', desc: 'Disk reports error'},
  {key: 'corrupt', label: 'Silent corruption', color: '#ef5350', desc: 'Wrong data, no disk error'},
  {key: 'csum', label: 'Checksum', color: '#ab47bc', desc: 'Stored summary'},
  {key: 'scrub', label: 'Scrub', color: '#42a5f5', desc: 'Background verify'},
];

const SCENARIOS = {
  faults: {
    label: 'Faults',
    subtitle: 'Fail-partial disks: whole-disk failure plus LSEs (detected) and silent block corruption [B+07,B+08].',
    steps: [
      {
        note: 'LSE: sector damaged (head crash, cosmic rays). Drive ECC fails → read returns an error. Cheap drives ~9% saw ≥1 LSE over ~3 years.',
        tip: 'non-silent partial fault',
      },
      {
        note: 'Corruption: firmware writes wrong place, bad bus transfer — disk ECC happy, client gets wrong bits. Silent. Rarer (~0.5% cheap) but deadly without checksums.',
        tip: 'silent partial fault',
      },
      {
        note: 'LSEs: locality, scrubbing finds most, disks with LSEs get more. Corruption: model-dependent, not independent in RAID, weak LSE correlation.',
        tip: 'must detect + recover',
      },
    ],
  },
  lse: {
    label: 'LSEs',
    subtitle: 'Detection is free (disk error). Recover via mirror/parity. RAID rebuild + LSE on a survivor needs extra redundancy (e.g. RAID-DP).',
    steps: [
      {
        note: 'Mirror: read the other copy. RAID-4/5: reconstruct from stripe. Easy once you know the block is bad.',
        tip: 'use existing redundancy',
      },
      {
        note: 'During rebuild, an LSE on another disk can doom reconstruction → dual parity (NetApp RAID-DP) [C+04].',
        tip: 'LSE during rebuild',
      },
    ],
  },
  csum: {
    label: 'Checksums',
    subtitle: 'Store C(D) with data; on read compare stored Cs vs recomputed Cc. Mismatch → corruption. XOR, add, Fletcher, CRC — strength vs speed trade-off.',
    steps: [
      {
        note: 'Layout: 520-byte sectors with 8 B checksum, or pack n checksums in a sector then n data blocks (extra RMW on overwrite).',
        layout: ['C', 'D0', 'D1', 'D2'],
      },
      {
        note: 'Collisions inevitable (large → small). Good functions minimize chance while staying cheap. No free lunch.',
        tip: 'detect ≠ recover',
      },
      {
        note: 'Match → likely OK, return data. Mismatch → use redundant copy or return error. Checksums alone don’t recreate lost bits.',
        tip: 'need a good copy',
      },
    ],
  },
  tricky: {
    label: 'Tricky',
    subtitle: 'Misdirected writes need physical IDs in the checksum record. Lost writes need verify or higher-level checksums (ZFS). Scrub cold data.',
    steps: [
      {
        note: 'Misdirected write: correct bits, wrong LBA/disk. Store disk# + offset with C(D); mismatch on read → detect.',
        tip: 'physical identity',
      },
      {
        note: 'Lost write: device says done, old block remains. Old C(D) still matches. Fix: read-after-write (slow) or checksum in inode/indirect (ZFS).',
        tip: 'checksum elsewhere',
      },
      {
        note: 'Scrubbing: nightly/weekly scan all blocks so bit rot doesn’t silently kill every copy of cold data.',
        tip: 'unchecked data is risky',
      },
    ],
  },
  cost: {
    label: 'Cost',
    subtitle: 'Space: ~8 B / 4 KB ≈ 0.2%. Time: CPU checksum (+ combined copy); maybe extra I/O for separate checksum sectors + scrub.',
    steps: [
      {
        note: 'Tune scrub to idle windows. Co-design layout so checksum I/O isn’t a constant tax on the hot path.',
        tip: 'space small, time tunable',
      },
    ],
  },
};

export default function DataIntegritySimulator() {
  const [scenario, setScenario] = useState('faults');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Data integrity"
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
      {cur.layout && (
        <Box sx={{display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap'}}>
          {cur.layout.map((x) => (
            <Chip
              key={x}
              size="small"
              label={x}
              sx={{
                fontFamily: 'monospace',
                bgcolor: x.startsWith('C') ? '#ab47bc' : '#66bb6a',
                color: '#fff',
              }}
            />
          ))}
        </Box>
      )}
      {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} sx={{mb: 1, width: 'fit-content'}} />}
      <Typography variant="body2">{cur.note}</Typography>
    </CEBlock>
  );
}

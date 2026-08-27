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
  {key: 'seek', label: 'Seek', color: '#ef5350', desc: 'Arm moves to track'},
  {key: 'rot', label: 'Rotation', color: '#ffb74d', desc: 'Wait for sector under head'},
  {key: 'xfer', label: 'Transfer', color: '#66bb6a', desc: 'Read/write bits'},
  {key: 'seq', label: 'Sequential', color: '#42a5f5', desc: 'Contiguous blocks — fast path'},
  {key: 'sched', label: 'Scheduler pick', color: '#ab47bc', desc: 'SSTF / SCAN / SPTF choice'},
];

const SCENARIOS = {
  geometry: {
    label: 'Geometry',
    subtitle: 'Platters → surfaces → tracks → sectors. Address space is a linear array of sectors.',
    steps: [
      {
        note: 'Interface: sectors 0…n−1 (often 512 B). Multi-sector I/O OK; only single-sector write is guaranteed atomic (torn write risk).',
        parts: ['platter', 'spindle', 'track 0–11'],
      },
      {
        note: 'Head on arm seeks across tracks; platter spins (e.g. 10K RPM ≈ 6 ms/rotation). Unwritten contract: nearby/sequential ≫ random [SG04].',
        parts: ['arm', 'head @ track'],
        tip: 'sequential preferred',
      },
      {
        note: 'Extras: track skew (catch next track after settle), multi-zone (outer tracks denser), track buffer / write-back vs write-through.',
        tip: 'skew · zones · cache',
      },
    ],
  },
  time: {
    label: 'I/O time',
    subtitle: 'T_I/O = T_seek + T_rotation + T_transfer. Rate = size / T_I/O.',
    steps: [
      {
        note: 'Request to far sector: seek (accel→coast→decel→settle 0.5–2 ms) then rotate then transfer.',
        seek: 4,
        rot: 2,
        xfer: 0.03,
        kind: 'random 4KB',
      },
      {
        note: 'Cheetah-ish random 4KB ≈ 6 ms → ~0.66 MB/s. Sequential 100 MB ≈ peak transfer (~125 MB/s). Gap ~200×.',
        seek: 4,
        rot: 2,
        xfer: 800,
        kind: 'seq vs rand',
        tip: 'use disks sequentially',
      },
      {
        note: 'Avg seek distance over all pairs ≈ ⅓ of full stroke (geometry), not “⅓ of full seek time” blindly.',
        tip: '⅓ distance',
      },
    ],
  },
  sched: {
    label: 'Scheduling',
    subtitle: 'Estimate positioning cost ≈ SJF. SSTF/NBF, SCAN/elevator, SPTF (seek+rotate).',
    steps: [
      {
        note: 'Head inner; requests 21 (middle) and 2 (outer). SSTF/NBF serves 21 first — nearer track/block.',
        pick: '21 then 2',
        policy: 'SSTF',
      },
      {
        note: 'Pure SSTF can starve outer tracks if inner keeps getting hits → SCAN/C-SCAN elevator sweeps.',
        pick: 'sweep outer↔inner',
        policy: 'SCAN',
        tip: 'no starvation',
      },
      {
        note: 'SPTF/SATF: if rotation dominates, a longer seek to sector 8 may beat a short seek to 16 that needs a full spin. Often done inside the drive.',
        pick: '8 over 16?',
        policy: 'SPTF',
        tip: 'it depends',
      },
      {
        note: 'OS may issue a window of requests; drive reorders with real geometry. Merge adjacent blocks. Sometimes wait (anticipatory / non-work-conserving) [ID01].',
        tip: 'merge · window · wait',
      },
    ],
  },
};

export default function HardDiskDrivesSimulator() {
  const [scenario, setScenario] = useState('geometry');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Hard disk drives"
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
      {scenario === 'geometry' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.parts || []).map((p) => (
              <Chip key={p} size="small" label={p} sx={{bgcolor: '#bbdefb'}} />
            ))}
          </Stack>
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'time' && (
        <Stack spacing={1}>
          {cur.seek != null && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`seek ${cur.seek} ms`} sx={{bgcolor: '#ef5350'}} />
              <Chip size="small" label={`rot ${cur.rot} ms`} sx={{bgcolor: '#ffb74d'}} />
              <Chip
                size="small"
                label={`xfer ${cur.xfer} ms`}
                sx={{bgcolor: '#66bb6a'}}
              />
              <Chip size="small" variant="outlined" label={cur.kind} />
            </Stack>
          )}
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'sched' && (
        <Stack spacing={1}>
          <Box sx={{p: 1.5, bgcolor: '#f3e5f5', borderRadius: 1, fontFamily: 'monospace', fontWeight: 700}}>
            {cur.policy}: {cur.pick}
          </Box>
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

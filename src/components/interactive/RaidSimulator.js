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
  {key: 'data', label: 'Data chunk', color: '#42a5f5', desc: 'Useful client blocks'},
  {key: 'mirror', label: 'Mirror copy', color: '#66bb6a', desc: 'Second copy of a block'},
  {key: 'parity', label: 'Parity', color: '#ab47bc', desc: 'XOR redundancy'},
  {key: 'bottleneck', label: 'Hot spot', color: '#ef5350', desc: 'Parity disk under small writes'},
  {key: 'ok', label: 'Parallel OK', color: '#ffb74d', desc: 'Rotated parity / full stripe'},
];

const SCENARIOS = {
  idea: {
    label: 'Why RAID',
    subtitle: 'Transparent big disk: capacity, speed (parallelism), reliability (redundancy) [P+88].',
    steps: [
      {
        note: 'Externally: linear block array. Internally: disks + MCU + DRAM (+ NVRAM for consistent update).',
        axes: ['capacity', 'reliability', 'performance'],
      },
      {
        note: 'Fail-stop model for now: disk working or permanently failed — and failure is detectable.',
        tip: 'fail-stop',
      },
    ],
  },
  levels: {
    label: 'Levels 0/1',
    subtitle: 'RAID-0 stripes (no redundancy). RAID-1 mirrors — half capacity, strong random reads.',
    steps: [
      {
        note: 'RAID-0: round-robin chunks. Disk=A%N, Offset=A/N (chunk=1). Capacity N·B; 0 fault tolerance; ~N·S / N·R.',
        level: '0',
        layout: ['0', '1', '2', '3', '4', '5', '6', '7'],
      },
      {
        note: 'RAID-1: two copies on different disks. Writes hit both (parallel). Seq ≈ N/2·S; random read N·R; random write N/2·R.',
        level: '1',
        layout: ['0', '0', '1', '1'],
        tip: 'consistent update / NVRAM log',
      },
    ],
  },
  parity: {
    label: 'Parity 4/5',
    subtitle: 'XOR parity: (N−1)·B capacity, tolerate 1 failure. RAID-5 rotates parity to fix the small-write bottleneck.',
    steps: [
      {
        note: 'RAID-4: fixed parity disk. Full-stripe write: XOR data, write stripe+P in parallel → (N−1)·S.',
        level: '4',
        layout: ['0', '1', '2', '3', 'P'],
        ok: true,
      },
      {
        note: 'Small write (subtractive): read old data+parity, compute Pnew=(Cold⊕Cnew)⊕Pold, write both → 4 I/Os. Parity disk serializes → ~R/2.',
        level: '4',
        layout: ['*', 'd', 'd', 'd', 'P*'],
        bad: true,
      },
      {
        note: 'RAID-5: rotate P across disks. Same capacity/reliability as 4; random writes ~N/4·R with parallelism across requests.',
        level: '5',
        layout: ['0', '1', '2', '3', 'P0', '5', '6', '7', 'P1', '4'],
        tip: 'replaces RAID-4 in market',
      },
    ],
  },
  pick: {
    label: 'Pick level',
    subtitle: 'Striping = speed only. Mirror = random I/O + reliability. RAID-5 = capacity + reliability (pay on small writes).',
    steps: [
      {
        note: 'Want max performance, ignore faults → RAID-0.',
        choice: 'RAID-0',
      },
      {
        note: 'Want random I/O + reliability, can afford half capacity → RAID-1.',
        choice: 'RAID-1',
      },
      {
        note: 'Want capacity + 1-disk tolerance; mostly sequential / full-stripe → RAID-5 (or RAID-4 if only huge writes).',
        choice: 'RAID-5',
      },
    ],
  },
};

export default function RaidSimulator() {
  const [scenario, setScenario] = useState('idea');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="RAID"
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
      {scenario === 'idea' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.axes || []).map((a) => (
              <Chip key={a} size="small" label={a} sx={{bgcolor: '#bbdefb'}} />
            ))}
          </Stack>
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {(scenario === 'levels' || scenario === 'parity') && (
        <Stack spacing={1}>
          {cur.level && (
            <Chip
              label={`RAID-${cur.level}`}
              sx={{
                bgcolor: cur.bad ? '#ef5350' : cur.ok ? '#66bb6a' : '#ab47bc',
                width: 'fit-content',
              }}
            />
          )}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.layout || []).map((c, i) => (
              <Chip
                key={`${c}-${i}`}
                size="small"
                label={c}
                sx={{
                  bgcolor:
                    String(c).startsWith('P') || c === 'P*'
                      ? '#e1bee7'
                      : c === '*' || c === '0' && cur.level === '1'
                        ? '#c8e6c9'
                        : '#bbdefb',
                  fontFamily: 'monospace',
                }}
              />
            ))}
          </Stack>
          {cur.bad && <Chip color="error" size="small" label="parity bottleneck / small-write" />}
          {cur.ok && <Chip color="success" size="small" label="full-stripe parallel" />}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'pick' && (
        <Box sx={{p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, fontFamily: 'monospace', fontWeight: 700}}>
          → {cur.choice}
        </Box>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

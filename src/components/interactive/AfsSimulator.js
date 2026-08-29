import React, {useState} from 'react';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const LEGEND = [
  {key: 'scale', label: 'Scale', color: '#42a5f5', desc: 'More clients per server'},
  {key: 'cache', label: 'Whole-file cache', color: '#66bb6a', desc: 'Local disk + memory'},
  {key: 'cb', label: 'Callback', color: '#ab47bc', desc: 'Server promises to notify'},
  {key: 'cons', label: 'Consistency', color: '#ffb74d', desc: 'Close-to-open + last closer'},
  {key: 'cost', label: 'Trade-off', color: '#ef5350', desc: 'Overwrite / partial access'},
];

const SCENARIOS = {
  goal: {
    label: 'Goal',
    subtitle: 'AFS (CMU, Satya): maximize clients per server. Clear cache semantics — open gets a consistent latest copy.',
    steps: [
      {
        note: 'NFS scalability tax: periodic GETATTR-style checks burn server CPU/network. AFS redesigns the protocol to cut chatter.',
        tip: 'scale first',
      },
    ],
  },
  v1: {
    label: 'AFSv1',
    subtitle: 'Whole-file caching on client disk (Venus). open→Fetch pathname; read/write local; close→Store if dirty. TestAuth before reuse.',
    steps: [
      {
        note: 'Contrasts NFS: whole file (not blocks) on local disk (not only RAM). Directories stayed server-side in v1.',
        tip: 'Venus / Vice',
      },
      {
        note: 'Measured problems (Patterson’s Law): full pathname walks on every Fetch/Store; too many TestAuths. ~20 clients/server.',
        tip: 'measure then build',
      },
    ],
  },
  v2: {
    label: 'AFSv2',
    subtitle: 'Callbacks + FIDs. Client walks path piece by piece, caches dirs/files, registers callbacks — common case is fully local.',
    steps: [
      {
        note: 'Callback = server promise to notify on change (interrupt vs NFS polling). FID = volume + file id + uniquifier (like an NFS FH).',
        tip: 'less TestAuth',
      },
      {
        note: 'open /home/remzi/notes.txt: Fetch home, remzi, notes.txt; callback each. Later opens use local copies if callbacks still VALID.',
        tip: '~50 clients/server',
      },
    ],
  },
  cons: {
    label: 'Consistency',
    subtitle: 'Across machines: updates visible + caches invalidated at close (flush + break callbacks). Same machine: UNIX-like immediate visibility.',
    steps: [
      {
        note: 'Last closer wins for concurrent writers — whole file from one client, not an NFS-style block mix.',
        tip: 'simple model',
      },
      {
        note: 'Baseline DFS consistency ≠ app correctness: repos still need locks. Expectation management matters.',
        tip: 'not a panacea',
      },
    ],
  },
  trade: {
    label: 'Trade-offs',
    subtitle: 'Re-reads of large files shine (disk cache). Overwrites and tiny accesses into huge files hurt (fetch/store whole file). Crash recovery is heavier.',
    steps: [
      {
        note: 'Client/server reboot: treat cache as suspect; TestAuth/re-fetch. Server loses in-memory callbacks — clients must revalidate.',
        tip: 'state has a cost',
      },
      {
        note: 'Extras: global namespace, security, ACLs, volume management. Ideas live on (NFSv4 state); pure AFS deployments rarer.',
        tip: 'workload decides',
      },
    ],
  },
};

export default function AfsSimulator() {
  const [scenario, setScenario] = useState('goal');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Andrew File System"
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
      {cur.tip && (
        <Chip size="small" variant="outlined" label={cur.tip} sx={{mb: 1, width: 'fit-content'}} />
      )}
      <Typography variant="body2">{cur.note}</Typography>
    </CEBlock>
  );
}

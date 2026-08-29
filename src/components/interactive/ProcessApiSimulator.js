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
  {key: 'parent', label: 'Parent', color: '#42a5f5', desc: 'Original process (fork returns child PID)'},
  {key: 'child', label: 'Child', color: '#66bb6a', desc: 'New process (fork returns 0)'},
  {key: 'exec', label: 'After exec', color: '#ab47bc', desc: 'Same PID, different program image'},
  {key: 'idle', label: 'Waiting / done', color: '#bdbdbd', desc: 'Blocked in wait() or exited'},
];

const SCENARIOS = {
  fork: {
    label: 'fork()',
    subtitle: 'One process becomes two; return values differ.',
    steps: [
      {
        note: 'Process A (pid 100) runs main and prints hello once.',
        procs: [{id: 'A', role: 'parent', pid: 100, rc: '—', line: 'printf hello (pid 100)'}],
      },
      {
        note: 'fork() — OS clones address space, registers, PC. Both are about to return from fork.',
        procs: [
          {id: 'A', role: 'parent', pid: 100, rc: '…', line: 'calling fork()'},
          {id: 'B', role: 'child', pid: 101, rc: '…', line: 'being created'},
        ],
      },
      {
        note: 'Parent gets child PID (101). Child gets 0. Neither restarts at main — hello printed only once.',
        procs: [
          {id: 'A', role: 'parent', pid: 100, rc: '101', line: 'rc == 101 → parent path'},
          {id: 'B', role: 'child', pid: 101, rc: '0', line: 'rc == 0 → child path'},
        ],
      },
      {
        note: 'Scheduler picks who runs first — output order is nondeterministic without wait().',
        procs: [
          {id: 'A', role: 'parent', pid: 100, rc: '101', line: 'printf I am parent…'},
          {id: 'B', role: 'child', pid: 101, rc: '0', line: 'printf I am child…'},
        ],
      },
    ],
  },
  wait: {
    label: 'fork + wait',
    subtitle: 'Parent waits until the child exits → child always prints first.',
    steps: [
      {
        note: 'After fork, parent may run first — but it immediately calls wait().',
        procs: [
          {id: 'A', role: 'idle', pid: 100, rc: '101', line: 'wait(NULL) — blocked'},
          {id: 'B', role: 'child', pid: 101, rc: '0', line: 'printf I am child'},
        ],
      },
      {
        note: 'Child finishes and exits. wait() returns the child’s PID to the parent.',
        procs: [
          {id: 'A', role: 'parent', pid: 100, rc: '101', line: 'wait → 101; printf I am parent'},
          {id: 'B', role: 'idle', pid: 101, rc: '0', line: 'exited'},
        ],
      },
      {
        note: 'Output is now deterministic: child message, then parent message.',
        procs: [
          {id: 'A', role: 'parent', pid: 100, rc: '101', line: 'done'},
          {id: 'B', role: 'idle', pid: 101, rc: '0', line: 'done'},
        ],
      },
    ],
  },
  exec: {
    label: 'fork + exec',
    subtitle: 'Child replaces its image with another program (e.g. wc).',
    steps: [
      {
        note: 'Child still runs the original program after fork.',
        procs: [
          {id: 'A', role: 'idle', pid: 100, rc: '101', line: 'wait(NULL)'},
          {id: 'B', role: 'child', pid: 101, rc: '0', line: 'printf I am child'},
        ],
      },
      {
        note: 'execvp("wc", …) loads wc over this process. Same PID — new code/data/stack.',
        procs: [
          {id: 'A', role: 'idle', pid: 100, rc: '101', line: 'still waiting'},
          {id: 'B', role: 'exec', pid: 101, rc: '0', line: 'now running wc'},
        ],
      },
      {
        note: 'Successful exec never returns — the “this shouldn’t print” line is dead.',
        procs: [
          {id: 'A', role: 'idle', pid: 100, rc: '101', line: 'wait(NULL)'},
          {id: 'B', role: 'exec', pid: 101, rc: '—', line: 'wc prints line/word/byte counts'},
        ],
      },
      {
        note: 'wc exits → wait returns → parent prints. Shells use this pattern for every command.',
        procs: [
          {id: 'A', role: 'parent', pid: 100, rc: '101', line: 'printf I am parent'},
          {id: 'B', role: 'idle', pid: 101, rc: '—', line: 'exited'},
        ],
      },
    ],
  },
  redirect: {
    label: 'I/O redirect',
    subtitle: 'Between fork and exec, rearrange file descriptors (e.g. wc > file).',
    steps: [
      {
        note: 'Child closes STDOUT (fd 1). Next open() reuses the lowest free fd — usually 1.',
        procs: [
          {id: 'A', role: 'idle', pid: 100, rc: '101', line: 'wait(NULL)'},
          {id: 'B', role: 'child', pid: 101, rc: '0', line: 'close(STDOUT); open("out")'},
        ],
      },
      {
        note: 'exec wc — its printf/write to fd 1 goes to the file, not the terminal.',
        procs: [
          {id: 'A', role: 'idle', pid: 100, rc: '101', line: 'waiting'},
          {id: 'B', role: 'exec', pid: 101, rc: '—', line: 'wc → p4.output'},
        ],
      },
      {
        note: 'Screen looks idle; cat the file to see wc’s output. Pipes work the same idea with pipe().',
        procs: [
          {id: 'A', role: 'parent', pid: 100, rc: '101', line: 'wait done; shell prompt'},
          {id: 'B', role: 'idle', pid: 101, rc: '—', line: 'exited'},
        ],
      },
    ],
  },
};

const roleColor = (role) => LEGEND.find((l) => l.key === role)?.color ?? '#bdbdbd';

function ProcCard({proc}) {
  return (
    <Box
      sx={{
        flex: '1 1 180px',
        minWidth: 160,
        p: 1.5,
        borderRadius: 1,
        border: '2px solid',
        borderColor: roleColor(proc.role),
        backgroundColor: `${roleColor(proc.role)}18`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={1}>
        <Chip
          size="small"
          label={proc.role}
          sx={{backgroundColor: roleColor(proc.role), color: '#fff', fontWeight: 700}}
        />
        <Typography variant="caption" fontWeight={700}>
          pid {proc.pid}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          fork rc: {proc.rc}
        </Typography>
      </Stack>
      <Typography variant="body2" fontFamily="monospace" fontSize={12}>
        {proc.line}
      </Typography>
    </Box>
  );
}

export default function ProcessApiSimulator() {
  const [scenario, setScenario] = useState('fork');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  const switchScenario = (_, v) => {
    if (!v) {
      return;
    }
    setScenario(v);
    setStep(0);
  };

  return (
    <CEBlock
      title="Process API Simulator"
      subtitle={data.subtitle}
    >
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small">
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="Processes">
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {current.procs.map((p) => (
            <ProcCard key={p.id} proc={p} />
          ))}
        </Stack>
        <Typography variant="body2" mt={1.5} color="text.secondary">
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

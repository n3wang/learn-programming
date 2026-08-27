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
  {key: 'kernel', label: 'Kernel mode', color: '#ef5350', desc: 'Privileged — OS can do I/O, set timers, install trap table'},
  {key: 'user', label: 'User mode', color: '#42a5f5', desc: 'Restricted — apps run here at full speed'},
  {key: 'hw', label: 'Hardware', color: '#ab47bc', desc: 'Trap / timer / save-restore registers'},
  {key: 'idle', label: 'Not running', color: '#bdbdbd', desc: 'Process not on CPU'},
];

const SCENARIOS = {
  boot: {
    label: 'Boot + LDE',
    subtitle: 'At boot the OS installs the trap table and starts the timer, then launches a process in user mode.',
    steps: [
      {
        note: 'Machine boots in kernel mode. OS initializes the trap table (syscall + timer handlers).',
        actors: [
          {who: 'OS', mode: 'kernel', line: 'privileged: install trap table'},
          {who: 'CPU', mode: 'hw', line: 'remember handler addresses'},
        ],
      },
      {
        note: 'OS also starts the timer interrupt — essential so a runaway process cannot hog the CPU forever.',
        actors: [
          {who: 'OS', mode: 'kernel', line: 'privileged: start timer'},
          {who: 'CPU', mode: 'hw', line: 'interrupt in X ms'},
        ],
      },
      {
        note: 'Create process, load code, fill kernel stack, then return-from-trap into user mode at main().',
        actors: [
          {who: 'OS', mode: 'kernel', line: 'setup process A'},
          {who: 'Proc A', mode: 'user', line: 'about to run main()'},
        ],
      },
      {
        note: 'Limited direct execution: A runs natively on the CPU — fast — but only in restricted user mode.',
        actors: [
          {who: 'OS', mode: 'idle', line: 'not on CPU'},
          {who: 'Proc A', mode: 'user', line: 'running main()…'},
        ],
      },
    ],
  },
  syscall: {
    label: 'System call',
    subtitle: 'User code cannot do I/O itself — it traps into the kernel via a system call.',
    steps: [
      {
        note: 'Process A (user mode) needs a privileged service — e.g. open() / read().',
        actors: [
          {who: 'Proc A', mode: 'user', line: 'call open() → libc'},
          {who: 'OS', mode: 'idle', line: 'waiting'},
        ],
      },
      {
        note: 'Library places syscall number + args, then executes trap. Hardware saves regs → kernel stack, raises privilege.',
        actors: [
          {who: 'CPU', mode: 'hw', line: 'trap: save regs, → kernel mode'},
          {who: 'OS', mode: 'kernel', line: 'jump to trap handler'},
        ],
      },
      {
        note: 'OS validates the syscall number and arguments (never trust user input!), then does the work.',
        actors: [
          {who: 'OS', mode: 'kernel', line: 'handle open(); check args'},
          {who: 'Proc A', mode: 'idle', line: 'paused'},
        ],
      },
      {
        note: 'return-from-trap: restore regs, drop to user mode, resume after the trap. A never picked the kernel address — only a syscall number.',
        actors: [
          {who: 'Proc A', mode: 'user', line: 'resume after open()'},
          {who: 'OS', mode: 'idle', line: 'done'},
        ],
      },
    ],
  },
  timer: {
    label: 'Timer + switch',
    subtitle: 'Timer interrupt lets the OS regain the CPU without cooperation, then optionally context-switch.',
    steps: [
      {
        note: 'Process A is running in user mode. OS is not on the CPU — so how can it switch?',
        actors: [
          {who: 'Proc A', mode: 'user', line: 'running…'},
          {who: 'Proc B', mode: 'idle', line: 'ready'},
        ],
      },
      {
        note: 'Timer fires. Hardware saves A’s user registers on A’s kernel stack and enters the timer handler.',
        actors: [
          {who: 'CPU', mode: 'hw', line: 'timer IRQ → kernel mode'},
          {who: 'OS', mode: 'kernel', line: 'timer handler'},
        ],
      },
      {
        note: 'Scheduler chooses B. Context switch: save A’s kernel regs into A’s PCB; restore B’s; switch to B’s kernel stack.',
        actors: [
          {who: 'OS', mode: 'kernel', line: 'switch(): A → B'},
          {who: 'Proc A', mode: 'idle', line: 'saved in PCB'},
        ],
      },
      {
        note: 'return-from-trap restores B’s user registers and resumes B — not A. Time sharing without cooperation.',
        actors: [
          {who: 'Proc B', mode: 'user', line: 'running'},
          {who: 'Proc A', mode: 'idle', line: 'ready (saved)'},
        ],
      },
    ],
  },
};

const modeColor = (mode) => LEGEND.find((l) => l.key === mode)?.color ?? '#bdbdbd';

function ActorCard({actor}) {
  return (
    <Box
      sx={{
        flex: '1 1 160px',
        minWidth: 150,
        p: 1.5,
        borderRadius: 1,
        border: '2px solid',
        borderColor: modeColor(actor.mode),
        backgroundColor: `${modeColor(actor.mode)}18`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          label={actor.mode}
          sx={{backgroundColor: modeColor(actor.mode), color: '#fff', fontWeight: 700}}
        />
        <Typography variant="caption" fontWeight={700}>
          {actor.who}
        </Typography>
      </Stack>
      <Typography variant="body2" fontFamily="monospace" fontSize={12}>
        {actor.line}
      </Typography>
    </Box>
  );
}

export default function LimitedDirectExecutionSimulator() {
  const [scenario, setScenario] = useState('boot');
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
    <CEBlock title="Limited Direct Execution" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small">
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="Who is active">
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {current.actors.map((a) => (
            <ActorCard key={`${a.who}-${a.line}`} actor={a} />
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

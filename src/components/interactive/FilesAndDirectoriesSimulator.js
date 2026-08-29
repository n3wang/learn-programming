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
  {key: 'fd', label: 'File descriptor', color: '#42a5f5', desc: 'Per-process integer handle'},
  {key: 'oft', label: 'Open file table', color: '#ab47bc', desc: 'Offset, inode ptr, refcnt'},
  {key: 'inode', label: 'Inode', color: '#66bb6a', desc: 'Persistent metadata + data map'},
  {key: 'link', label: 'Directory link', color: '#ffb74d', desc: 'Name → inode number'},
  {key: 'soft', label: 'Symlink', color: '#ef5350', desc: 'Special file holding a pathname'},
];

const SCENARIOS = {
  abs: {
    label: 'Abstractions',
    subtitle: 'File = byte array (inode #). Directory = (name, inode #) pairs → hierarchy under /.',
    steps: [
      {
        note: 'FS stores bytes; type (.c / .jpg) is convention. Absolute path: /foo/bar.txt.',
        tree: ['/', 'foo/', 'bar.txt'],
      },
      {
        note: 'UNIX names almost everything via the tree (devices, pipes, /proc). Naming is the first step to access [SK09].',
        tip: 'uniform naming',
      },
    ],
  },
  open: {
    label: 'open/read',
    subtitle: 'open → fd; stdin/out/err are 0/1/2. Offset lives in the open file table entry.',
    steps: [
      {
        note: 'open("foo", O_RDONLY) → fd 3. read/write advance offset; lseek moves it (no disk seek by itself!).',
        fds: ['0 stdin', '1 stdout', '2 stderr', '3 foo'],
        off: 0,
      },
      {
        note: 'Two opens of the same file → two OFT entries, independent offsets. fork/dup share one OFT entry (refcnt++).',
        fds: ['3→OFT[10]', '4→OFT[11]'],
        tip: 'shared on fork/dup',
      },
      {
        note: 'write() is often buffered; fsync(fd) forces dirty data. May also need to fsync the parent directory for new files [P+14].',
        tip: 'fsync durability',
      },
    ],
  },
  links: {
    label: 'Links',
    subtitle: 'Hard link: another directory name → same inode (link count). unlink removes a name; free when count→0.',
    steps: [
      {
        note: 'ln file file2 → same inode, nlink=2. rm file leaves file2; last unlink frees inode+blocks.',
        names: ['file', 'file2'],
        inode: 67158084,
        nlink: 2,
      },
      {
        note: 'Symlink: separate file of type link holding a pathname. Can dangle; may cross mounts / point at dirs.',
        names: ['file2 → file'],
        soft: true,
        tip: 'ln -s',
      },
      {
        note: 'Atomic rename(tmp, real) after write+fsync is the classic safe-update pattern (editors).',
        tip: 'rename atomicity',
      },
    ],
  },
  access: {
    label: 'Access',
    subtitle: 'Permission bits (rwx for user/group/other) and ACLs. Mount glues FS trees into one namespace.',
    steps: [
      {
        note: 'rw-r--r-- : owner rw, group/other r. chmod 600 → rw-------. Execute bit: run binaries; for dirs, cd/lookup.',
        mode: 'rw-r--r--',
      },
      {
        note: 'mkfs writes an empty FS onto a partition; mount pastes it at a mount point (e.g. /home/users).',
        tip: 'one tree',
      },
      {
        note: 'TOCTTOU: gap between check (lstat) and use (open) lets attackers swap paths under privileged services [BD96].',
        tip: 'be wary of TOCTTOU',
      },
    ],
  },
};

export default function FilesAndDirectoriesSimulator() {
  const [scenario, setScenario] = useState('abs');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Files and directories"
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
      {scenario === 'abs' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.tree || []).map((t) => (
              <Chip key={t} size="small" label={t} sx={{bgcolor: '#bbdefb', fontFamily: 'monospace'}} />
            ))}
          </Stack>
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'open' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.fds || []).map((f) => (
              <Chip key={f} size="small" label={f} sx={{bgcolor: '#bbdefb', fontFamily: 'monospace'}} />
            ))}
          </Stack>
          {cur.off != null && (
            <Chip size="small" label={`offset=${cur.off}`} sx={{bgcolor: '#e1bee7'}} />
          )}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'links' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(cur.names || []).map((n) => (
              <Chip
                key={n}
                size="small"
                label={n}
                sx={{bgcolor: cur.soft ? '#ffcdd2' : '#ffe0b2', fontFamily: 'monospace'}}
              />
            ))}
          </Stack>
          {cur.inode && (
            <Typography fontFamily="monospace" fontWeight={700}>
              inode {cur.inode} · nlink={cur.nlink}
            </Typography>
          )}
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'access' && (
        <Stack spacing={1}>
          {cur.mode && (
            <Box sx={{p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, fontFamily: 'monospace', fontWeight: 700}}>
              {cur.mode}
            </Box>
          )}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

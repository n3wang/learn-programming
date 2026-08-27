import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const LEGEND = [
  {key: 'virt', label: 'Virtual address', color: '#42a5f5', desc: 'What user code generates — an illusion'},
  {key: 'phys', label: 'Physical address', color: '#66bb6a', desc: 'Real location in RAM — OS + hardware map to this'},
  {key: 'os', label: 'OS / MMU', color: '#ab47bc', desc: 'Translation, protection, per-process tables'},
  {key: 'road', label: 'Roadmap', color: '#ffb74d', desc: 'Topics coming in later chapters'},
];

const STEPS = [
  {
    tag: 'road',
    title: 'Not done with virtualization',
    chapter: 'Ch. 12 — opening',
    note: 'CPU virtualization is only half the story. Memory is the big monster in the closet — many hardware/OS details to keep straight.',
    diagram: 'cpu-done',
  },
  {
    tag: 'virt',
    title: 'Every user address is virtual',
    chapter: 'Core mantra',
    note: 'Repeat until it sticks: pointers, arrays, function addresses — all virtual. The program never sees raw physical RAM.',
    diagram: 'virtual-only',
  },
  {
    tag: 'virt',
    title: 'The illusion per process',
    chapter: 'What the OS provides',
    note: 'Each process gets the view of a large, private, contiguous address space for code, heap, stack, and data.',
    diagram: 'two-spaces',
  },
  {
    tag: 'os',
    title: 'Hardware helps translate',
    chapter: 'Virtual → physical',
    note: 'With OS-managed tables and the MMU, virtual addresses become physical ones so the CPU can fetch the right bytes.',
    diagram: 'translate',
  },
  {
    tag: 'virt',
    title: 'Ease of use',
    chapter: 'Why virtualize?',
    note: 'Programmers link and load into a spacious flat space — no manual packing into crowded physical RAM.',
    diagram: 'ease',
  },
  {
    tag: 'os',
    title: 'Isolation and protection',
    chapter: 'Why virtualize?',
    note: 'One errant process must not read or overwrite another’s memory. Violations → fault; OS may kill the offender.',
    diagram: 'protect',
  },
  {
    tag: 'road',
    title: 'The path ahead',
    chapter: 'OSTEP memory arc',
    note: 'Start simple: base/bounds. Add TLBs, multi-level page tables, swapping — until you have a modern VM manager.',
    diagram: 'roadmap',
  },
];

const tagColor = (tag) => LEGEND.find((l) => l.key === tag)?.color ?? '#78909c';

const tagLabel = (tag) => {
  if (tag === 'virt') return 'Virtual';
  if (tag === 'phys') return 'Physical';
  if (tag === 'os') return 'OS / MMU';
  return 'Roadmap';
};

function Diagram({kind}) {
  const bar = (color, label, flex = 1) => (
    <Box
      sx={{
        flex,
        py: 1,
        px: 1,
        borderRadius: 1,
        backgroundColor: `${color}22`,
        border: `2px solid ${color}`,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {label}
    </Box>
  );

  if (kind === 'cpu-done') {
    return (
      <Stack spacing={1}>
        {bar('#66bb6a', 'CPU virtualization ✓ (Part I done so far)')}
        {bar('#ef5350', 'Memory virtualization — next (Part II of “easy pieces”)', 1.2)}
      </Stack>
    );
  }

  if (kind === 'virtual-only') {
    return (
      <Stack spacing={0.5} alignItems="center">
        <Typography variant="caption" fontWeight={700}>
          User program
        </Typography>
        {bar('#42a5f5', 'mov 0x1000, %rax  ← virtual address')}
        <Typography variant="caption" color="text.secondary">
          never emits a physical address directly
        </Typography>
      </Stack>
    );
  }

  if (kind === 'two-spaces') {
    return (
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
        <Box sx={{flex: 1, minWidth: 120}}>
          <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
            Process A — virtual
          </Typography>
          <Stack spacing={0.5}>{bar('#42a5f5', '0 … large … MAX')}</Stack>
        </Box>
        <Box sx={{flex: 1, minWidth: 120}}>
          <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
            Process B — virtual
          </Typography>
          <Stack spacing={0.5}>{bar('#42a5f5', '0 … large … MAX')}</Stack>
        </Box>
      </Stack>
    );
  }

  if (kind === 'translate') {
    return (
      <Stack spacing={1}>
        {bar('#42a5f5', 'Virtual addr (Process A)')}
        <Typography variant="caption" textAlign="center" color="text.secondary">
          ↓ MMU + OS page tables
        </Typography>
        {bar('#66bb6a', 'Physical frame in RAM')}
      </Stack>
    );
  }

  if (kind === 'ease') {
    return (
      <Stack spacing={0.5}>
        {bar('#42a5f5', 'code')}
        {bar('#42a5f5', 'heap — room to grow')}
        {bar('#42a5f5', 'stack')}
        <Typography variant="caption" color="text.secondary">
          One contiguous illusion — linker/compiler happy
        </Typography>
      </Stack>
    );
  }

  if (kind === 'protect') {
    return (
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          {bar('#42a5f5', 'Proc A space', 1)}
          {bar('#42a5f5', 'Proc B space', 1)}
        </Stack>
        <Typography variant="caption" textAlign="center" color="error.main" fontWeight={700}>
          A tries to read B’s addresses → protection fault → OS may kill A
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {['base/bounds', 'segmentation', 'TLB', 'page tables', 'swap'].map((topic) => (
        <Chip key={topic} size="small" label={topic} sx={{backgroundColor: '#ffb74d33'}} />
      ))}
    </Stack>
  );
}

export default function MemoryVirtualizationDialogueSimulator() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <CEBlock
      title="Memory Virtualization — preview"
      subtitle="Step through the dialogue’s key ideas before base/bounds and paging."
    >
      <CEBlock.Section label={`${step + 1} / ${STEPS.length}`}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={1.5}>
          <Chip
            size="small"
            label={tagLabel(current.tag)}
            sx={{backgroundColor: tagColor(current.tag), color: '#fff', fontWeight: 700}}
          />
          <Typography variant="subtitle2" fontWeight={700}>
            {current.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({current.chapter})
          </Typography>
        </Stack>
        <Box mb={1.5}>
          <Diagram kind={current.diagram} />
        </Box>
        <Typography variant="body2" color="text.secondary" lineHeight={1.55}>
          {current.note}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <ColorLegend items={LEGEND} />
        <Box mt={1}>
          <StepControls step={step} max={STEPS.length - 1} onStep={setStep} label="Step" />
        </Box>
      </CEBlock.Section>
    </CEBlock>
  );
}

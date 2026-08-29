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
  {key: 'cpu', label: 'CPU busy', color: '#66bb6a', desc: 'Running a process'},
  {key: 'poll', label: 'Polling', color: '#ef5350', desc: 'Spinning on STATUS'},
  {key: 'dma', label: 'DMA copy', color: '#ab47bc', desc: 'Engine moves data'},
  {key: 'disk', label: 'Device busy', color: '#42a5f5', desc: 'I/O in progress'},
  {key: 'irq', label: 'Interrupt', color: '#ffb74d', desc: 'ISR wakes waiter'},
];

const SCENARIOS = {
  bus: {
    label: 'Hierarchy',
    subtitle: 'Faster buses are shorter/costlier — high-perf devices sit closer to the CPU.',
    steps: [
      {
        note: 'Classical: CPU↔memory bus → general I/O (PCI) → peripheral (SATA/USB) for slow devices.',
        tier: 'classic',
      },
      {
        note: 'Modern: CPU close to DRAM + graphics; DMI to I/O chip; PCIe NICs/NVMe; USB for keyboard/mouse.',
        tier: 'modern',
      },
    ],
  },
  protocol: {
    label: 'Protocol',
    subtitle: 'Canonical device: STATUS / COMMAND / DATA — poll, PIO write, command, poll done.',
    steps: [
      {
        note: 'While STATUS==BUSY spin. Then write DATA (PIO), write COMMAND, spin until not BUSY.',
        phase: 'poll-wait',
        bad: true,
      },
      {
        note: 'Works, but polling wastes CPU on slow devices. Prefer interrupt + sleep for long I/Os.',
        phase: 'done',
        tip: 'polling tax',
      },
    ],
  },
  irq: {
    label: 'Interrupts',
    subtitle: 'Issue I/O, sleep, run other work; device IRQ → ISR finishes and wakes the waiter.',
    steps: [
      {
        note: 'Without IRQ: CPU polls (p) while disk works — CPU wasted.',
        cpu: '1 1 1 p p p 1 1',
        disk: 'd d d',
        bad: true,
      },
      {
        note: 'With IRQ: run Process 2 while disk services Process 1 — overlap.',
        cpu: '1 1 1 2 2 2 1 1',
        disk: 'd d d',
        ok: true,
      },
      {
        note: 'Fast devices: polling may beat IRQ+switch cost. Hybrid: poll briefly, then interrupt. Coalesce IRQs under load; avoid receive livelock [MR96].',
        tip: 'poll vs IRQ vs hybrid',
      },
    ],
  },
  dma: {
    label: 'DMA',
    subtitle: 'Offload bulk copies from the CPU to a DMA engine; IRQ when the transfer completes.',
    steps: [
      {
        note: 'PIO: CPU copies words (c) to the device — can’t usefully run other work during the copy.',
        cpu: '1 1 c c c 2 2 1',
        bad: true,
      },
      {
        note: 'DMA: OS programs engine (addr, len, device); CPU runs Process 2 while DMA copies.',
        cpu: '1 1 2 2 2 2 1',
        dma: 'c c c',
        ok: true,
      },
    ],
  },
  driver: {
    label: 'Drivers',
    subtitle: 'Abstraction: FS → generic block → device driver. Most kernel LOC lives in drivers.',
    steps: [
      {
        note: 'Access: privileged in/out ports, or memory-mapped registers (load/store to device).',
        layer: 'hw iface',
      },
      {
        note: 'Linux stack: POSIX → FS → block layer → SCSI/ATA driver. Special features may be lost (generic EIO).',
        layer: 'stack',
      },
      {
        note: 'xv6 IDE: queue request, outb LBA/cmd, sleep; ide_intr reads data, wakeup, start next.',
        layer: 'ide',
        tip: 'ide_rw / ide_intr',
      },
    ],
  },
};

function Timeline({label, cells, colors}) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography variant="caption" sx={{width: 36, fontFamily: 'monospace'}}>
        {label}
      </Typography>
      {cells.split(/\s+/).filter(Boolean).map((c, i) => (
        <Chip
          key={`${label}-${i}`}
          size="small"
          label={c}
          sx={{
            bgcolor: colors[c] || '#e0e0e0',
            fontFamily: 'monospace',
            minWidth: 28,
          }}
        />
      ))}
    </Stack>
  );
}

const CELL = {
  '1': '#66bb6a',
  '2': '#81c784',
  p: '#ef5350',
  c: '#ab47bc',
  d: '#42a5f5',
};

export default function IoDevicesSimulator() {
  const [scenario, setScenario] = useState('bus');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="I/O devices"
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
      {scenario === 'bus' && (
        <Stack spacing={0.75}>
          {(cur.tier === 'classic'
            ? ['CPU + Memory bus', 'PCI / general I/O', 'SATA · USB peripherals']
            : ['CPU ↔ DRAM · Graphics', 'DMI → I/O chip', 'PCIe NIC/NVMe · eSATA · USB']
          ).map((row, i) => (
            <Box
              key={row}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: i === 0 ? '#c8e6c9' : i === 1 ? '#bbdefb' : '#ffe0b2',
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {row}
            </Box>
          ))}
        </Stack>
      )}
      {scenario === 'protocol' && (
        <Stack spacing={1}>
          <Chip
            label={cur.phase}
            sx={{bgcolor: cur.bad ? '#ef5350' : '#66bb6a', width: 'fit-content'}}
          />
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {(scenario === 'irq' || scenario === 'dma') && (
        <Stack spacing={1}>
          {cur.cpu && <Timeline label="CPU" cells={cur.cpu} colors={CELL} />}
          {cur.dma && <Timeline label="DMA" cells={cur.dma} colors={CELL} />}
          {cur.disk && <Timeline label="Disk" cells={cur.disk} colors={CELL} />}
          {cur.bad && <Chip color="error" size="small" label="CPU stuck on I/O path" />}
          {cur.ok && <Chip color="success" size="small" label="overlap / offload" />}
          {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} />}
        </Stack>
      )}
      {scenario === 'driver' && (
        <Stack spacing={1}>
          <Chip label={cur.layer} sx={{bgcolor: '#fff3e0', width: 'fit-content'}} />
          {cur.tip && <Chip size="small" color="primary" label={cur.tip} />}
        </Stack>
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

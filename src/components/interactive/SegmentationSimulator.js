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

const COLORS = {code: '#546e7a', heap: '#ab47bc', stack: '#26a69a', os: '#ef5350', free: '#e0e0e0'};

const LEGEND = [
  {key: 'code', label: 'Code', color: COLORS.code, desc: 'Segment 00 — read/execute'},
  {key: 'heap', label: 'Heap', color: COLORS.heap, desc: 'Segment 01 — grows positive'},
  {key: 'stack', label: 'Stack', color: COLORS.stack, desc: 'Segment 11 — grows negative'},
  {key: 'os', label: 'OS', color: COLORS.os, desc: 'Kernel reserved physical RAM'},
];

/** 14-bit VA: top 2 bits = segment, rest = offset. Heap starts at 4KB. */
/** Fig 16.3 — heap size 2K (chapter paste). */
const SEGMENTS = {
  0: {name: 'code', base: 32768, size: 2048, start: 0, grows: 1},
  1: {name: 'heap', base: 34816, size: 2048, start: 4096, grows: 1},
  3: {name: 'stack', base: 28672, size: 2048, start: 16384, grows: 0},
};

const SCENARIOS = {
  layout: {
    label: 'Sparse layout',
    subtitle: 'Fig 16.2 — only used segments occupy physical RAM; gap between stack and heap not allocated.',
    steps: [
      {
        note: 'Single base/bounds wastes physical memory on the unused virtual gap. Segmentation places code, heap, stack separately.',
        regions: [
          {label: 'OS', start: 0, end: 16384, color: COLORS.os},
          {label: 'Stack', start: 28672, end: 32768, color: COLORS.stack},
          {label: 'Code', start: 32768, end: 34816, color: COLORS.code},
          {label: 'Heap', start: 34816, end: 36864, color: COLORS.heap},
        ],
      },
      {
        note: 'Three base/bounds pairs in the MMU — one per logical segment.',
        table: [
          ['Code', '32 KB', '2 KB'],
          ['Heap', '34 KB', '2 KB'],
          ['Stack', '28 KB', '2 KB'],
        ],
      },
    ],
  },
  translate: {
    label: 'Translations',
    subtitle: 'Explicit segment: top 2 bits select register; offset checked against bounds.',
    steps: [
      {vaddr: 100, note: 'Virt 100 → segment 00 (code). Phys = 32768 + 100 = 32868.'},
      {vaddr: 4200, note: 'Virt 4200 → segment 01 (heap). Offset = 4200 − 4096 = 104 → phys 34920.'},
      {vaddr: 15360, note: 'Virt 15 KB → segment 11 (stack). Negative offset −1 KB → phys 27 KB.'},
      {vaddr: 7168, note: 'Virt 7 KB — past heap end → protection fault (segmentation fault).', fault: true},
    ],
  },
  external: {
    label: 'External fragmentation',
    subtitle: 'Fig 16.6 — variable-sized segments leave non-contiguous free holes; compaction is expensive.',
    steps: [
      {
        note: 'Physical memory full of allocated segments and small free holes — 24 KB free total but no contiguous 20 KB chunk.',
        fragmented: true,
      },
      {
        note: 'Compaction (copy segments together) fixes holes but is costly — and impossible if programs hold interior pointers.',
        compacted: true,
      },
    ],
  },
};

function segIndex(vaddr) {
  return (vaddr >> 12) & 0x3;
}

function translate(vaddr) {
  const segId = segIndex(vaddr);
  const seg = SEGMENTS[segId];
  if (!seg) {
    return {fault: true, reason: 'unused segment id 10'};
  }
  let offset = vaddr & 0xfff;
  if (!seg.grows) {
    offset = offset - 4096;
  }
  if (seg.grows && (offset < 0 || offset >= seg.size)) {
    return {fault: true, reason: 'out of bounds'};
  }
  if (!seg.grows && (offset > 0 || -offset > seg.size)) {
    return {fault: true, reason: 'out of bounds'};
  }
  return {fault: false, physical: seg.base + offset, seg: seg.name, offset};
}

function MemoryBar({regions}) {
  const max = 65536;
  return (
    <Box sx={{position: 'relative', height: 36, backgroundColor: '#fafafa', border: '1px solid #ccc', borderRadius: 1}}>
      {regions.map((r) => (
        <Box
          key={r.label}
          sx={{
            position: 'absolute',
            left: `${(r.start / max) * 100}%`,
            width: `${((r.end - r.start) / max) * 100}%`,
            top: 4,
            bottom: 4,
            backgroundColor: r.color,
            borderRadius: 0.5,
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          {r.label}
        </Box>
      ))}
    </Box>
  );
}

export default function SegmentationSimulator() {
  const [scenario, setScenario] = useState('translate');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  const switchScenario = (_, v) => {
    if (!v) return;
    setScenario(v);
    setStep(0);
  };

  const tr = current.vaddr != null ? translate(current.vaddr) : null;

  return (
    <CEBlock title="Segmentation" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small" sx={{flexWrap: 'wrap'}}>
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key} sx={{textTransform: 'none'}}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="Step">
        {current.regions && <MemoryBar regions={current.regions} />}
        {current.table && (
          <Box component="table" sx={{fontSize: 12, mt: 1, borderCollapse: 'collapse'}}>
            <tbody>
              {current.table.map(([a, b, c]) => (
                <tr key={a}>
                  <td style={{padding: '4px 8px', border: '1px solid #ddd'}}>{a}</td>
                  <td style={{padding: '4px 8px', border: '1px solid #ddd'}}>{b}</td>
                  <td style={{padding: '4px 8px', border: '1px solid #ddd'}}>{c}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
        {tr && (
          <Stack direction="row" spacing={1} alignItems="center" mt={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`virt ${current.vaddr}`} sx={{fontFamily: 'monospace'}} />
            {tr.fault || current.fault ? (
              <Chip size="small" label="SEGMENTATION FAULT" sx={{backgroundColor: '#ef5350', color: '#fff', fontWeight: 700}} />
            ) : (
              <>
                <Chip size="small" label={tr.seg} sx={{backgroundColor: COLORS[tr.seg], color: '#fff'}} />
                <Chip size="small" label={`phys ${tr.physical}`} sx={{backgroundColor: '#66bb6a', color: '#fff'}} />
              </>
            )}
          </Stack>
        )}
        {current.fragmented && (
          <MemoryBar
            regions={[
              {label: 'OS', start: 0, end: 8192, color: COLORS.os},
              {label: 'A', start: 8192, end: 16384, color: COLORS.code},
              {label: 'free 8K', start: 16384, end: 24576, color: COLORS.free},
              {label: 'B', start: 24576, end: 32768, color: COLORS.heap},
              {label: 'free 4K', start: 32768, end: 36864, color: COLORS.free},
              {label: 'C', start: 36864, end: 45056, color: COLORS.stack},
              {label: 'free 12K', start: 45056, end: 57344, color: COLORS.free},
            ]}
          />
        )}
        {current.compacted && (
          <MemoryBar
            regions={[
              {label: 'OS', start: 0, end: 8192, color: COLORS.os},
              {label: 'A+B+C', start: 8192, end: 32768, color: COLORS.code},
              {label: 'free', start: 32768, end: 65536, color: COLORS.free},
            ]}
          />
        )}
        <Typography variant="body2" mt={1.5} color="text.secondary" lineHeight={1.55}>
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

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
  {key: 'free', label: 'Free', color: '#66bb6a', desc: 'Available chunk on the free list'},
  {key: 'used', label: 'Used', color: '#546e7a', desc: 'Allocated to the application'},
  {key: 'pick', label: 'Chosen', color: '#ffb74d', desc: 'Chunk selected by the current policy'},
];

const SCENARIOS = {
  external: {
    label: 'External frag',
    subtitle: 'Intro figure — 20 bytes free in two 10-byte chunks; request for 15 fails.',
    steps: [
      {
        chunks: [
          {start: 0, len: 10, free: true},
          {start: 10, len: 10, free: false},
          {start: 20, len: 10, free: true},
        ],
        request: 15,
        note: 'Total free = 20, but no contiguous 15-byte chunk — external fragmentation.',
        fail: true,
      },
    ],
  },
  split: {
    label: 'Split',
    subtitle: 'Request 1 byte from a 10-byte free chunk — remainder stays on the list.',
    steps: [
      {
        chunks: [
          {start: 0, len: 10, free: true},
          {start: 10, len: 10, free: false},
          {start: 20, len: 10, free: true},
        ],
        list: 'head → (0,10) → (20,10)',
        note: 'Free list before allocation.',
      },
      {
        chunks: [
          {start: 0, len: 10, free: true},
          {start: 10, len: 10, free: false},
          {start: 20, len: 1, free: false},
          {start: 21, len: 9, free: true},
        ],
        list: 'head → (0,10) → (21,9)',
        note: 'malloc(1) from second chunk → return address 20; free entry becomes (21,9).',
      },
    ],
  },
  coalesce: {
    label: 'Coalesce',
    subtitle: 'Free middle chunk — merge adjacent free regions or the list lies about available space.',
    steps: [
      {
        chunks: [
          {start: 0, len: 10, free: true},
          {start: 10, len: 10, free: false},
          {start: 20, len: 10, free: true},
        ],
        list: 'head → (0,10) → (20,10)',
        note: 'Before free(10): free, used, free.',
      },
      {
        chunks: [
          {start: 0, len: 10, free: true},
          {start: 10, len: 10, free: true},
          {start: 20, len: 10, free: true},
        ],
        list: 'head → (10,10) → (0,10) → (20,10)  [no coalesce]',
        note: 'Naive free inserts middle without merging — three 10-byte holes; malloc(20) fails.',
      },
      {
        chunks: [{start: 0, len: 30, free: true}],
        list: 'head → (0,30)',
        note: 'Coalesce neighbors → one free extent; malloc(20) succeeds.',
      },
    ],
  },
  header: {
    label: 'Header',
    subtitle: 'Figs 17.1–17.4 — header before ptr; malloc(100) needs 108 bytes from the free list.',
    steps: [
      {
        note: 'ptr points past header {size, magic}. free(ptr) does hptr = ptr − sizeof(header).',
        diagram: 'header',
      },
      {
        note: '4 KB heap: one free node size 4088. malloc(100) + 8-byte header → allocate 108; free remains 3980.',
        diagram: 'alloc100',
      },
    ],
  },
  policy: {
    label: 'Policies',
    subtitle: 'Chapter example: free sizes 10, 30, 20 — request 15 under best / worst / first.',
    steps: [
      {
        sizes: [10, 30, 20],
        need: 15,
        pick: 2,
        policy: 'best',
        note: 'Best fit: smallest sufficient = 20 (index 2). Leftover free size 5.',
      },
      {
        sizes: [10, 30, 20],
        need: 15,
        pick: 1,
        policy: 'worst',
        note: 'Worst fit: largest = 30 (index 1). Leftover free size 15.',
      },
      {
        sizes: [10, 30, 20],
        need: 15,
        pick: 1,
        policy: 'first',
        note: 'First fit: first big enough is 30 — same pick as worst here, but stops early (cheaper search).',
      },
    ],
  },
  buddy: {
    label: 'Buddy',
    subtitle: 'Binary buddy — split 64 KB until 8 KB fits a 7 KB request; free coalesces buddies upward.',
    steps: [
      {
        buddy: [{label: '64 KB free', free: true}],
        note: 'Start with one 2^N free block (64 KB).',
      },
      {
        buddy: [
          {label: '32', free: true},
          {label: '32', free: true},
        ],
        note: 'Split 64 → two 32 KB buddies.',
      },
      {
        buddy: [
          {label: '16', free: true},
          {label: '16', free: true},
          {label: '32', free: true},
        ],
        note: 'Split left 32 → two 16 KB.',
      },
      {
        buddy: [
          {label: '8 used', free: false},
          {label: '8', free: true},
          {label: '16', free: true},
          {label: '32', free: true},
        ],
        note: 'Split left 16 → two 8 KB; allocate left 8 KB for a 7 KB request (1 KB internal waste).',
      },
      {
        buddy: [{label: '64 KB free', free: true}],
        note: 'On free: buddy free → coalesce to 16 → 32 → 64. Addresses of buddies differ by one bit.',
      },
    ],
  },
};

function HeapBar({chunks}) {
  const total = 30;
  return (
    <Box sx={{position: 'relative', height: 28, backgroundColor: '#fafafa', border: '1px solid #ccc', borderRadius: 1, mb: 1}}>
      {chunks.map((c) => (
        <Box
          key={`${c.start}-${c.len}`}
          sx={{
            position: 'absolute',
            left: `${(c.start / total) * 100}%`,
            width: `${(c.len / total) * 100}%`,
            top: 3,
            bottom: 3,
            backgroundColor: c.free ? '#66bb6a' : '#546e7a',
            borderRadius: 0.5,
            fontSize: 8,
            fontWeight: 700,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {c.len}
        </Box>
      ))}
      <Typography variant="caption" sx={{position: 'absolute', right: 4, bottom: -18, color: 'text.secondary'}}>
        0 — 30 bytes
      </Typography>
    </Box>
  );
}

function BuddyBar({blocks}) {
  return (
    <Stack direction="row" spacing={0.5} sx={{mb: 1}}>
      {blocks.map((b, i) => (
        <Box
          key={`${b.label}-${i}`}
          sx={{
            flex: b.label.includes('64') ? 4 : b.label.includes('32') ? 2 : 1,
            py: 1,
            px: 0.5,
            backgroundColor: b.free ? '#66bb6a' : '#546e7a',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            textAlign: 'center',
            borderRadius: 0.5,
          }}
        >
          {b.label}
        </Box>
      ))}
    </Stack>
  );
}

export default function FreeSpaceSimulator() {
  const [scenario, setScenario] = useState('policy');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  const switchScenario = (_, v) => {
    if (!v) return;
    setScenario(v);
    setStep(0);
  };

  return (
    <CEBlock title="Free-Space Management" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small" sx={{flexWrap: 'wrap'}}>
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key} sx={{textTransform: 'none'}}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="Heap">
        {current.chunks && <HeapBar chunks={current.chunks} />}
        {current.buddy && <BuddyBar blocks={current.buddy} />}
        {current.diagram === 'header' && (
          <Stack direction="row" spacing={0} sx={{mb: 1, fontFamily: 'monospace', fontSize: 11}}>
            <Box sx={{px: 1, py: 1, backgroundColor: '#ab47bc', color: '#fff', borderRadius: '4px 0 0 4px'}}>
              size · magic
            </Box>
            <Box sx={{px: 2, py: 1, backgroundColor: '#546e7a', color: '#fff', borderRadius: '0 4px 4px 0'}}>
              ← ptr · N user bytes →
            </Box>
          </Stack>
        )}
        {current.diagram === 'alloc100' && (
          <Stack spacing={0.5} sx={{mb: 1, fontFamily: 'monospace', fontSize: 11}}>
            <Box sx={{p: 1, backgroundColor: '#546e7a', color: '#fff', borderRadius: 1}}>
              header(8) + 100 bytes allocated
            </Box>
            <Box sx={{p: 1, backgroundColor: '#66bb6a', color: '#fff', borderRadius: 1}}>
              free node size 3980
            </Box>
          </Stack>
        )}
        {current.request && (
          <Chip
            size="small"
            label={current.fail ? `malloc(${current.request}) → NULL` : `malloc(${current.request})`}
            color={current.fail ? 'error' : 'success'}
            sx={{mb: 1}}
          />
        )}
        {current.list && (
          <Typography variant="caption" display="block" fontFamily="monospace" mb={1}>
            {current.list}
          </Typography>
        )}
        {current.sizes && (
          <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
            {current.sizes.map((len, i) => (
              <Chip
                key={`${len}-${i}`}
                size="small"
                label={`free ${len}`}
                sx={{
                  backgroundColor: i === current.pick ? '#ffb74d' : '#66bb6a',
                  color: '#fff',
                  fontWeight: 700,
                }}
              />
            ))}
            <Chip size="small" variant="outlined" label={`${current.policy}: need ${current.need}`} />
          </Stack>
        )}
        <Typography variant="body2" color="text.secondary" lineHeight={1.55}>
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

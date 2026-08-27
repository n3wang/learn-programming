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

const TRACE = [0, 1, 2, 0, 1, 3, 0, 3, 1, 2, 1];

const LEGEND = [
  {key: 'hit', label: 'Hit', color: '#66bb6a', desc: 'Page already in the cache'},
  {key: 'miss', label: 'Miss', color: '#ef5350', desc: 'Fetch from disk (or cold start)'},
  {key: 'evict', label: 'Evict', color: '#ffb74d', desc: 'Victim chosen by the policy'},
  {key: 'ref', label: 'Referenced', color: '#42a5f5', desc: 'Use bit set (Clock)'},
];

/** Fig 22.1 Optimal — cache size 3 */
const OPT_STEPS = [
  {access: 0, hit: false, cache: [0], note: 'Cold miss → load 0.'},
  {access: 1, hit: false, cache: [0, 1], note: 'Cold miss → load 1.'},
  {access: 2, hit: false, cache: [0, 1, 2], note: 'Cold miss → load 2. Cache full.'},
  {access: 0, hit: true, cache: [0, 1, 2], note: 'Hit on 0.'},
  {access: 1, hit: true, cache: [0, 1, 2], note: 'Hit on 1.'},
  {
    access: 3,
    hit: false,
    evict: 2,
    cache: [0, 1, 3],
    note: 'Miss on 3. Future: 0 soon, 1 later, 2 furthest → evict 2 (OPT).',
  },
  {access: 0, hit: true, cache: [0, 1, 3], note: 'Hit on 0.'},
  {access: 3, hit: true, cache: [0, 1, 3], note: 'Hit on 3.'},
  {access: 1, hit: true, cache: [0, 1, 3], note: 'Hit on 1.'},
  {
    access: 2,
    hit: false,
    evict: 3,
    cache: [0, 1, 2],
    note: 'Miss on 2. Keep 1 (next); evict 3 (0 also fine).',
  },
  {access: 1, hit: true, cache: [0, 1, 2], note: 'Hit on 1. OPT: 6 hits / 5 misses ≈ 54.5%.'},
];

/** Fig 22.2 FIFO — first-in on the left */
const FIFO_STEPS = [
  {access: 0, hit: false, cache: [0], note: 'Cold → [0]. First-in = 0.'},
  {access: 1, hit: false, cache: [0, 1], note: 'Cold → [0, 1].'},
  {access: 2, hit: false, cache: [0, 1, 2], note: 'Cold → [0, 1, 2].'},
  {access: 0, hit: true, cache: [0, 1, 2], note: 'Hit on 0 (still first-in).'},
  {access: 1, hit: true, cache: [0, 1, 2], note: 'Hit on 1.'},
  {
    access: 3,
    hit: false,
    evict: 0,
    cache: [1, 2, 3],
    note: 'Miss on 3 → evict first-in 0. Next access is 0 — oops.',
  },
  {
    access: 0,
    hit: false,
    evict: 1,
    cache: [2, 3, 0],
    note: 'Miss on 0 → evict 1. FIFO ignores importance.',
  },
  {access: 3, hit: true, cache: [2, 3, 0], note: 'Hit on 3.'},
  {
    access: 1,
    hit: false,
    evict: 2,
    cache: [3, 0, 1],
    note: 'Miss on 1 → evict 2.',
  },
  {
    access: 2,
    hit: false,
    evict: 3,
    cache: [0, 1, 2],
    note: 'Miss on 2 → evict 3. FIFO hit rate ≈ 36.4%.',
  },
  {access: 1, hit: true, cache: [0, 1, 2], note: 'Hit on 1.'},
];

/** Fig 22.5 LRU — LRU end shown left in book; we show MRU on the right */
const LRU_STEPS = [
  {access: 0, hit: false, cache: [0], note: 'Cold → [0].'},
  {access: 1, hit: false, cache: [0, 1], note: 'Cold → [0, 1].'},
  {access: 2, hit: false, cache: [0, 1, 2], note: 'Cold → [0, 1, 2].'},
  {access: 0, hit: true, cache: [1, 2, 0], note: 'Hit 0 → move to MRU. Order LRU→MRU: 1,2,0.'},
  {access: 1, hit: true, cache: [2, 0, 1], note: 'Hit 1 → MRU. LRU→MRU: 2,0,1.'},
  {
    access: 3,
    hit: false,
    evict: 2,
    cache: [0, 1, 3],
    note: 'Miss 3 → evict LRU 2 (0 and 1 more recent).',
  },
  {access: 0, hit: true, cache: [1, 3, 0], note: 'Hit 0 → MRU.'},
  {access: 3, hit: true, cache: [1, 0, 3], note: 'Hit 3 → MRU.'},
  {access: 1, hit: true, cache: [0, 3, 1], note: 'Hit 1 → MRU. LRU→MRU: 0,3,1.'},
  {
    access: 2,
    hit: false,
    evict: 0,
    cache: [3, 1, 2],
    note: 'Miss 2 → evict LRU 0. Matches OPT on this cooked trace.',
  },
  {access: 1, hit: true, cache: [3, 2, 1], note: 'Hit 1. LRU ≈ OPT here (6 hits).'},
];

/** Clock / use-bit walk (illustrative) */
const CLOCK_STEPS = [
  {
    pages: [
      {id: 0, use: 1},
      {id: 1, use: 1},
      {id: 2, use: 0},
      {id: 3, use: 1},
    ],
    hand: 0,
    note: 'Circular list; hand at page 0. Use bits set by hardware on reference.',
  },
  {
    pages: [
      {id: 0, use: 0},
      {id: 1, use: 1},
      {id: 2, use: 0},
      {id: 3, use: 1},
    ],
    hand: 1,
    note: 'Page 0 use=1 → clear to 0, advance hand (recently used — keep).',
  },
  {
    pages: [
      {id: 0, use: 0},
      {id: 1, use: 0},
      {id: 2, use: 0},
      {id: 3, use: 1},
    ],
    hand: 2,
    note: 'Page 1 use=1 → clear, advance.',
  },
  {
    pages: [
      {id: 0, use: 0},
      {id: 1, use: 0},
      {id: 2, use: 0},
      {id: 3, use: 1},
    ],
    hand: 2,
    victim: 2,
    note: 'Page 2 use=0 → victim. Approximate LRU without a full timestamp scan.',
  },
];

const SCENARIOS = {
  opt: {
    label: 'Optimal',
    subtitle: 'Fig 22.1 — replace the page used furthest in the future (MIN). Trace: 0,1,2,0,1,3,0,3,1,2,1.',
    steps: OPT_STEPS,
  },
  fifo: {
    label: 'FIFO',
    subtitle: 'Fig 22.2 — evict first-in. Simple, but ignores importance (and Belady’s anomaly).',
    steps: FIFO_STEPS,
  },
  lru: {
    label: 'LRU',
    subtitle: 'Fig 22.5 — evict least-recently-used. Uses temporal locality; matches OPT on this trace.',
    steps: LRU_STEPS,
  },
  clock: {
    label: 'Clock',
    subtitle: 'Approximate LRU with a use (reference) bit and a sweeping hand [C69].',
    steps: CLOCK_STEPS,
  },
};

function CacheSlots({cache, evict, access, hit}) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Access VPN <strong>{access}</strong> → {hit ? 'HIT' : 'MISS'}
        {evict !== undefined ? ` · evict ${evict}` : ''}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {(cache || []).map((p) => {
          const isEvict = evict === p;
          const isAccess = p === access;
          const bg = isEvict ? '#ffb74d' : isAccess ? (hit ? '#66bb6a' : '#ef5350') : '#eceff1';
          return (
            <Box
              key={`${p}-${cache.join('-')}`}
              sx={{
                minWidth: 48,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                bgcolor: bg,
                textAlign: 'center',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              {p}
            </Box>
          );
        })}
        {(!cache || cache.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            (empty)
          </Typography>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Cache (left = older / LRU side for LRU view)
      </Typography>
    </Stack>
  );
}

function ClockRing({pages, hand, victim}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {pages.map((p, i) => {
        const isHand = hand === i;
        const isVictim = victim === p.id;
        return (
          <Box
            key={p.id}
            sx={{
              width: 72,
              p: 1,
              borderRadius: 1,
              border: isHand ? '2px solid #1976d2' : '1px solid #cfd8dc',
              bgcolor: isVictim ? '#ffb74d' : p.use ? '#42a5f5' : '#eceff1',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" display="block">
              {isHand ? '✋' : ' '} P{p.id}
            </Typography>
            <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
              use={p.use}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}

function TraceBar({steps, step}) {
  const policySteps = steps.filter((s) => s.access !== undefined);
  if (policySteps.length === 0) return null;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{mb: 1}}>
      {TRACE.map((vpn, i) => {
        const done = i <= step && policySteps[i];
        const hit = done && policySteps[i].hit;
        return (
          <Chip
            key={i}
            size="small"
            label={vpn}
            sx={{
              bgcolor: !done ? '#eee' : hit ? '#c8e6c9' : '#ffcdd2',
              fontFamily: 'monospace',
            }}
          />
        );
      })}
    </Stack>
  );
}

export default function PageReplacementSimulator() {
  const [scenario, setScenario] = useState('opt');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Page replacement policies"
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
      {scenario !== 'clock' && <TraceBar steps={cfg.steps} step={step} />}
      {scenario === 'clock' ? (
        <ClockRing pages={cur.pages} hand={cur.hand} victim={cur.victim} />
      ) : (
        <CacheSlots
          cache={cur.cache}
          evict={cur.evict}
          access={cur.access}
          hit={cur.hit}
        />
      )}
      <Typography variant="body2" sx={{mt: 1.5}}>
        {cur.note}
      </Typography>
    </CEBlock>
  );
}

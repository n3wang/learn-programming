import React, {useMemo, useState} from 'react';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/** Article example: a = 1..9, ∘ = +, block size 3. */
const A = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const B = 3;

const BETWEEN = [
  [6, 21, 45],
  [0, 15, 39],
  [0, 0, 24],
];

const MODES = {
  build: {label: 'Build blocks'},
  query: {label: 'Cross-block query'},
  tree: {label: 'Recurse / height'},
};

const LEGEND = [
  {key: 'S', label: 'Suffix piece', color: '#0288d1', desc: 'End of first partial block'},
  {key: 'M', label: 'Between blocks', color: '#2e7d32', desc: 'Full middle blocks via between[i][j]'},
  {key: 'P', label: 'Prefix piece', color: '#ef6c00', desc: 'Start of last partial block'},
  {key: 'Q', label: 'Query range', color: '#6a1b9a', desc: 'Asked [l, r]'},
];

function buildFrames(mode) {
  if (mode === 'build') {
    return [
      {
        highlight: null,
        msg: 'Divide a[0..8]={1..9} into √n=3 blocks of size 3: {1,2,3}, {4,5,6}, {7,8,9}.',
      },
      {
        highlight: {block: 0},
        msg: 'Block 0: prefixOp={1,3,6}, suffixOp={6,5,3} (sums from start / to end).',
      },
      {
        highlight: {block: 1},
        msg: 'Block 1: prefixOp={4,9,15}, suffixOp={15,11,6}.',
      },
      {
        highlight: {block: 2},
        msg: 'Block 2: prefixOp={7,15,24}, suffixOp={24,17,9}.',
      },
      {
        highlight: {between: true},
        msg: 'between[i][j] = fold of full blocks i..j. E.g. between[0][2]=45, between[1][2]=39. Size O(n).',
      },
    ];
  }

  if (mode === 'query') {
    // query [1,7]: suffix from idx1 in block0 = 2+3=5, between blocks 1..1 = 15,
    // prefix through idx7 in block2 = 7+8=15 → 35
    // mid highlight uses block ids [1,1] → indices 3..5
    return [
      {
        l: 1,
        r: 7,
        parts: null,
        msg: 'Query q(1,7) spans multiple blocks → suffix + between + prefix.',
      },
      {
        l: 1,
        r: 7,
        parts: {suf: [1, 2], mid: [1, 1], pref: [6, 7]},
        msg: 'suffixOp in block 0 from index 1 → 5; between[1][1]=15; prefixOp in block 2 through index 7 → 15.',
      },
      {
        l: 1,
        r: 7,
        parts: {suf: [1, 2], mid: [1, 1], pref: [6, 7]},
        ans: 35,
        msg: 'op(5, 15, 15) = 35. In-block queries need the recursive structure (or size ≤ 2 leaves).',
      },
    ];
  }

  // tree height
  return [
    {
      sizes: [9],
      msg: 'Root covers length k=9. Children have length ≈ √k.',
    },
    {
      sizes: [9, 3],
      msg: 'Layer 1: blocks of length 3. Still > 2 → recurse.',
    },
    {
      sizes: [9, 3, 1],
      msg: 'Layer 2: length 1–2 leaves. Height O(log log n) because log k halves each √ step.',
    },
    {
      sizes: [9, 3, 1],
      msg: 'Each element appears once per layer → build/memory O(n log log n). Naive descend → O(log log n)/query.',
    },
    {
      sizes: [9, 3, 1],
      msg: 'Pad to 2ᵐ, equal power-of-two blocks: pick layer from highest bit of l⊕r → O(1) queries.',
    },
  ];
}

export default function SqrtTreeSimulator() {
  const [mode, setMode] = useState('build');
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const cellBg = (idx) => {
    if (frame.parts) {
      if (idx >= frame.parts.suf[0] && idx <= frame.parts.suf[1]) return '#81d4fa';
      if (frame.parts.mid && idx >= frame.parts.mid[0] * B && idx < (frame.parts.mid[1] + 1) * B)
        return '#a5d6a7';
      if (idx >= frame.parts.pref[0] && idx <= frame.parts.pref[1]) return '#ffcc80';
    }
    if (frame.l != null && idx >= frame.l && idx <= frame.r) return '#e1bee7';
    if (frame.highlight && frame.highlight.block != null) {
      const b = frame.highlight.block;
      if (idx >= b * B && idx < (b + 1) * B) return '#81d4fa';
    }
    return '#eceff1';
  };

  return (
    <CEBlock
      title="Sqrt tree (one level + recursion idea)"
      subtitle="prefixOp / suffixOp / between, then recurse inside blocks for O(1) associative folds."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Mode">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Object.entries(MODES).map(([k, v]) => (
            <Chip
              key={k}
              size="small"
              label={v.label}
              color={mode === k ? 'primary' : 'default'}
              onClick={() => {
                setMode(k);
                setStep(0);
              }}
            />
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Array">
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {A.map((v, idx) => (
            <Chip
              key={idx}
              size="small"
              label={`${idx}:${v}`}
              sx={{bgcolor: cellBg(idx), fontFamily: 'monospace'}}
            />
          ))}
        </Stack>
        {frame.highlight && frame.highlight.between && (
          <Typography variant="body2" sx={{mt: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
            {`between =\n  ${BETWEEN.map((row) => `[${row.join(', ')}]`).join('\n  ')}`}
          </Typography>
        )}
        {frame.ans != null && (
          <Typography variant="body2" sx={{mt: 1, fontFamily: 'monospace'}}>
            answer = {frame.ans}
          </Typography>
        )}
        {frame.sizes && (
          <Typography variant="body2" sx={{mt: 1, fontFamily: 'monospace'}}>
            lengths: {frame.sizes.join(' → ')}
          </Typography>
        )}
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

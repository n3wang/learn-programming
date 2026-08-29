import React, {useMemo, useState} from 'react';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const MODES = {
  nonneg: {label: 'xᵢ ≥ 0'},
  positive: {label: 'xᵢ ≥ 1'},
  lower: {label: 'xᵢ ≥ aᵢ'},
};

const LEGEND = [
  {key: 'S', label: 'Star ★', color: '#f9a825', desc: 'One identical object / unit of sum'},
  {key: 'B', label: 'Bar |', color: '#455a64', desc: 'Separator between labeled boxes'},
  {key: 'E', label: 'Empty box', color: '#ef9a9a', desc: 'Two bars with nothing between'},
];

function binom(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i += 1) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

function buildFrames(mode) {
  if (mode === 'nonneg') {
    // n=5 objects, k=4 boxes: ★|★★||★★  → (1,2,0,2)
    return [
      {
        pattern: null,
        boxes: null,
        msg: 'Theorem: n identical objects into k labeled boxes → C(n+k−1, n).',
      },
      {
        pattern: ['★', '|', '★', '★', '|', '|', '★', '★'],
        boxes: [1, 2, 0, 2],
        msg: 'Example: ★|★★||★★ means boxes (1, 2, 0, 2). n=5 stars, k−1=3 bars.',
      },
      {
        pattern: ['★', '★', '★', '★', '★', '|', '|', '|'],
        boxes: [5, 0, 0, 0],
        msg: 'Every placement of 3 bars among 8 positions (or choose 5 of 8 for stars) is a partition.',
      },
      {
        pattern: null,
        boxes: null,
        formula: 'C(5+4-1, 5) = C(8,5) = 56',
        msg: 'Count = C(n+k−1, n) = C(8,5) = 56. Same as non-negative solutions to x₁+…+x₄=5.',
      },
    ];
  }

  if (mode === 'positive') {
    // n=5, k=3, xi≥1: place 2 bars in 4 gaps between 5 stars
    return [
      {
        pattern: ['★', '★', '★', '★', '★'],
        gaps: true,
        msg: 'Positive: xᵢ ≥ 1. Place n stars in a row — bars may sit only in the n−1 gaps (no empty box).',
      },
      {
        pattern: ['★', '|', '★', '★', '|', '★', '★'],
        boxes: [1, 2, 2],
        msg: 'Choose k−1 of the n−1 gaps: ★|★★|★★ → (1,2,2). Count = C(n−1, k−1).',
      },
      {
        pattern: null,
        formula: 'C(5-1, 3-1) = C(4,2) = 6',
        msg: 'For n=5, k=3: C(4,2)=6. Equivalently set yᵢ=xᵢ−1≥0 so Σy=n−k → C((n−k)+k−1, n−k).',
      },
    ];
  }

  // lower bounds a = (1,0,2), n=6, k=3 → n' = 6-1-0-2=3, C(3+3-1,3)=10
  return [
    {
      msg: 'Lower bounds xᵢ ≥ aᵢ. Substitute xᵢ′ = xᵢ − aᵢ ≥ 0.',
    },
    {
      a: [1, 0, 2],
      n: 6,
      msg: 'Example: x₁+x₂+x₃=6 with x≥(1,0,2). Remaining mass n−Σa = 6−3 = 3.',
    },
    {
      a: [1, 0, 2],
      n: 6,
      formula: "C(3+3-1, 3) = C(5,3) = 10",
      msg: 'Reduce to x₁′+x₂′+x₃′=3, x′≥0 → C(3+3−1, 3)=10.',
    },
    {
      msg: 'Upper bounds need Inclusion–Exclusion (see the linked IE article on CP-Algorithms).',
    },
  ];
}

export default function StarsAndBarsSimulator() {
  const [mode, setMode] = useState('nonneg');
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Stars and bars"
      subtitle="Identical objects into labeled boxes ↔ binomial coefficients."
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

      {frame.pattern && (
        <CEBlock.Section label="Diagram">
          <Typography
            variant="h5"
            sx={{letterSpacing: 2, fontFamily: 'monospace', textAlign: 'center'}}
          >
            {frame.pattern.join(' ')}
          </Typography>
          {frame.boxes && (
            <Typography variant="body2" sx={{mt: 1, fontFamily: 'monospace', textAlign: 'center'}}>
              boxes = ({frame.boxes.join(', ')})
            </Typography>
          )}
          {frame.gaps && (
            <Typography variant="caption" display="block" sx={{mt: 1, textAlign: 'center'}}>
              gaps between stars: place at most one bar each
            </Typography>
          )}
        </CEBlock.Section>
      )}

      {frame.formula && (
        <CEBlock.Section label="Count">
          <Typography variant="body2" sx={{fontFamily: 'monospace'}}>
            {frame.formula}
            {frame.formula.includes('C(8,5)') && ` (check ${binom(8, 5)})`}
            {frame.formula.includes('C(4,2)') && ` (check ${binom(4, 2)})`}
            {frame.formula.includes('C(5,3)') && ` (check ${binom(5, 3)})`}
          </Typography>
        </CEBlock.Section>
      )}

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

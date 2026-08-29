/**
 * TEMPLATE — copy this file, rename it, and fill in the TODOs.
 *
 * Patterns:
 *  - Step-through simulator  → keep StepControls, build a diagram section
 *  - State machine           → render nodes + arrows, highlight current state
 *  - Hierarchy / pyramid     → map over LEVELS with proportional widths
 *  - Table / timeline        → CSS grid with row = entity, col = time slot
 *
 * Delete this comment block before shipping.
 */

import React, { useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

// ─── 1. Define your data ─────────────────────────────────────────────────────
//
// Each item needs at minimum: key, label, color.
// Add a `desc` string to get a tooltip on hover.

const ITEMS = [
  { key: 'A', label: 'Item A', color: '#4fc3f7', desc: 'Explain what A does.' },
  { key: 'B', label: 'Item B', color: '#81c784', desc: 'Explain what B does.' },
  { key: 'C', label: 'Item C', color: '#ffb74d' },
];

// ─── 2. Define steps (for step-through simulators) ───────────────────────────
//
// Each step is a snapshot of what's happening.

const STEPS = [
  { label: 'Initial state', active: ['A'],      detail: 'We start by doing A.' },
  { label: 'Transition',    active: ['A', 'B'], detail: 'A and B are both active.' },
  { label: 'Final state',   active: ['C'],      detail: 'Only C remains.' },
];

// ─── 3. Build the component ───────────────────────────────────────────────────

export default function MyTopicSimulator() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <CEBlock
      title="TODO: Simulator Title"
      subtitle="TODO: One sentence explaining what this demonstrates"
    >
      {/* Main visualization */}
      <CEBlock.Section label="Visualization">
        {/* TODO: Replace this placeholder with your actual diagram/animation */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {ITEMS.map(item => (
            <Chip
              key={item.key}
              label={item.label}
              size="small"
              sx={{
                backgroundColor: current.active.includes(item.key) ? item.color : 'grey.200',
                fontWeight: current.active.includes(item.key) ? 700 : 400,
                transition: 'all 0.25s',
              }}
            />
          ))}
        </Stack>
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          <strong>{current.label}:</strong> {current.detail}
        </Typography>
      </CEBlock.Section>

      {/* Legend */}
      <CEBlock.Section label="Legend">
        <ColorLegend items={ITEMS} />
      </CEBlock.Section>

      {/* Step controls */}
      <StepControls
        step={step}
        max={STEPS.length - 1}
        onStep={setStep}
        label="Step"
      />
    </CEBlock>
  );
}

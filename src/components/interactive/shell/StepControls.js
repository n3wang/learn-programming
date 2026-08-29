import React from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';

/**
 * Reusable prev / next / reset control bar for step-through simulators.
 *
 * Props:
 *   step       {number}   current 0-based step index
 *   max        {number}   last valid step index (inclusive)
 *   onStep     {fn}       called with the new step index
 *   label      {string}   singular noun shown in counter, e.g. "Cycle" → "Cycle 3 of 9"
 *   stepSize   {number}   how many steps prev/next moves (default 1)
 *
 * Usage:
 *   const [step, setStep] = useState(0);
 *   <StepControls step={step} max={MAX - 1} onStep={setStep} label="Cycle" />
 */
export default function StepControls({ step, max, onStep, label = 'Step', stepSize = 1 }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Button
        variant="outlined"
        size="small"
        onClick={() => onStep(0)}
        disabled={step === 0}
      >
        Reset
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={() => onStep(Math.max(0, step - stepSize))}
        disabled={step === 0}
      >
        ← Prev
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={() => onStep(Math.min(max, step + stepSize))}
        disabled={step === max}
      >
        Next →
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
        {label} {step + 1} of {max + 1}
      </Typography>
    </Stack>
  );
}

import React, {useMemo, useState} from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

/**
 * Nodes: 0(head)-1-2-3-4-5→3 (cycle entry C=3, meet later at some G).
 * Layout roughly linear then loop.
 */
const NODES = [
  {id: 0, x: 40, y: 80, label: 'H'},
  {id: 1, x: 110, y: 80},
  {id: 2, x: 180, y: 80},
  {id: 3, x: 250, y: 80, label: 'C'},
  {id: 4, x: 320, y: 80},
  {id: 5, x: 320, y: 150},
];
// next pointers
const NEXT = [1, 2, 3, 4, 5, 3];

const LEGEND = [
  {key: 'S', label: 'Slow (tortoise)', color: '#2e7d32', desc: 'Advances 1 step'},
  {key: 'F', label: 'Fast (hare)', color: '#ef6c00', desc: 'Advances 2 steps'},
  {key: 'C', label: 'Cycle entry C', color: '#6a1b9a', desc: 'Start of the loop'},
  {key: 'G', label: 'First meet G', color: '#c62828', desc: 'Where slow==fast in phase 1'},
];

function buildFrames() {
  const frames = [];
  let slow = 0;
  let fast = 0;

  frames.push({
    phase: 1,
    slow,
    fast,
    meet: null,
    msg: 'Phase 1: detect a cycle. Both pointers start at head. Slow +1, fast +2.',
  });

  // Simulate until meet
  for (let iter = 0; iter < 20; iter += 1) {
    if (NEXT[fast] == null || NEXT[NEXT[fast]] == null) break;
    slow = NEXT[slow];
    fast = NEXT[NEXT[fast]];
    frames.push({
      phase: 1,
      slow,
      fast,
      meet: slow === fast ? slow : null,
      msg:
        slow === fast
          ? `slow == fast at node ${slow} (G). Cycle exists.`
          : `Move: slow → ${slow}, fast → ${fast}.`,
    });
    if (slow === fast) break;
  }

  const meet = slow;
  frames.push({
    phase: 2,
    slow: 0,
    fast: meet,
    meet,
    msg: `Phase 2: reset slow to head. Keep fast at G=${meet}. Both move +1.`,
  });

  slow = 0;
  fast = meet;
  for (let iter = 0; iter < 20; iter += 1) {
    if (slow === fast) break;
    slow = NEXT[slow];
    fast = NEXT[fast];
    frames.push({
      phase: 2,
      slow,
      fast,
      meet,
      msg:
        slow === fast
          ? `They meet at node ${slow} = C, the cycle entry.`
          : `Both +1: slow → ${slow}, fast → ${fast}.`,
    });
  }

  return frames;
}

function nodePos(id) {
  return NODES.find((n) => n.id === id);
}

export default function FloydCycleSimulator() {
  const frames = useMemo(() => buildFrames(), []);
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <CEBlock
      title="Floyd: tortoise & hare"
      subtitle="Detect the cycle, then reset slow to head to find entry C."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={frames.length - 1} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="List (5 → 3 closes the loop)">
        <svg width={380} height={200} style={{display: 'block', maxWidth: '100%'}}>
          {/* edges */}
          {NEXT.map((to, from) => {
            if (to == null) return null;
            const a = nodePos(from);
            const b = nodePos(to);
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#90a4ae"
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#90a4ae" />
            </marker>
          </defs>
          {NODES.map((n) => {
            const isSlow = frame.slow === n.id;
            const isFast = frame.fast === n.id;
            let fill = '#eceff1';
            if (n.id === 3) fill = '#e1bee7';
            if (frame.meet === n.id && frame.phase === 1) fill = '#ffcdd2';
            if (isSlow && isFast) fill = '#fff59d';
            else if (isSlow) fill = '#a5d6a7';
            else if (isFast) fill = '#ffcc80';
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={18} fill={fill} stroke="#455a64" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fontWeight="700">
                  {n.label || n.id}
                </text>
              </g>
            );
          })}
        </svg>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" color="success" label={`slow @ ${frame.slow}`} />
          <Chip size="small" color="warning" label={`fast @ ${frame.fast}`} />
          <Chip size="small" label={`phase ${frame.phase}`} />
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}

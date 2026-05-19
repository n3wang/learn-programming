import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import CEBlock from '@site/src/components/ce/CEBlock';
import StepControls from '@site/src/components/ce/StepControls';
import ColorLegend from '@site/src/components/ce/ColorLegend';

// ─── Data ────────────────────────────────────────────────────────────────────

const STAGES = [
  { key: 'IF',  label: 'Instruction Fetch',  color: '#4fc3f7', desc: 'Reads the instruction at the Program Counter (PC). PC is incremented.' },
  { key: 'ID',  label: 'Instruction Decode', color: '#81c784', desc: 'Decodes the opcode. Reads source register values from the register file.' },
  { key: 'EX',  label: 'Execute (ALU)',       color: '#ffb74d', desc: 'ALU performs arithmetic/logic, or calculates the effective memory address.' },
  { key: 'MEM', label: 'Memory Access',       color: '#e57373', desc: 'Loads read data memory; stores write it. ALU results pass through unchanged.' },
  { key: 'WB',  label: 'Write Back',          color: '#ce93d8', desc: 'Writes the computed result back to the destination register.' },
];

const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.key, s]));

const INSTRUCTIONS = [
  { name: 'ADD R1, R2, R3' },
  { name: 'LW  R4, 0(R1)'  },
  { name: 'SUB R5, R4, R2' },
  { name: 'SW  R5, 4(R1)'  },
  { name: 'BEQ R1, R0, +8' },
];

const MAX_CYCLES = INSTRUCTIONS.length + STAGES.length - 1; // 9

function getStageKey(instrIdx, cycleIdx) {
  const si = cycleIdx - instrIdx;
  return si >= 0 && si < STAGES.length ? STAGES[si].key : null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CpuPipelineSimulator() {
  const [cycle, setCycle] = useState(0);

  return (
    <CEBlock
      title="CPU Pipeline Simulator"
      subtitle="Step through clock cycles to watch instructions flow through IF → ID → EX → MEM → WB"
    >
      {/* Space-Time Diagram */}
      <CEBlock.Section label="Space-Time Diagram">
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `150px repeat(${MAX_CYCLES}, 52px)`,
            gap: '4px',
            alignItems: 'center',
          }}>
            <Box />
            {Array.from({ length: MAX_CYCLES }, (_, c) => (
              <Box key={c} sx={{
                textAlign: 'center',
                fontSize: 11,
                fontWeight: c === cycle ? 700 : 400,
                color: c === cycle ? 'primary.main' : 'text.secondary',
                pb: '2px',
                borderBottom: c === cycle ? '2px solid' : '1px solid #e0e0e0',
                borderColor: c === cycle ? 'primary.main' : '#e0e0e0',
              }}>
                CC{c + 1}
              </Box>
            ))}

            {INSTRUCTIONS.map((instr, i) => (
              <React.Fragment key={i}>
                <Typography variant="caption" sx={{
                  fontFamily: 'monospace', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis', pr: 1, fontSize: 11,
                }}>
                  {instr.name}
                </Typography>
                {Array.from({ length: MAX_CYCLES }, (_, c) => {
                  const key = getStageKey(i, c);
                  const stage = key ? STAGE_MAP[key] : null;
                  const isActive = c === cycle;
                  return (
                    <Tooltip key={c} title={stage ? `${stage.label}: ${stage.desc}` : ''} arrow disableHoverListener={!stage}>
                      <Box sx={{
                        height: 30, borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        backgroundColor: stage ? stage.color : (isActive ? '#f5f5f5' : 'transparent'),
                        opacity: stage ? (isActive ? 1 : 0.45) : 1,
                        border: isActive && stage ? '2px solid #333' : 'none',
                        cursor: stage ? 'help' : 'default',
                        transition: 'opacity 0.25s',
                      }}>
                        {key || ''}
                      </Box>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </CEBlock.Section>

      {/* Active stages */}
      <CEBlock.Section label={`Clock Cycle ${cycle + 1} — Active Stages`}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {INSTRUCTIONS.map((instr, i) => {
            const key = getStageKey(i, cycle);
            const stage = key ? STAGE_MAP[key] : null;
            if (!stage) return null;
            return (
              <Tooltip key={i} title={stage.desc} arrow>
                <Chip label={`${key}: ${instr.name}`} size="small" sx={{
                  backgroundColor: stage.color, cursor: 'help',
                  fontFamily: 'monospace', fontSize: 11,
                }} />
              </Tooltip>
            );
          })}
          {INSTRUCTIONS.every((_, i) => !getStageKey(i, cycle)) && (
            <Typography variant="body2" color="text.secondary">Pipeline empty</Typography>
          )}
        </Stack>
      </CEBlock.Section>

      {/* Legend + controls */}
      <CEBlock.Section label="Stage Legend (hover for details)">
        <ColorLegend items={STAGES} />
      </CEBlock.Section>

      <StepControls step={cycle} max={MAX_CYCLES - 1} onStep={setCycle} label="Cycle" />
    </CEBlock>
  );
}

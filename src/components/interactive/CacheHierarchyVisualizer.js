import React, { useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import Paper from '@site/src/components/ui/Paper';
import TextField from '@site/src/components/ui/TextField';
import Chip from '@site/src/components/ui/Chip';
import Stack from '@site/src/components/ui/Stack';
import Collapse from '@site/src/components/ui/Collapse';
import Tooltip from '@site/src/components/ui/Tooltip';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

const LEVELS = [
  {
    name: 'Registers',
    size: '~256 B – 1 KB',
    latency: '< 1 ns',
    cycles: '1 cycle',
    tech: 'Flip-flops (on-die)',
    color: '#ef5350',
    desc: 'Named storage locations (R0–R31) directly in the CPU datapath. Zero memory-hierarchy penalty. Limited to ~32–128 registers.',
  },
  {
    name: 'L1 Cache',
    size: '32 – 64 KB',
    latency: '1 – 4 ns',
    cycles: '4 cycles',
    tech: 'SRAM (on-die)',
    color: '#ff7043',
    desc: 'Usually split into L1-Instruction and L1-Data caches. Very fast but tiny. Typically 4-way set-associative with 64-byte cache lines.',
  },
  {
    name: 'L2 Cache',
    size: '256 KB – 1 MB',
    latency: '5 – 12 ns',
    cycles: '12 cycles',
    tech: 'SRAM (on-die)',
    color: '#ffa726',
    desc: 'Unified (data + instructions). Larger than L1 but slower. Often private per-core on modern CPUs.',
  },
  {
    name: 'L3 Cache',
    size: '4 – 32 MB',
    latency: '20 – 50 ns',
    cycles: '40 cycles',
    tech: 'SRAM (on-die, shared)',
    color: '#ffcc02',
    desc: 'Shared across all cores. Last level before going off-chip to DRAM. An L3 miss triggers a very expensive main memory access.',
  },
  {
    name: 'Main Memory (DRAM)',
    size: '8 – 64 GB',
    latency: '60 – 100 ns',
    cycles: '200 cycles',
    tech: 'DRAM (off-chip)',
    color: '#66bb6a',
    desc: 'Off-chip memory. Large but much slower due to the off-chip bus latency. A full cache line (64 bytes) is fetched and fills L3→L2→L1.',
  },
  {
    name: 'NVMe SSD',
    size: '256 GB – 4 TB',
    latency: '50 – 200 μs',
    cycles: '100,000+ cycles',
    tech: 'NAND Flash',
    color: '#42a5f5',
    desc: 'Persistent storage. Page faults bring data from here into DRAM. Roughly 1,000× slower than DRAM for random reads.',
  },
];

// Pyramid widths (narrowest at top = fastest/smallest)
const WIDTHS = [30, 44, 57, 70, 83, 96];

export default function CacheHierarchyVisualizer() {
  const [selected, setSelected] = useState(null);
  const [address, setAddress] = useState('0x1A2B3C40');
  const [trace, setTrace] = useState([]);

  const simulate = () => {
    const rand = Math.random();
    let hitLevel;
    if (rand < 0.85)      hitLevel = 1; // L1 hit  (85%)
    else if (rand < 0.95) hitLevel = 2; // L2 hit  (10%)
    else if (rand < 0.99) hitLevel = 3; // L3 hit  (4%)
    else                  hitLevel = 4; // DRAM hit (1%)

    const t = [];
    for (let i = 1; i <= hitLevel; i++) {
      t.push({ level: i, hit: i === hitLevel });
    }
    setTrace(t);
  };

  const getTraceEntry = (i) => trace.find(t => t.level === i);

  return (
    <CEBlock
      title="Cache Hierarchy Visualizer"
      subtitle="Click any level for details. Access Memory traces a request down the pyramid."
    >
      <CEBlock.Section label="Hierarchy" noPaper>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', mb: 3 }}>
        {LEVELS.map((level, i) => {
          const entry = getTraceEntry(i);
          const inTrace = !!entry;
          const isHit = entry?.hit;
          const isMiss = inTrace && !isHit;
          return (
            <Tooltip key={i} title={level.desc} placement="right" arrow>
              <Box
                onClick={() => setSelected(selected === i ? null : i)}
                sx={{
                  width: `${WIDTHS[i]}%`,
                  minWidth: 180,
                  maxWidth: 560,
                  py: 1.2,
                  px: 2,
                  borderRadius: 2,
                  backgroundColor: level.color,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: selected === i
                    ? '3px solid #1a237e'
                    : isHit
                    ? '3px solid #2e7d32'
                    : isMiss
                    ? '3px dashed #c62828'
                    : '3px solid transparent',
                  boxShadow: selected === i ? 6 : 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{level.name}</Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.85 }}>
                  {level.size} · {level.latency} · {level.cycles}
                </Typography>
                {inTrace && (
                  <Chip
                    label={isHit ? '✓ HIT' : '✗ MISS'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: isHit ? '#2e7d32' : '#c62828',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      </CEBlock.Section>

      <CEBlock.Section label="Level details" noPaper>
      <Collapse in={selected !== null}>
        {selected !== null && (
          <Paper sx={{ p: 2, mb: 2, borderLeft: `5px solid ${LEVELS[selected].color}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{LEVELS[selected].name}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
              <Typography variant="body2"><strong>Size:</strong> {LEVELS[selected].size}</Typography>
              <Typography variant="body2"><strong>Latency:</strong> {LEVELS[selected].latency}</Typography>
              <Typography variant="body2"><strong>CPU Cycles:</strong> {LEVELS[selected].cycles}</Typography>
              <Typography variant="body2"><strong>Technology:</strong> {LEVELS[selected].tech}</Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {LEVELS[selected].desc}
            </Typography>
          </Paper>
        )}
      </Collapse>

      </CEBlock.Section>

      <CEBlock.Section label="Simulate a memory access">
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            label="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            sx={{ width: 160 }}
            inputProps={{ style: { fontFamily: 'monospace' } }}
          />
          <Button variant="contained" onClick={simulate} size="small">
            Access Memory
          </Button>
          {trace.length > 0 && (
            <Button variant="outlined" onClick={() => setTrace([])} size="small">
              Clear
            </Button>
          )}
        </Stack>

        {trace.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Lookup trace for <code>{address}</code>:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              {trace.map((t, idx) => (
                <Chip
                  key={idx}
                  label={`${LEVELS[t.level].name}: ${t.hit ? 'HIT' : 'MISS'}`}
                  size="small"
                  sx={{
                    backgroundColor: t.hit ? '#2e7d32' : '#c62828',
                    color: '#fff',
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                />
              ))}
            </Stack>
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Data served from: <strong>{LEVELS[trace[trace.length - 1].level].name}</strong>
              {' '}— access time {LEVELS[trace[trace.length - 1].level].latency}
            </Typography>
          </Box>
        )}
      </CEBlock.Section>
    </CEBlock>
  );
}

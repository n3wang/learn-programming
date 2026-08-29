import React from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Tooltip from '@site/src/components/ui/Tooltip';

/**
 * Renders a row of color-coded swatches with labels and optional tooltips.
 * Used for stage legends, state legends, level legends, etc.
 *
 * Props:
 *   items   {Array}   list of { key, label, color, desc? }
 *   title   {string}  optional section heading
 *
 * Usage:
 *   const STAGES = [
 *     { key: 'IF', label: 'Instruction Fetch', color: '#4fc3f7', desc: 'Fetches...' },
 *     { key: 'ID', label: 'Instruction Decode', color: '#81c784' },
 *   ];
 *   <ColorLegend title="Stage Legend" items={STAGES} />
 */
export default function ColorLegend({ title, items = [] }) {
  return (
    <Box>
      {title && (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {items.map(item => (
          <Tooltip
            key={item.key}
            title={item.desc || ''}
            arrow
            disableHoverListener={!item.desc}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: item.desc ? 'help' : 'default' }}>
              <Box sx={{
                minWidth: 36,
                height: 22,
                borderRadius: '4px',
                backgroundColor: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                px: 0.5,
              }}>
                {item.key}
              </Box>
              <Typography variant="caption">{item.label}</Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

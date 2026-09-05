import React from 'react';
import Box from '@site/src/components/ui/Box';
import Paper from '@site/src/components/ui/Paper';
import Typography from '@site/src/components/ui/Typography';
import Divider from '@site/src/components/ui/Divider';

/**
 * Consistent outer frame for all Computer Engineering interactive demos.
 *
 * Usage:
 *   <CEBlock title="My Simulator" subtitle="Optional one-line description">
 *     <CEBlock.Section label="Section Title">...</CEBlock.Section>
 *     <CEBlock.Section>...</CEBlock.Section>
 *   </CEBlock>
 */
export default function CEBlock({ title, subtitle, children, legend, controls, headerAction }) {
  return (
    <Box sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden',
      my: 2,
    }}>
      {/* Header bar */}
      <Box sx={{
        px: 2,
        py: 1.5,
        backgroundColor: 'grey.100',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
      }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {headerAction ? (
          <Box sx={{ flexShrink: 0, mt: 0.25 }}>{headerAction}</Box>
        ) : null}
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        {children}
        {(legend || controls) && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            {legend}
            {controls && <Box sx={{ mt: legend ? 1.5 : 0 }}>{controls}</Box>}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/** Labeled sub-section inside a CEBlock */
CEBlock.Section = function Section({ label, children, noPaper = false }) {
  const inner = (
    <>
      {label && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Divider sx={{ mt: 0.5, mb: 1.5 }} />
        </>
      )}
      {children}
    </>
  );

  if (noPaper) return <Box sx={{ mb: 2 }}>{inner}</Box>;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      {inner}
    </Paper>
  );
};

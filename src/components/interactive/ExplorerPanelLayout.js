import React from 'react';
import Box from '@site/src/components/ui/Box';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './formulaExplorer/explorer.module.css';

/**
 * Shared FormulaExplorer-style chrome for custom simulators:
 * viz left, rectangular sliders + metric boxes right.
 * Use embedded inside FormulaExplorerTabs (skips CEBlock).
 */
export default function ExplorerPanelLayout({
  title,
  subtitle,
  compact,
  embedded,
  chartLabel = 'Chart',
  chart,
  params = [],
  stats = [],
  note,
  refNote,
}) {
  const body = (
    <div className={compact ? styles.layoutCompact : styles.layout}>
      <div className={styles.chartCol}>
        <span className={styles.chartLabel}>{chartLabel}</span>
        {chart}
      </div>
      <div className={styles.controlsCol}>
        <Stack spacing={1.5}>
          {params.map((p) => (
            <Box key={p.key}>
              <Stack direction="row" justifyContent="space-between" sx={{mb: 0.25}} alignItems="baseline">
                <Typography variant="body2" sx={{fontWeight: 600}}>
                  {p.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{fontVariantNumeric: 'tabular-nums'}}>
                  {p.display}
                </Typography>
              </Stack>
              {p.meaning ? (
                <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.5}}>
                  {p.meaning}
                </Typography>
              ) : null}
              <input
                className={styles.slider}
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={p.value}
                onChange={(e) => p.onChange(Number(e.target.value))}
                aria-label={p.label}
              />
            </Box>
          ))}
        </Stack>
        {stats.length ? (
          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statLabel}>{s.label}</span>
                <div className={styles.statValue}>{s.value}</div>
              </div>
            ))}
          </div>
        ) : null}
        {note ? <span className={styles.note}>{note}</span> : null}
        {refNote ? <p className={styles.refNote}>{refNote}</p> : null}
      </div>
    </div>
  );

  if (embedded) return body;
  return (
    <CEBlock title={title} subtitle={subtitle}>
      {body}
    </CEBlock>
  );
}

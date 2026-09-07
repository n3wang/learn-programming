import React, {useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import {getPreset} from './formulaExplorer/presets';
import {FormulaExplorerBody} from './FormulaExplorer';
import styles from './formulaExplorer/explorer.module.css';

/**
 * Several FormulaExplorer presets grouped behind pill tabs, so related
 * charts (e.g. "Naive Bayes posteriors" + "Ridge shrinkage") share one
 * vertical footprint instead of stacking full-height blocks.
 *
 * <FormulaExplorerTabs
 *   items={[
 *     {preset: 'clfNbPosteriors', label: 'Naive Bayes posteriors', note: 'Referenced in 7.25 — …'},
 *     {preset: 'mlRidgeShrink', note: 'Referenced in 7.20 — …'},
 *   ]}
 * />
 */
export default function FormulaExplorerTabs({items}) {
  const entries = (items || [])
    .map((item) => ({...item, resolved: getPreset(item.preset)}))
    .filter((item) => item.resolved);

  const [active, setActive] = useState(0);

  if (!entries.length) {
    return null;
  }

  const current = entries[Math.min(active, entries.length - 1)];

  return (
    <Box sx={{border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', my: 2}}>
      <div className={styles.tabBar} role="tablist" aria-label="Chart tabs">
        {entries.map((item, i) => (
          <button
            key={item.preset}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={[styles.tab, i === active ? styles.tabActive : ''].join(' ')}
            onClick={() => setActive(i)}
          >
            {item.label || item.resolved.title}
          </button>
        ))}
      </div>
      <Box sx={{p: 2}}>
        {current.resolved.subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 1.5}}>
            {current.resolved.subtitle}
          </Typography>
        ) : null}
        <FormulaExplorerBody key={current.preset} preset={current.resolved} refNote={current.note} />
      </Box>
    </Box>
  );
}

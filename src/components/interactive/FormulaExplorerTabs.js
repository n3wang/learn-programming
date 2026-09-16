import React, {useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import {getPreset} from './formulaExplorer/presets';
import {FormulaExplorerBody} from './FormulaExplorer';
import SpecularReflectionSimulator from './SpecularReflectionSimulator';
import DifferentiationSimulator from './DifferentiationSimulator';
import DecaySimulator from './DecaySimulator';
import RandomWalkSimulator from './RandomWalkSimulator';
import BrainWalkSimulator from './BrainWalkSimulator';
import ProteinFoldSimulator from './ProteinFoldSimulator';
import styles from './formulaExplorer/explorer.module.css';

/** Custom non-preset panels that can sit beside FormulaExplorer presets. */
const PANELS = {
  specularReflection: {
    title: 'Specular reflection',
    subtitle: 'θ ← θ + 2φ each bounce · optional digit rounding shows coherent round-off',
    Component: SpecularReflectionSimulator,
  },
  differentiation: {
    title: 'Forward vs central',
    subtitle: 'Chord slopes on a sampled y(t) — central cancels even powers of h',
    Component: DifferentiationSimulator,
  },
  decay: {
    title: 'Spontaneous decay',
    subtitle: 'Stochastic N(t) vs smooth exponential · semilog plot',
    Component: DecaySimulator,
  },
  randomWalk: {
    title: 'Random walk',
    subtitle: 'Unit-step 2D walk · R vs √N theory circle',
    Component: RandomWalkSimulator,
  },
  brainWalk: {
    title: 'Brain diffusion',
    subtitle: 'Many walks with free / stop / bounce obstacles',
    Component: BrainWalkSimulator,
  },
  proteinFold: {
    title: 'HP protein fold',
    subtitle: 'Self-avoiding lattice walk · E = −ε f for H–H contacts',
    Component: ProteinFoldSimulator,
  },
};

/**
 * Several FormulaExplorer presets (and optional custom panels) grouped behind
 * pill tabs, so related charts share one vertical footprint.
 *
 * <FormulaExplorerTabs
 *   items={[
 *     {panel: 'specularReflection', label: 'Specular reflection', note: '…'},
 *     {preset: 'besselUpDown', label: 'Up vs down j_ℓ', note: '…'},
 *   ]}
 * />
 */
export default function FormulaExplorerTabs({items}) {
  const entries = (items || [])
    .map((item, index) => {
      if (item.panel && PANELS[item.panel]) {
        const meta = PANELS[item.panel];
        return {
          ...item,
          key: `panel:${item.panel}`,
          kind: 'panel',
          title: item.label || meta.title,
          subtitle: meta.subtitle,
          Panel: meta.Component,
        };
      }
      const resolved = item.preset ? getPreset(item.preset) : null;
      if (!resolved) return null;
      return {
        ...item,
        key: `preset:${item.preset}:${index}`,
        kind: 'preset',
        title: item.label || resolved.title,
        subtitle: resolved.subtitle,
        resolved,
      };
    })
    .filter(Boolean);

  const [active, setActive] = useState(0);

  if (!entries.length) {
    return null;
  }

  const current = entries[Math.min(active, entries.length - 1)];
  const Panel = current.kind === 'panel' ? current.Panel : null;

  return (
    <Box sx={{border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', my: 2}}>
      <div className={styles.tabBar} role="tablist" aria-label="Chart tabs">
        {entries.map((item, i) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={[styles.tab, i === active ? styles.tabActive : ''].join(' ')}
            onClick={() => setActive(i)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <Box sx={{p: 2}}>
        {current.subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 1.5}}>
            {current.subtitle}
          </Typography>
        ) : null}
        {Panel ? (
          <Panel key={current.key} embedded compact={false} refNote={current.note} />
        ) : (
          <FormulaExplorerBody key={current.key} preset={current.resolved} refNote={current.note} />
        )}
      </Box>
    </Box>
  );
}

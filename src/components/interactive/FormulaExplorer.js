import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import MathText from '@site/src/components/ProblemSet/MathText';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import FormulaChart from './formulaExplorer/FormulaChart';
import {getPreset} from './formulaExplorer/presets';
import {fmt} from './formulaExplorer/probMath';
import styles from './formulaExplorer/explorer.module.css';

function defaultsFrom(preset) {
  const o = {};
  for (const p of preset.params) o[p.key] = p.default;
  return o;
}

/**
 * Formula + chart + sliders for one preset. No outer frame — callers
 * (FormulaExplorer, FormulaExplorerTabs) supply their own header/wrapper.
 */
export function FormulaExplorerBody({preset, refNote}) {
  const [values, setValues] = useState(() => defaultsFrom(preset));

  const result = useMemo(() => preset.compute(values), [preset, values]);
  const example = useMemo(() => (preset.example ? preset.example(values) : null), [preset, values]);

  const setParam = (key, raw) => {
    setValues((prev) => ({...prev, [key]: Number(raw)}));
  };

  return (
    <>
      <Box
        sx={{
          display: 'block',
          mb: 1.5,
          px: 1.5,
          py: 1,
          fontSize: '1.05rem',
          backgroundColor: 'grey.100',
          borderRadius: 1,
          overflowX: 'auto',
          lineHeight: 1.6,
        }}
      >
        <MathText text={preset.formula} />
      </Box>

      {example ? (
        <Box
          sx={{
            mb: 2,
            px: 1.5,
            py: 1.25,
            borderLeft: '3px solid',
            borderColor: 'primary.main',
            backgroundColor: 'grey.50',
            borderRadius: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, display: 'block', mb: 0.5}}
          >
            Sample problem
          </Typography>
          <Typography variant="body2">{example}</Typography>
        </Box>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.chartCol}>
          <span className={styles.chartLabel}>Chart</span>
          {result ? (
            <FormulaChart
              type={result.chartType}
              series={result.series}
              yLabel={result.yLabel}
              shadeToX={result.shadeToX ?? null}
              refLineX={result.refLineX ?? null}
              refLineY={result.refLineY ?? null}
              width={440}
              height={210}
            />
          ) : null}
        </div>

        <div className={styles.controlsCol}>
          <Stack spacing={1.5}>
            {preset.params.map((p) => (
              <Box key={p.key}>
                <Stack direction="row" justifyContent="space-between" sx={{mb: 0.25}} alignItems="baseline">
                  <Typography variant="body2" sx={{fontWeight: 600}}>
                    {p.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{fontVariantNumeric: 'tabular-nums'}}>
                    {fmt(values[p.key], p.step < 1 ? 3 : 0)}
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
                  value={values[p.key]}
                  onChange={(e) => setParam(p.key, e.target.value)}
                  aria-label={p.label}
                />
              </Box>
            ))}
          </Stack>

          {result ? (
            <>
              <div className={styles.stats}>
                {result.stats.map((s) => (
                  <div key={s.label} className={styles.stat}>
                    <span className={styles.statLabel}>{s.label}</span>
                    <div className={styles.statValue}>{s.value}</div>
                  </div>
                ))}
              </div>
              {result.note ? <span className={styles.note}>{result.note}</span> : null}
            </>
          ) : null}
        </div>
      </div>

      {refNote ? <p className={styles.refNote}>{refNote}</p> : null}
    </>
  );
}

/**
 * Client-side formula playground.
 * Chart on the left; sliders + result chips on the right.
 */
export default function FormulaExplorer({preset: presetId}) {
  const preset = getPreset(presetId);

  if (!preset) {
    return (
      <CEBlock title="Formula explorer" subtitle={`Unknown preset: ${presetId}`}>
        <Typography>Valid presets are registered in formulaExplorer/presets.js.</Typography>
      </CEBlock>
    );
  }

  return (
    <CEBlock title={preset.title} subtitle={preset.subtitle}>
      <FormulaExplorerBody preset={preset} />
    </CEBlock>
  );
}

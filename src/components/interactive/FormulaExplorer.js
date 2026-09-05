import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
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
 * Client-side formula playground.
 * Chart on the left; sliders + result chips on the right.
 */
export default function FormulaExplorer({preset: presetId}) {
  const preset = getPreset(presetId);
  const [values, setValues] = useState(() => (preset ? defaultsFrom(preset) : {}));

  const result = useMemo(() => {
    if (!preset) return null;
    return preset.compute(values);
  }, [preset, values]);

  const example = useMemo(() => {
    if (!preset?.example) return null;
    return preset.example(values);
  }, [preset, values]);

  if (!preset) {
    return (
      <CEBlock title="Formula explorer" subtitle={`Unknown preset: ${presetId}`}>
        <Typography>Valid presets are registered in formulaExplorer/presets.js.</Typography>
      </CEBlock>
    );
  }

  const setParam = (key, raw) => {
    setValues((prev) => ({...prev, [key]: Number(raw)}));
  };

  return (
    <CEBlock title={preset.title} subtitle={preset.subtitle}>
      <Typography
        component="code"
        sx={{
          display: 'block',
          mb: 1.5,
          px: 1.5,
          py: 1,
          fontSize: '0.9rem',
          backgroundColor: 'grey.100',
          borderRadius: 1,
          overflowX: 'auto',
        }}
      >
        {preset.formula}
      </Typography>

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
    </CEBlock>
  );
}

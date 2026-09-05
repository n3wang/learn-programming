import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import FormulaChart from './formulaExplorer/FormulaChart';
import {getPreset} from './formulaExplorer/presets';
import {fmt} from './formulaExplorer/probMath';

function defaultsFrom(preset) {
  const o = {};
  for (const p of preset.params) o[p.key] = p.default;
  return o;
}

/**
 * Client-side formula playground: sliders → SVG chart.
 * No Piston / no chart npm packages.
 *
 * @param {{preset: string}} props
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

      <Stack spacing={1.75} sx={{mb: 2}}>
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
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={values[p.key]}
              onChange={(e) => setParam(p.key, e.target.value)}
              aria-label={p.label}
              style={{width: '100%', accentColor: '#1976d2'}}
            />
          </Box>
        ))}
      </Stack>

      {result ? (
        <>
          <CEBlock.Section label="Chart" noPaper>
            <FormulaChart
              type={result.chartType}
              series={result.series}
              yLabel={result.yLabel}
              shadeToX={result.shadeToX ?? null}
            />
          </CEBlock.Section>

          <Stack direction="row" spacing={2} sx={{flexWrap: 'wrap', mt: 1}} useFlexGap>
            {result.stats.map((s) => (
              <Box
                key={s.label}
                sx={{
                  px: 1.25,
                  py: 0.75,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  minWidth: 100,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                  {s.label}
                </Typography>
                <Typography sx={{fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          {result.note ? (
            <Typography variant="body2" color="text.secondary" sx={{mt: 1.5}}>
              {result.note}
            </Typography>
          ) : null}
        </>
      ) : null}
    </CEBlock>
  );
}

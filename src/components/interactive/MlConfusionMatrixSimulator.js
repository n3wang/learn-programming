import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';

const PRESETS = {
  balanced: {label: 'Balanced', tp: 40, fp: 10, fn: 10, tn: 40},
  rareMiss: {label: 'Rare + misses', tp: 5, fp: 5, fn: 45, tn: 945},
  catchAll: {label: 'High recall', tp: 48, fp: 40, fn: 2, tn: 10},
  precise: {label: 'High precision', tp: 20, fp: 2, fn: 30, tn: 48},
};

function metrics(tp, fp, fn, tn) {
  const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
  const spec = tn + fp === 0 ? 0 : tn / (tn + fp);
  const acc = (tp + tn) / (tp + tn + fp + fn);
  const f1 = prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec);
  return {
    prec: Math.round(prec * 100) / 100,
    rec: Math.round(rec * 100) / 100,
    spec: Math.round(spec * 100) / 100,
    acc: Math.round(acc * 100) / 100,
    f1: Math.round(f1 * 100) / 100,
  };
}

function Cell({label, value, sub, color}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 120,
        p: 1.25,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: color,
      }}
    >
      <Typography variant="caption" sx={{fontWeight: 700, display: 'block'}}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{my: 0.5, fontFamily: 'monospace'}}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {sub}
      </Typography>
    </Box>
  );
}

export default function MlConfusionMatrixSimulator() {
  const [id, setId] = useState('balanced');
  const c = PRESETS[id];
  const m = useMemo(() => metrics(c.tp, c.fp, c.fn, c.tn), [c]);

  return (
    <CEBlock
      title="Confusion matrix lab"
      subtitle="Switch presets — watch precision, recall, specificity, accuracy, and F1 move"
    >
      <Stack direction="row" spacing={1} sx={{mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        {Object.entries(PRESETS).map(([key, p]) => (
          <Chip
            key={key}
            label={p.label}
            size="small"
            color={id === key ? 'primary' : 'default'}
            variant={id === key ? 'filled' : 'outlined'}
            onClick={() => setId(key)}
            sx={{cursor: 'pointer'}}
          />
        ))}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 1fr',
          gap: 1,
          mb: 2,
          maxWidth: 420,
        }}
      >
        <Box />
        <Typography variant="caption" align="center" sx={{fontWeight: 700}}>
          Pred +
        </Typography>
        <Typography variant="caption" align="center" sx={{fontWeight: 700}}>
          Pred −
        </Typography>
        <Typography variant="caption" sx={{fontWeight: 700, alignSelf: 'center'}}>
          Actual +
        </Typography>
        <Cell label="TP" value={c.tp} sub="true positive" color="rgba(46,125,50,0.12)" />
        <Cell label="FN" value={c.fn} sub="type II / miss" color="rgba(245,124,0,0.12)" />
        <Typography variant="caption" sx={{fontWeight: 700, alignSelf: 'center'}}>
          Actual −
        </Typography>
        <Cell label="FP" value={c.fp} sub="type I / false alarm" color="rgba(211,47,47,0.1)" />
        <Cell label="TN" value={c.tn} sub="true negative" color="rgba(25,118,210,0.1)" />
      </Box>

      <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', gap: 1}}>
        <Chip size="small" label={`Precision ${m.prec}`} color="primary" />
        <Chip size="small" label={`Recall ${m.rec}`} color="secondary" />
        <Chip size="small" label={`Specificity ${m.spec}`} />
        <Chip size="small" label={`Accuracy ${m.acc}`} />
        <Chip size="small" label={`F1 ${m.f1}`} color="success" />
      </Stack>
      <Typography variant="body2" sx={{mt: 1.25}}>
        Rare + misses: accuracy looks great while recall collapses — the accuracy paradox.
      </Typography>
    </CEBlock>
  );
}

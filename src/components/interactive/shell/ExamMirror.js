import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';
import MixedPractice from './MixedPractice';

/**
 * A real exam paper as a MixedPractice run: one category per printed question,
 * kept in paper order. 「换数字」 draws fresh numbers (and moves the true answer of
 * 选择题); 「原题」 shows the paper's own numbers. Every generator takes { original }.
 */
export default function ExamMirror({ categories, anchorId, children }) {
  const [original, setOriginal] = useState(false);
  const cats = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        pool: c.pool.map((e) => ({ ...e, gen: (opts) => e.gen({ ...opts, original }) })),
      })),
    [categories, original],
  );
  const total = categories.length;
  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700 }}>题目数字：</Typography>
        <ToggleButtonGroup exclusive size="small" value={original ? 'orig' : 'rand'} onChange={(_, v) => v && setOriginal(v === 'orig')}>
          <ToggleButton value="rand">🎲 换数字</ToggleButton>
          <ToggleButton value="orig">📄 原题</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary">
          {original
            ? '和试卷上一模一样的数字与选项顺序。'
            : '题型和卷子一样，数字每次重新抽，选择题的正确答案也会换位置。'}
        </Typography>
      </Stack>
      <MixedPractice
        key={original ? 'orig' : 'rand'}
        categories={cats}
        defaultCount={total}
        countOptions={[10, total]}
        allowPrint
        ordered
        anchorId={anchorId}
      >
        {children}
      </MixedPractice>
    </Box>
  );
}

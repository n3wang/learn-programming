import React, { useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Collapse from '@site/src/components/ui/Collapse';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import CEBlock from './CEBlock';

function makeBatch(generator, count) {
  return Array.from({ length: count }, (_, i) => ({ ...generator(), key: `${Date.now()}-${i}-${Math.random()}` }));
}

function WorksheetItem({ index, problem }) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        transition: 'background-color 0.3s ease',
        backgroundColor: showAnswer ? 'action.hover' : 'transparent',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" useFlexGap>
        <Typography sx={{ fontFamily: 'monospace', fontSize: '1.02em' }}>
          <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
            ({index + 1})
          </Box>
          {problem.prompt}
        </Typography>
        <Button size="small" variant="outlined" onClick={() => setShowAnswer((s) => !s)} sx={{ flexShrink: 0 }}>
          {showAnswer ? '隐藏解答' : '显示解答'}
        </Button>
      </Stack>
      <Collapse in={showAnswer} timeout={350}>
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
          {problem.steps.map((step, i) => (
            <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
              {step}
            </Typography>
          ))}
          <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{problem.answer}</Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

/**
 * Generates a batch of `count` problems from `generator()` (each call must
 * return { prompt, steps: string[], answer }), and renders them as a
 * worksheet — each with its own show/hide-answer toggle, plus a button to
 * regenerate the whole batch.
 */
export default function EquationWorksheet({ title, subtitle, generator, count = 5 }) {
  const [batch, setBatch] = useState(() => makeBatch(generator, count));

  return (
    <CEBlock title={title} subtitle={subtitle}>
      {batch.map((problem, i) => (
        <WorksheetItem key={problem.key} index={i} problem={problem} />
      ))}
      <Button variant="contained" onClick={() => setBatch(makeBatch(generator, count))} sx={{ mt: 0.5 }}>
        🎲 换一批（{count} 题）
      </Button>
    </CEBlock>
  );
}

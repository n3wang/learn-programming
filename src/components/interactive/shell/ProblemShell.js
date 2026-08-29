import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CEBlock from './CEBlock';

/**
 * Shared frame for randomized word-problem practice: problem statement,
 * 「随机」, optional 「书题目」, and show/hide solution.
 */
export default function ProblemShell({
  title,
  subtitle,
  problemKey,
  onRandomize,
  randomizeLabel = '随机',
  onBook,
  bookLabel = '书题目',
  children,
  solution,
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [problemKey]);

  return (
    <CEBlock title={title} subtitle={subtitle}>
      <Box>{typeof children === 'function' ? children(showAnswer) : children}</Box>

      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
        <Button variant="contained" onClick={onRandomize}>
          {randomizeLabel}
        </Button>
        {onBook ? (
          <Button variant="outlined" onClick={onBook}>
            {bookLabel}
          </Button>
        ) : null}
        <Button variant="outlined" onClick={() => setShowAnswer((s) => !s)}>
          {showAnswer ? '隐藏解答' : '显示解答'}
        </Button>
      </Stack>

      {showAnswer ? (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>{solution}</Box>
      ) : null}
    </CEBlock>
  );
}

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import CEBlock from './CEBlock';

/**
 * Shared frame for the randomized word-problem simulators: shows the
 * (regenerated) problem statement, a "new problem" button, and a
 * show/hide-answer toggle that reveals the worked solution with a Collapse
 * animation. Resets the reveal state whenever `problemKey` changes.
 *
 * `children` may be a plain node, or a function `(showAnswer) => node` for
 * simulators whose visualization itself animates on reveal (e.g. a bar that
 * splits once the answer is shown).
 *
 * Usage:
 *   <ProblemShell title="..." problemKey={key} onRandomize={fn} solution={<...>}>
 *     {(showAnswer) => <...>}
 *   </ProblemShell>
 */
export default function ProblemShell({
  title,
  subtitle,
  problemKey,
  onRandomize,
  randomizeLabel = '🎲 换一题（随机出题）',
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
        <Button variant="outlined" onClick={() => setShowAnswer((s) => !s)}>
          {showAnswer ? '隐藏解答 ▲' : '显示解答 ▼'}
        </Button>
      </Stack>

      <Collapse in={showAnswer} timeout={400}>
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>{solution}</Box>
      </Collapse>
    </CEBlock>
  );
}

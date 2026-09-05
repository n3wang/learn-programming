import React, { useEffect, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Stack from '@site/src/components/ui/Stack';
import TranslatableParagraph from '@site/src/components/Translate/TranslatableParagraph';
import CEBlock from './CEBlock';

/**
 * Shared frame for randomized word-problem practice: problem statement,
 * 「随机」, optional 「书题目」, and show/hide solution.
 *
 * Prompt + solution support hover + Ctrl/Cmd translation (same as MDX paragraphs).
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

  const actions = (
    <Stack direction="row" spacing={0.25} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }} useFlexGap>
      <Button size="small" variant="text" onClick={onRandomize}>
        {randomizeLabel}
      </Button>
      {onBook ? (
        <Button size="small" variant="text" onClick={onBook}>
          {bookLabel}
        </Button>
      ) : null}
      <Button size="small" variant="text" onClick={() => setShowAnswer((s) => !s)}>
        {showAnswer ? '隐藏解答' : '显示解答'}
      </Button>
    </Stack>
  );

  return (
    <CEBlock title={title} subtitle={subtitle} headerAction={actions}>
      <TranslatableParagraph as="div" translateKey={`prompt:${problemKey}`}>
        {typeof children === 'function' ? children(showAnswer) : children}
      </TranslatableParagraph>

      {showAnswer ? (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <TranslatableParagraph as="div" translateKey={`solution:${problemKey}`}>
            {solution}
          </TranslatableParagraph>
        </Box>
      ) : null}
    </CEBlock>
  );
}

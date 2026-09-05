import React, { useEffect, useRef, useState } from 'react';
import Button from '@site/src/components/ui/Button';
import Stack from '@site/src/components/ui/Stack';
import TranslatableParagraph from '@site/src/components/Translate/TranslatableParagraph';
import DraftHomeworkButton, {
  textFromNode,
} from '@site/src/components/homework/DraftHomeworkButton';
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
  draftPrompt,
  draftAnswer,
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const promptRef = useRef(null);
  const solutionRef = useRef(null);

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
      <DraftHomeworkButton
        getPayload={() => {
          // Prefer explicit draft strings when provided; else scrape rendered text.
          // Temporarily reveal solution DOM for capture if needed.
          const prompt =
            (typeof draftPrompt === 'string' && draftPrompt.trim()) ||
            textFromNode(promptRef.current);
          let answer =
            (typeof draftAnswer === 'string' && draftAnswer.trim()) ||
            textFromNode(solutionRef.current);
          if (!answer && solutionRef.current) {
            answer = textFromNode(solutionRef.current);
          }
          return {
            title: title || 'Problem',
            prompt,
            answer,
          };
        }}
      />
    </Stack>
  );

  return (
    <CEBlock title={title} subtitle={subtitle} headerAction={actions}>
      <div ref={promptRef}>
        <TranslatableParagraph as="div" translateKey={`prompt:${problemKey}`}>
          {typeof children === 'function' ? children(showAnswer) : children}
        </TranslatableParagraph>
      </div>

      {/* Keep solution mounted (hidden) so draft mode can copy answers without opening 显示解答 */}
      <div
        ref={solutionRef}
        style={{
          marginTop: showAnswer ? 16 : 0,
          paddingTop: showAnswer ? 16 : 0,
          borderTop: showAnswer ? '1px dashed var(--ifm-color-emphasis-300)' : 'none',
          display: showAnswer ? 'block' : 'none',
        }}
      >
        <TranslatableParagraph as="div" translateKey={`solution:${problemKey}`}>
          {solution}
        </TranslatableParagraph>
      </div>
    </CEBlock>
  );
}

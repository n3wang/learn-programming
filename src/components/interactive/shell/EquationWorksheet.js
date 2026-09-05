import React, { useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Collapse from '@site/src/components/ui/Collapse';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import MathText from '@site/src/components/ProblemSet/MathText';
import DraftHomeworkButton from '@site/src/components/homework/DraftHomeworkButton';
import CEBlock from './CEBlock';
import styles from './EquationWorksheet.module.css';

function makeBatch(generator, count) {
  return Array.from({ length: count }, (_, i) => ({ ...generator(), key: `${Date.now()}-${i}-${Math.random()}` }));
}

function WorksheetItem({ index, problem, sectionTitle }) {
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
        <Box sx={{ flex: '1 1 220px', minWidth: 0, fontSize: '1.05em' }}>
          <Box component="span" sx={{ color: 'text.secondary', mr: 1, verticalAlign: 'top' }}>
            ({index + 1})
          </Box>
          <MathText text={problem.prompt} />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }} useFlexGap>
          <Button size="small" variant="outlined" onClick={() => setShowAnswer((s) => !s)}>
            {showAnswer ? '隐藏解答' : '显示解答'}
          </Button>
          <DraftHomeworkButton
            getPayload={() => ({
              title: `${sectionTitle || 'Worksheet'} (${index + 1})`,
              prompt: problem.prompt || '',
              answer: [
                ...(Array.isArray(problem.steps) ? problem.steps : []),
                problem.answer || '',
              ]
                .filter(Boolean)
                .join('\n'),
            })}
          />
        </Stack>
      </Stack>
      <Collapse in={showAnswer} timeout={350}>
        <Box className={styles.solution} sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
          {problem.steps.map((step, i) => (
            <Typography
              key={i}
              component="div"
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              <MathText text={step} />
            </Typography>
          ))}
          <Typography component="div" sx={{ fontWeight: 700, mt: 0.75 }}>
            <MathText text={problem.answer} />
          </Typography>
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
 *
 * Prompts / steps / answers may mix Chinese with `$...$` / `$$...$$` KaTeX.
 */
export default function EquationWorksheet({ title, subtitle, generator, count = 5 }) {
  const [batch, setBatch] = useState(() => makeBatch(generator, count));

  return (
    <CEBlock
      title={title}
      subtitle={subtitle}
      headerAction={
        <Button size="small" variant="text" onClick={() => setBatch(makeBatch(generator, count))}>
          换一批（{count} 题）
        </Button>
      }
    >
      {batch.map((problem, i) => (
        <WorksheetItem
          key={problem.key}
          index={i}
          problem={problem}
          sectionTitle={title}
        />
      ))}
    </CEBlock>
  );
}

import React from 'react';
import CodeExercise from '@site/src/components/CodeExercise';
import {CH9} from './bank.generated';

/**
 * Chapter-9 coding interview problem with ≥12 hidden tests from the verified bank.
 */
export default function CodingCh9Exercise({
  problemId,
  company,
  title: titleProp,
  prompt,
  hint,
  starter,
  sourceChecks,
  ...rest
}) {
  const p = CH9[problemId];
  if (!p) {
    return <p>Unknown coding problem id: {problemId}</p>;
  }
  const title =
    titleProp ||
    (company ? `${problemId} · ${company}` : `${problemId} · ${p.company}`);
  return (
    <CodeExercise
      title={title}
      lang="python"
      filename="main.py"
      prompt={prompt || p.prompt}
      hint={hint || p.hint}
      starter={starter || p.starter}
      solution={p.solution}
      wrapSuffix={p.wrapSuffix}
      tests={p.tests}
      sampleLog={
        p.tests[0]
          ? `(sample)\n${p.tests[0].stdin}\n→ ${p.tests[0].equals}`
          : ''
      }
      sourceChecks={sourceChecks}
      {...rest}
    />
  );
}

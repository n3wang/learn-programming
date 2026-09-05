import React from 'react';
import SqlExercise from '@site/src/components/SqlExercise';
import {CH8} from './seeds.generated';

/**
 * One Chapter-8 interview SQL problem: wrap-seed + Data tab from generated bank.
 */
export default function SqlChapter8Exercise({
  problemId,
  company,
  title: titleProp,
  prompt,
  hint,
  starter,
  sourceChecks,
  ...rest
}) {
  const p = CH8[problemId];
  if (!p) {
    return <p>Unknown SQL problem id: {problemId}</p>;
  }
  // title must be a prop on this element for ExerciseSet tiles / completion tracking
  const title =
    titleProp || (company ? `${problemId} · ${company}` : `${problemId} · ${p.title}`);
  return (
    <SqlExercise
      title={title}
      prompt={prompt || p.title}
      seed={p.seed}
      tables={p.tables}
      solution={p.solution}
      starter={
        starter ||
        `-- Write a SQLite query for: ${p.title}\n-- Open the Data tab to inspect the seeded tables.\n`
      }
      hint={hint}
      tests={[{name: 'result', equals: p.expected}]}
      sourceChecks={sourceChecks}
      {...rest}
    />
  );
}

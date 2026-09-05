import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';

/**
 * Shared frame for 三元一次方程组 word-problem practice widgets.
 * Expects bookProblem()/generate() to return objects with x, y, z.
 */
export default function ThreeVarWordProblemBase({
  title,
  subtitle,
  bookProblem,
  generate,
  renderProblem,
  renderSolution,
}) {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const solved = useMemo(() => ({ x: p.x, y: p.y, z: p.z }), [p]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const loadBook = () => {
    setP(bookProblem());
    setKey((k) => k + 1);
  };

  return (
    <ProblemShell
      title={title}
      subtitle={subtitle}
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={renderSolution(p, solved)}
    >
      {renderProblem(p)}
    </ProblemShell>
  );
}

import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';

/**
 * Shared frame for 二元一次方程组 word-problem practice widgets:
 * book defaults, randomize, show/hide solution.
 */
export default function TwoVarWordProblemBase({
  title,
  subtitle,
  bookProblem,
  generate,
  renderProblem,
  renderSolution,
}) {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const solved = useMemo(() => ({ x: p.x, y: p.y }), [p]);

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

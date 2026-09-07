import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function count(n) {
  return (n * (n - 1)) / 2;
}

function bookProblem() {
  return { n: 4 };
}

function generate() {
  return { n: randInt(3, 8) };
}

export default function LineIntersectionCountSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const max = useMemo(() => count(p.n), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="最多" badgeClass={stepStyles.badgeSet}>
        要使交点最多：任意两条都相交，并且没有三条直线交于同一点。
      </SolutionStep>
      <SolutionStep badge="规律" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          2 条：1 个；3 条：3 个；4 条：6 个。n 条最多有 n(n − 1)/2 个交点。
          {p.n} 条最多有 {max} 个交点。第 n 条新直线最多与前面 n − 1 条各交一次，所以比 n − 1 条时多 n − 1 个交点。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="习题 10：直线相交的交点"
      subtitle="每两条直线最多一个交点，三条不交于同一点"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        两条直线相交，有一个交点。{p.n} 条直线相交，最多有多少个交点？
      </p>
      <p>书上先问 3 条、4 条，再找规律。点「随机」可换成别的条数。</p>
    </ProblemShell>
  );
}

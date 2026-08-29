import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Generates a random-but-solvable "工程问题" (work-rate problem): one person
 * alone would take H hours; x people work t1 hours, then a more people join
 * for t2 more hours, finishing the job. Built from a hidden true x so that
 * x·(t1+t2) = H − t2·a always has an exact integer solution.
 */
function generate() {
  const x = randInt(2, 6);
  const a = randInt(1, 4);
  const t1 = randInt(2, 6);
  const t2 = randInt(4, 12);
  const H = x * (t1 + t2) + t2 * a;
  return { a, t1, t2, H };
}

export default function BookSortingRateSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(generate);

  const solvedX = useMemo(() => Math.round((p.H - p.t2 * p.a) / (p.t1 + p.t2)), [p]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const solution = (
    <Box>
      <Typography sx={{ mb: 1 }}>
        把总工作量看作 1，一人一小时能完成 1/{p.H}。设先安排 <b>x</b> 人整理 {p.t1} h。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        先安排 x 人整理 {p.t1} h 完成的工作量是 ({p.t1}x)/{p.H}；增加 {p.a} 人后再整理 {p.t2}{' '}
        h 完成的工作量是 {p.t2}(x + {p.a})/{p.H}。两段工作量之和等于总工作量 1：
      </Typography>
      <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
        {p.t1}x/{p.H} + {p.t2}(x + {p.a})/{p.H} = 1
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        解得 x = <AnimatedNumber value={solvedX} />。答：应先安排{' '}
        <AnimatedNumber value={solvedX} /> 人进行整理。
      </Typography>
    </Box>
  );

  return (
    <ProblemShell
      title="工程问题：整理图书"
      subtitle="总时长、追加人数、两段工时都会随机变化"
      problemKey={key}
      onRandomize={randomize}
      solution={solution}
    >
      <Typography>
        整理一批图书，由 1 人整理需要 <b>{p.H}</b> h 完成。现计划由一部分人先整理{' '}
        <b>{p.t1}</b> h，然后增加 <b>{p.a}</b> 人与他们一起再整理 <b>{p.t2}</b> h，恰好完成
        这项工作。假设每人工作效率相同，应先安排多少人进行整理？
      </Typography>
    </ProblemShell>
  );
}

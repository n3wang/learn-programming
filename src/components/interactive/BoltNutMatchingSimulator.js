import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Generates a random-but-solvable "配套问题" (matching-quota problem):
 * T workers, each can make B bolts/day or N nuts/day, and each bolt needs
 * r nuts. B and N are built from the (hidden) true split x/y so that
 * N·(T−x) = r·B·x always has an exact integer solution.
 */
function generate() {
  const x = randInt(4, 12);
  const y = randInt(4, 12);
  const r = randInt(2, 4);
  const m = randInt(5, 15) * 10;
  const B = y * m;
  const N = r * m * x;
  return { r, B, N, T: x + y };
}

export default function BoltNutMatchingSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : generate()));

  const solvedX = useMemo(() => Math.round((p.N * p.T) / (p.N + p.r * p.B)), [p]);
  const solvedY = p.T - solvedX;
  usePracticeAnswer([numberField("x", "生产螺栓的工人", solvedX), numberField("y", "生产螺母的工人", solvedY)]);
  const boltsMade = p.B * solvedX;
  const nutsMade = p.N * solvedY;

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '螺栓工人'], [RED, '螺母工人']]}>
      <Step b="知" kind="set">
        配套问题：1 个螺栓配 {p.r} 个螺母，所以要刚好配套，
        <EqBox lines={[`\\text{螺母个数} = ${p.r} \\times \\text{螺栓个数}`]} />
      </Step>
      <Step b="设" kind="set">
        设安排 <M t={c(GREEN, 'x')} /> 名工人生产螺栓，则 <M t={c(RED, `${p.T} - x`)} /> 名工人生产螺母。
      </Step>
      <Step b="列" kind="list">
        螺栓 <M t={`${c(BLUE, p.B)}x`} /> 个，螺母 <M t={`${c(BLUE, p.N)}(${p.T} - x)`} /> 个：
        <EqBox lines={[`${p.N}(${p.T} - x) = ${p.r} \\times ${p.B}x`]} />
      </Step>
      <Step b="解" kind="solve">
        <EqBox
          lines={[
            `${p.N * p.T} - ${p.N}x = ${p.r * p.B}x`,
            `${p.N * p.T} = ${p.N + p.r * p.B}x`,
            `x = ${c(GREEN, solvedX)}, \\qquad ${p.T} - x = ${c(RED, solvedY)}`,
          ]}
        />
      </Step>
      <Step b="验" kind="check">
        螺栓 <M t={`${p.B}\\times ${solvedX} = ${boltsMade}`} /> 个，需要螺母 <M t={`${p.r}\\times ${boltsMade} = ${p.r * boltsMade}`} /> 个；
        生产螺母 <M t={`${p.N}\\times ${solvedY} = ${nutsMade}`} /> 个，正好相等 ✓
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          应安排 {solvedX} 名工人生产螺栓，{solvedY} 名工人生产螺母。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="配套问题：螺栓与螺母"
      subtitle="每人每天的产量和工人总数每次都随机生成——自己先列方程，再点开解答核对"
      problemKey={key}
      onRandomize={randomize}
      solution={solution}
    >
      <Typography>
        某车间共有 <b>{p.T}</b> 名工人，每人每天可以生产 <b>{p.B}</b> 个螺栓，或者{' '}
        <b>{p.N}</b> 个螺母。1 个螺栓需要配 <b>{p.r}</b> 个螺母。为使每天生产的螺栓和
        螺母刚好配套，应安排生产螺栓和螺母的工人各多少名？
      </Typography>
    </ProblemShell>
  );
}

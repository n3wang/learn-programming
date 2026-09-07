import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 7：金比银多 5，银比铜多 2，共 15 枚 → 金 9、银 4、铜 2。 */
function bookProblem() {
  return { total: 15, goldMoreThanSilver: 5, silverMoreThanBronze: 2 };
}

function generate() {
  const bronze = pickOne([1, 2, 3, 4]);
  const silverMoreThanBronze = pickOne([1, 2, 3]);
  const silver = bronze + silverMoreThanBronze;
  const goldMoreThanSilver = pickOne([2, 3, 4, 5]);
  const gold = silver + goldMoreThanSilver;
  return { total: gold + silver + bronze, goldMoreThanSilver, silverMoreThanBronze };
}

function derive(p) {
  const gold = (p.total + 2 * p.goldMoreThanSilver + p.silverMoreThanBronze) / 3;
  const silver = gold - p.goldMoreThanSilver;
  const bronze = silver - p.silverMoreThanBronze;
  return { gold, silver, bronze };
}

export default function MedalCountSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设金牌 <MathText text={tex('x')} /> 枚，则银牌 <MathText text={tex(`x-${p.goldMoreThanSilver}`)} /> 枚，铜牌{' '}
        <MathText text={tex(`x-${p.goldMoreThanSilver + p.silverMoreThanBronze}`)} /> 枚。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `x+(x-${p.goldMoreThanSilver})+(x-${p.goldMoreThanSilver + p.silverMoreThanBronze})=${p.total}`,
            )}
          />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        <MathText
          text={tex(
            `3x-${2 * p.goldMoreThanSilver + p.silverMoreThanBronze}=${p.total}`,
          )}
        />
        ，解得 <MathText text={tex(`x=${d.gold}`)} />。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          金牌 <AnimatedNumber value={d.gold} /> 枚，银牌 <AnimatedNumber value={d.silver} /> 枚，铜牌{' '}
          <AnimatedNumber value={d.bronze} /> 枚。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="7 冬奥奖牌：金、银、铜"
      subtitle="用一个未知数表示三种奖牌，总和等于已知枚数"
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
      <Typography>
        在一次运动会中，某代表团共获得 <b>{p.total}</b> 枚奖牌，其中金牌数比银牌数多{' '}
        <b>{p.goldMoreThanSilver}</b> 枚，银牌数比铜牌数多 <b>{p.silverMoreThanBronze}</b> 枚。一共获得多少枚金牌？
      </Typography>
    </ProblemShell>
  );
}

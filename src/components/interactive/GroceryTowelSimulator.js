import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 6：4 瓶×1.5 元 + 2 条毛巾 = 22 元 → 毛巾 8 元。 */
function bookProblem() {
  return { bottles: 4, bottlePrice: 1.5, towels: 2, total: 22 };
}

function generate() {
  const bottles = pickOne([2, 3, 4, 5]);
  const bottlePrice = pickOne([1, 1.5, 2, 2.5]);
  const towels = pickOne([2, 3]);
  const towelPrice = pickOne([4, 5, 6, 8, 10]);
  const total = bottles * bottlePrice + towels * towelPrice;
  if (!Number.isInteger(total)) return bookProblem();
  return { bottles, bottlePrice, towels, total };
}

function derive(p) {
  const bottleCost = p.bottles * p.bottlePrice;
  const towelPrice = (p.total - bottleCost) / p.towels;
  return { bottleCost, towelPrice };
}

export default function GroceryTowelSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设 1 条毛巾 <MathText text={tex('x')} /> 元。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${p.bottles}\\times ${p.bottlePrice}+${p.towels}x=${p.total}`)} />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        <MathText text={tex(`${d.bottleCost}+${p.towels}x=${p.total}`)} />
        ，故 <MathText text={tex(`x=${d.towelPrice}`)} />。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          1 条毛巾 <AnimatedNumber value={d.towelPrice} /> 元。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="6 矿泉水与毛巾"
      subtitle="总价 = 已知单价的部分 + 未知单价 × 件数"
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
        李明在超市买了 <b>{p.bottles}</b> 瓶矿泉水和 <b>{p.towels}</b> 条毛巾，共花了 <b>{p.total}</b> 元。已知 1
        瓶矿泉水的售价是 <b>{p.bottlePrice}</b> 元，1 条毛巾的售价是多少元？
      </Typography>
    </ProblemShell>
  );
}

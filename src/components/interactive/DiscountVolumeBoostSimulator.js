import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { fmtNum, pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 10：降价 20%，销量需增加 25% 才能使总金额不变。 */
function bookProblem() {
  return { discountPct: 20 };
}

function generate() {
  return { discountPct: pickOne([10, 20, 25, 40, 50]) };
}

function derive(p) {
  // (1 - d)(1 + x) = 1 → x = d/(1-d)
  const d = p.discountPct / 100;
  const boost = d / (1 - d);
  const boostPct = boost * 100;
  return {
    d,
    boost,
    boostPct,
    boostStr: fmtNum(boostPct, 4),
  };
}

export default function DiscountVolumeBoostSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设原价为 1，原销量为 1，则原销售总金额为 1。降价 {p.discountPct}% 后单价为{' '}
        <MathText text={tex(`1 - ${d.d} = ${fmtNum(1 - d.d, 4)}`)} />。设销量需增加到原来的{' '}
        <MathText text={tex('(1+x)')} /> 倍。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        总金额不变：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${fmtNum(1 - d.d, 4)}(1+x) = 1`)} />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        <MathText text={tex(`1+x = \\dfrac{{1}}{${fmtNum(1 - d.d, 4)}}`)} />，
        <MathText text={tex(`x = \\dfrac{${d.d}}{${fmtNum(1 - d.d, 4)}} = ${fmtNum(d.boost, 4)}`)} />，
        即增加 <MathText text={tex(`${d.boostStr}\\%`)} />。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          销售量要比按原价销售时增加 <AnimatedNumber value={Number(d.boostStr)} />%。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="降价促销：销量要增多少"
      subtitle="总金额不变 → (1−折扣)×(1+增量) = 1"
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
        商店对某商品降价 <b>{p.discountPct}</b>% 促销，为了使销售总金额不变，销售量要比按原价销售时增加百分之几？
      </Typography>
    </ProblemShell>
  );
}

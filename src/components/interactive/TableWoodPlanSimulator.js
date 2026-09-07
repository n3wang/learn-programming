import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 2：1 桌面 + 4 腿；1 m³ → 20 桌面或 400 腿；共 12 m³。 */
function bookProblem() {
  return { topsPerM3: 20, legsPerM3: 400, legsPerTable: 4, volume: 12 };
}

function generate() {
  for (let i = 0; i < 50; i++) {
    const topsPerM3 = pickOne([10, 20, 25]);
    const legsPerM3 = pickOne([200, 400, 500]);
    const legsPerTable = 4;
    const den = legsPerTable * topsPerM3 + legsPerM3;
    const volume = randInt(6, 24);
    if ((legsPerM3 * volume) % den !== 0) continue;
    const woodTops = (legsPerM3 * volume) / den;
    if (woodTops <= 0 || woodTops >= volume) continue;
    if (!Number.isInteger(woodTops * topsPerM3)) continue;
    return { topsPerM3, legsPerM3, legsPerTable, volume };
  }
  return bookProblem();
}

function derive(p) {
  const den = p.legsPerTable * p.topsPerM3 + p.legsPerM3;
  const woodTops = (p.legsPerM3 * p.volume) / den;
  const woodLegs = p.volume - woodTops;
  const tops = p.topsPerM3 * woodTops;
  const legs = p.legsPerM3 * woodLegs;
  const tables = tops; // equals legs / legsPerTable by construction
  return { woodTops, woodLegs, tops, legs, tables };
}

export default function TableWoodPlanSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设用 <MathText text={tex('x')} /> m³ 木材做桌面，则用{' '}
        <MathText text={tex(`${p.volume} - x`)} /> m³ 做桌腿。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        做成桌子最多时，桌面数应等于桌腿数 ÷ {p.legsPerTable}：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `${p.topsPerM3}x = \\dfrac{1}{${p.legsPerTable}}\\cdot ${p.legsPerM3}(${p.volume}-x)`,
            )}
          />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        整理得 <MathText text={tex(`${p.legsPerTable * p.topsPerM3}x + ${p.legsPerM3}x = ${p.legsPerM3}\\cdot ${p.volume}`)} />，
        解得 <MathText text={tex(`x = ${d.woodTops}`)} />。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          用 <AnimatedNumber value={d.woodTops} /> m³ 做桌面（
          <AnimatedNumber value={d.tops} /> 个），用 <AnimatedNumber value={d.woodLegs} /> m³
          做桌腿（
          <AnimatedNumber value={d.legs} /> 条），可做{' '}
          <AnimatedNumber value={d.tables} /> 张桌子。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="配套用料：桌面与桌腿"
      subtitle="两种部件共用木材，按配套比例分配才能做最多的桌子"
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
        制作一张桌子要用 1 个桌面和 <b>{p.legsPerTable}</b> 条桌腿。1 m³ 木材可制作{' '}
        <b>{p.topsPerM3}</b> 个桌面，或者制作 <b>{p.legsPerM3}</b> 条桌腿。现有{' '}
        <b>{p.volume}</b> m³ 木材，应怎样计划用料才能制作尽可能多的桌子？
      </Typography>
    </ProblemShell>
  );
}

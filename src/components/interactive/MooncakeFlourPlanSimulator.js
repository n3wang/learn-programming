import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { fmtNum, pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 8：每盒 2 大 + 4 小；大 0.05 kg，小 0.02 kg；面粉 4500 kg。 */
function bookProblem() {
  return {
    largePerBox: 2,
    smallPerBox: 4,
    flourLarge: 0.05,
    flourSmall: 0.02,
    totalFlour: 4500,
  };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const largePerBox = pickOne([1, 2]);
    const smallPerBox = pickOne([2, 4, 6]);
    const flourLarge = pickOne([0.04, 0.05, 0.06]);
    const flourSmall = pickOne([0.01, 0.02, 0.03]);
    const perBox =
      largePerBox * flourLarge + smallPerBox * flourSmall;
    // totalFlour should be multiple of perBox for integer boxes
    const boxes = randInt(1000, 4000);
    const totalFlour = Math.round(boxes * perBox * 1000) / 1000;
    if (Math.abs(totalFlour - Math.round(totalFlour)) > 1e-9) continue;
    const flourForLarge =
      (totalFlour * largePerBox * flourLarge) / perBox;
    if (Math.abs(flourForLarge - Math.round(flourForLarge)) > 1e-6) continue;
    return {
      largePerBox,
      smallPerBox,
      flourLarge,
      flourSmall,
      totalFlour: Math.round(totalFlour),
    };
  }
  return bookProblem();
}

function derive(p) {
  const needLarge = p.largePerBox * p.flourLarge;
  const needSmall = p.smallPerBox * p.flourSmall;
  const perBox = needLarge + needSmall;
  const flourForLarge = (p.totalFlour * needLarge) / perBox;
  const flourForSmall = p.totalFlour - flourForLarge;
  const boxes = p.totalFlour / perBox;
  return {
    needLarge,
    needSmall,
    perBox,
    flourForLarge,
    flourForSmall,
    boxes,
    largeStr: fmtNum(flourForLarge, 4),
    smallStr: fmtNum(flourForSmall, 4),
  };
}

export default function MooncakeFlourPlanSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="析" badgeClass={stepStyles.badgeSet}>
        每盒需要面粉{' '}
        <MathText
          text={tex(
            `${p.largePerBox}\\times ${p.flourLarge} + ${p.smallPerBox}\\times ${p.flourSmall} = ${d.perBox}`,
          )}
        />{' '}
        kg。要做最多盒，大小月饼的面粉应按这个比例分配。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        设用 <MathText text={tex('x')} /> kg 面粉做大月饼，则小月饼用{' '}
        <MathText text={tex(`${p.totalFlour}-x`)} /> kg。配套时：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\dfrac{x}{${p.flourLarge}} \\Big/ ${p.largePerBox} = \\dfrac{${p.totalFlour}-x}{${p.flourSmall}} \\Big/ ${p.smallPerBox}`,
            )}
          />
        </div>
        即大、小月饼个数比为 <MathText text={tex(`${p.largePerBox}:${p.smallPerBox}`)} />。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        面粉比应为{' '}
        <MathText
          text={tex(
            `${p.largePerBox}\\times ${p.flourLarge} : ${p.smallPerBox}\\times ${p.flourSmall} = ${d.needLarge}:${d.needSmall}`,
          )}
        />
        ，故大月饼用粉 <MathText text={tex(`x = ${d.largeStr}`)} /> kg。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          大月饼用 <AnimatedNumber value={Number(d.largeStr)} /> kg 面粉，小月饼用{' '}
          <AnimatedNumber value={Number(d.smallStr)} /> kg 面粉，最多约{' '}
          <AnimatedNumber value={d.boxes} /> 盒。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="配套用料：大小月饼面粉"
      subtitle="每盒固定配比 → 面粉也按固定比例分配"
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
        某糕点厂要制作一批盒装月饼，每盒中装 <b>{p.largePerBox}</b> 块大月饼和{' '}
        <b>{p.smallPerBox}</b> 块小月饼。制作 1 块大月饼要用 <b>{p.flourLarge}</b> kg 面粉，制作 1
        块小月饼要用 <b>{p.flourSmall}</b> kg 面粉。现有面粉 <b>{p.totalFlour}</b> kg，应各用多少千克面粉制作两种月饼，才能生产最多的盒装月饼？
      </Typography>
    </ProblemShell>
  );
}

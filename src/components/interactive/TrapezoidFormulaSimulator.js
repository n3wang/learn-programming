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

/** 书题 5：S=30,a=6,h=4→b=9；S=60,b=4,h=12→a=6；S=50,a=6,b=(5/3)a→h=25/4。 */
function bookProblem() {
  return { s1: 30, a1: 6, h1: 4, s2: 60, b2: 4, h2: 12, s3: 50, a3: 6, ratioNum: 5, ratioDen: 3 };
}

function generate() {
  const a1 = pickOne([4, 6, 8]);
  const h1 = pickOne([4, 6]);
  const b1 = pickOne([6, 8, 10]);
  const s1 = ((a1 + b1) * h1) / 2;
  const a2 = pickOne([5, 6, 8]);
  const b2 = pickOne([4, 6]);
  const h2 = pickOne([6, 10, 12]);
  const s2 = ((a2 + b2) * h2) / 2;
  const a3 = pickOne([3, 6, 9]);
  const ratioNum = 5;
  const ratioDen = 3;
  if ((a3 * ratioNum) % ratioDen !== 0) return bookProblem();
  const b3 = (a3 * ratioNum) / ratioDen;
  const h3 = pickOne([4, 5, 8]);
  const s3 = ((a3 + b3) * h3) / 2;
  if (![s1, s2, s3].every(Number.isInteger)) return bookProblem();
  return { s1, a1, h1, s2, b2, h2, s3, a3, ratioNum, ratioDen };
}

function derive(p) {
  const b1 = (2 * p.s1) / p.h1 - p.a1;
  const a2 = (2 * p.s2) / p.h2 - p.b2;
  const b3 = (p.a3 * p.ratioNum) / p.ratioDen;
  const h3 = (2 * p.s3) / (p.a3 + b3);
  return { b1, a2, b3, h3 };
}

export default function TrapezoidFormulaSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="式" badgeClass={stepStyles.badgeSet}>
        梯形面积 <MathText text={tex('S=\\dfrac{1}{2}(a+b)h')} />。已知三个量、求第四个量时，代入后就是关于那个未知数的一元一次方程。
      </SolutionStep>
      <SolutionStep badge="(1)" badgeClass={stepStyles.badgeList}>
        <MathText text={tex(`${p.s1}=\\dfrac{1}{2}(${p.a1}+b)\\times ${p.h1}`)} />
        ，解得 <MathText text={tex(`b=${fmtNum(d.b1, 4)}`)} />。
      </SolutionStep>
      <SolutionStep badge="(2)" badgeClass={stepStyles.badgeSolve}>
        <MathText text={tex(`${p.s2}=\\dfrac{1}{2}(a+${p.b2})\\times ${p.h2}`)} />
        ，解得 <MathText text={tex(`a=${fmtNum(d.a2, 4)}`)} />。
      </SolutionStep>
      <SolutionStep badge="(3)" badgeClass={stepStyles.badgeAnswer}>
        <MathText
          text={tex(
            `b=\\dfrac{${p.ratioNum}}{${p.ratioDen}}\\times ${p.a3}=${fmtNum(d.b3, 4)}`,
          )}
        />
        ，再由 <MathText text={tex(`${p.s3}=\\dfrac{1}{2}(${p.a3}+${fmtNum(d.b3, 4)})h`)} />
        得 <MathText text={tex(`h=${fmtNum(d.h3, 4)}`)} />。
        <div className={stepStyles.answer}>
          （1）<AnimatedNumber value={d.b1} />；（2）<AnimatedNumber value={d.a2} />；（3）
          <AnimatedNumber value={d.h3} />。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="5 梯形面积公式中求未知量"
      subtitle="S = 1/2 (a+b)h；把已知数代入，解关于未知数的方程"
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
        在梯形面积公式 <MathText text={tex('S=\\dfrac{1}{2}(a+b)h')} /> 中，
        <br />
        （1）已知 <MathText text={tex(`S=${p.s1},\\; a=${p.a1},\\; h=${p.h1}`)} />，求 <MathText text={tex('b')} />；
        <br />
        （2）已知 <MathText text={tex(`S=${p.s2},\\; b=${p.b2},\\; h=${p.h2}`)} />，求 <MathText text={tex('a')} />；
        <br />
        （3）已知 <MathText text={tex(`S=${p.s3},\\; a=${p.a3},\\; b=\\dfrac{${p.ratioNum}}{${p.ratioDen}}a`)} />，求{' '}
        <MathText text={tex('h')} />。
      </Typography>
    </ProblemShell>
  );
}

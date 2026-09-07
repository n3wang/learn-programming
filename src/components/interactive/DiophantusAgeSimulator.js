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

/**
 * Classic Diophantus riddle (书题 13).
 * Fractions of life + fixed years sum to whole life.
 * Default: 1/6 + 1/12 + 1/7 + 5 + 1/2 + 4 = 1 → age 84, father at 38.
 */
function bookProblem() {
  return {
    childhood: 6,
    youth: 12,
    marriage: 7,
    beforeSon: 5,
    sonHalf: 2,
    afterSon: 4,
  };
}

/** Other historically-flavored variants that still yield integer age. */
function generate() {
  // Keep structure; vary the fixed years / son ratio slightly with known-nice solutions
  return pickOne([
    bookProblem(),
    // childhood 1/5, youth 1/10, marriage 1/8, +4, son half, +3 → ?
    // Prefer curated integer solutions:
    { childhood: 6, youth: 12, marriage: 7, beforeSon: 5, sonHalf: 2, afterSon: 4 },
    // A simpler school variant sometimes used: same fractions, tweak fixed years carefully
    // 1/6+1/12+1/7+6+1/2+3 = 1 → let's verify
    // 75/84 + 9 = 1 → same as book if beforeSon+afterSon=9
    { childhood: 6, youth: 12, marriage: 7, beforeSon: 6, sonHalf: 2, afterSon: 3 },
    { childhood: 6, youth: 12, marriage: 7, beforeSon: 4, sonHalf: 2, afterSon: 5 },
  ]);
}

function derive(p) {
  // x/c + x/y + x/m + before + x/s + after = x
  // x(1/c + 1/y + 1/m + 1/s) + (before+after) = x
  // before+after = x - x(1/c+1/y+1/m+1/s) = x(1 - sum)
  const sumFrac = 1 / p.childhood + 1 / p.youth + 1 / p.marriage + 1 / p.sonHalf;
  const fixed = p.beforeSon + p.afterSon;
  const ageRaw = fixed / (1 - sumFrac);
  const age = Math.round(ageRaw);
  const fatherAge = Math.round(
    age / p.childhood + age / p.youth + age / p.marriage + p.beforeSon,
  );
  const sonAge = age / p.sonHalf;
  return { age, fatherAge, sonAge, sumFrac, fixed };
}

export default function DiophantusAgeSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设丢番图的寿命为 <MathText text={tex('x')} /> 岁。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        按碑文把各阶段加起来等于一生：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\dfrac{x}{${p.childhood}} + \\dfrac{x}{${p.youth}} + \\dfrac{x}{${p.marriage}} + ${p.beforeSon} + \\dfrac{x}{${p.sonHalf}} + ${p.afterSon} = x`,
            )}
          />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        合并含 <MathText text={tex('x')} /> 的项：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `x\\left(\\dfrac{{1}}{${p.childhood}}+\\dfrac{{1}}{${p.youth}}+\\dfrac{{1}}{${p.marriage}}+\\dfrac{{1}}{${p.sonHalf}}\\right) + ${d.fixed} = x`,
            )}
          />
        </div>
        解得 <MathText text={tex(`x = ${d.age}`)} />。
        开始当爸爸的年龄为童年 + 少年 + 婚后至得子：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\dfrac{${d.age}}{${p.childhood}} + \\dfrac{${d.age}}{${p.youth}} + \\dfrac{${d.age}}{${p.marriage}} + ${p.beforeSon} = ${d.fatherAge}`,
            )}
          />
        </div>
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          （1）寿命 <AnimatedNumber value={d.age} /> 岁； （2）开始当爸爸时{' '}
          <AnimatedNumber value={d.fatherAge} /> 岁。
        </div>
        <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
          可继续提问：儿子活了几岁？（答：
          <AnimatedNumber value={d.sonAge} /> 岁）结婚时几岁？等等。
        </Typography>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="丢番图的墓碑"
      subtitle="把「生命的几分之几 + 若干年」写成方程，求寿命"
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
        希腊数学家丢番图的墓碑上记载着：他生命的 <b>1/{p.childhood}</b> 是幸福的童年；再活了生命的{' '}
        <b>1/{p.youth}</b>，两颊长起了细细的胡须；又度过了一生的 <b>1/{p.marriage}</b>
        ，他结了婚；再过 <b>{p.beforeSon}</b> 年，他有了儿子；儿子只活了他父亲全部年龄的{' '}
        <b>1/{p.sonHalf}</b>；儿子死后，他在极度悲痛中度过了 <b>{p.afterSon}</b> 年，也与世长辞了。
        <br />
        （1）丢番图的寿命是多少？
        <br />
        （2）丢番图开始当爸爸时的年龄是多少？
        <br />
        也可以自己再提出其他问题并加以解决。
      </Typography>
    </ProblemShell>
  );
}

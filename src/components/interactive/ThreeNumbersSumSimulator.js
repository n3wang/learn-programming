import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import ThreeVarWordProblemBase from '@site/src/components/interactive/shell/ThreeVarWordProblemBase';
import ThreeVarSolution from '@site/src/components/interactive/shell/ThreeVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY, texZ } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：甲+乙+丙=35，2甲−乙=5，乙/3=丙/2 → 10, 15, 10。 */
function bookProblem() {
  return { sum: 35, more: 5, x: 10, y: 15, z: 10 };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const x = randInt(4, 16);
    const y = 2 * x - randInt(1, 6); // 2x - y = more > 0 usually
    const more = 2 * x - y;
    if (more === 0 || y <= 0) continue;
    if (y % 3 !== 0) continue;
    const z = (2 * y) / 3;
    if (!Number.isInteger(z) || z <= 0) continue;
    return { sum: x + y + z, more, x, y, z };
  }
  return bookProblem();
}

export default function ThreeNumbersSumSimulator() {
  return (
    <ThreeVarWordProblemBase
      title="甲、乙、丙三个数"
      subtitle="和 + 「2 倍差」+ 比例关系 → 三元一次方程组"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          甲、乙、丙三个数的和是 <b>{p.sum}</b>，甲数的 2 倍比乙数大 <b>{p.more}</b>，乙数的{' '}
          <MathText text={'$\\dfrac{1}{3}$'} /> 等于丙数的 <MathText text={'$\\dfrac{1}{2}$'} />
          。求这三个数。
        </Typography>
      )}
      renderSolution={(p, s) => (
        <ThreeVarSolution
          legendX="甲数"
          legendY="乙数"
          legendZ="丙数"
          setText={
            <>
              设甲、乙、丙分别为 <MathText text={texX()} />、<MathText text={texY()} />、
              <MathText text={texZ()} />。
            </>
          }
          eq1={`x + y + z = ${p.sum}`}
          eq2={`2x - y = ${p.more}`}
          eq3={`\\dfrac{y}{3} = \\dfrac{z}{2}`}
          solveText={
            <>
              由 ③ 得 <MathText text={texEq('2y = 3z')} />，即{' '}
              <MathText text={texEq('z = \\dfrac{2}{3}y')} />。与 ①② 联立（或先由 ② 解出 x 再代入）。
            </>
          }
          x={s.x}
          y={s.y}
          z={s.z}
          answer={
            <>
              甲 <AnimatedNumber value={s.x} />，乙 <AnimatedNumber value={s.y} />，丙{' '}
              <AnimatedNumber value={s.z} />。
            </>
          }
          check={
            <MathText
              text={`验算：${texEq(`${s.x}+${s.y}+${s.z}=${p.sum}`)}；${texEq(
                `2\\times ${s.x}-${s.y}=${p.more}`,
              )}；${texEq(`${s.y}/3=${s.z}/2`)} ✓`}
            />
          }
        />
      )}
    />
  );
}

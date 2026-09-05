import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import ThreeVarWordProblemBase from '@site/src/components/interactive/shell/ThreeVarWordProblemBase';
import ThreeVarSolution from '@site/src/components/interactive/shell/ThreeVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY, texZ } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * y = a x² + b x + c。书题：x=1→−2；x=−1→20；x=3/2 与 1/3 时 y 相等 → a=6,b=-11,c=3。
 * 存 x=a,y=b,z=c。
 */
function bookProblem() {
  return {
    x1: 1,
    y1: -2,
    x2: -1,
    y2: 20,
    r1: 3 / 2,
    r2: 1 / 3,
    x: 6,
    y: -11,
    z: 3,
  };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const a = randInt(2, 8);
    // equal-y at r1,r2 ⇒ a(r1²−r2²)+b(r1−r2)=0 ⇒ b = -a(r1+r2)
    const r1 = pickHalf();
    const r2 = pickOther(r1);
    const b = -a * (r1 + r2);
    if (!Number.isInteger(b)) continue;
    const c = randInt(-5, 8);
    const x1 = 1;
    const x2 = -1;
    const y1 = a * x1 * x1 + b * x1 + c;
    const y2 = a * x2 * x2 + b * x2 + c;
    return { x1, y1, x2, y2, r1, r2, x: a, y: b, z: c };
  }
  return bookProblem();
}

function pickHalf() {
  return randInt(2, 5) / 2;
}

function pickOther(r1) {
  const cand = [1 / 3, 1 / 2, 2 / 3, 1 / 4, 3 / 4].filter((v) => Math.abs(v - r1) > 0.05);
  return cand[randInt(0, cand.length - 1)];
}

function fmtFrac(n) {
  if (Number.isInteger(n)) return `${n}`;
  if (Math.abs(n * 2 - Math.round(n * 2)) < 1e-9) {
    const t = Math.round(n * 2);
    return t % 2 === 0 ? `${t / 2}` : `\\dfrac{${t}}{2}`;
  }
  if (Math.abs(n * 3 - Math.round(n * 3)) < 1e-9) {
    const t = Math.round(n * 3);
    return t % 3 === 0 ? `${t / 3}` : `\\dfrac{${t}}{3}`;
  }
  return `${n}`;
}

export default function QuadraticCoeffsThreeVarSimulator() {
  return (
    <ThreeVarWordProblemBase
      title="二次函数系数 a、b、c"
      subtitle="两点取值 + 「两处 y 相等」→ 关于 a、b、c 的方程组"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          在等式 <MathText text={'$y = ax^2 + bx + c$'} /> 中，当{' '}
          <MathText text={`$x=${p.x1}$`} /> 时，<MathText text={`$y=${p.y1}$`} />；当{' '}
          <MathText text={`$x=${p.x2}$`} /> 时，<MathText text={`$y=${p.y2}$`} />；当{' '}
          <MathText text={`$x=${fmtFrac(p.r1)}$`} /> 与 <MathText text={`$x=${fmtFrac(p.r2)}$`} />{' '}
          时，y 的值相等。求 <MathText text={'$a,b,c$'} /> 的值。
        </Typography>
      )}
      renderSolution={(p, s) => (
        <ThreeVarSolution
          legendX="系数 a"
          legendY="系数 b"
          legendZ="系数 c"
          setText={
            <>
              设 <MathText text={texX()} />、<MathText text={texY()} />、<MathText text={texZ()} />{' '}
              分别表示 a、b、c。
            </>
          }
          eq1={`${p.x1 ** 2}x + (${p.x1})y + z = ${p.y1}`}
          eq2={`${p.x2 ** 2}x + (${p.x2})y + z = ${p.y2}`}
          eq3={`x\\cdot\\big((${fmtFrac(p.r1)})^2-(${fmtFrac(p.r2)})^2\\big) + y\\cdot\\big(${fmtFrac(p.r1)}-${fmtFrac(p.r2)}\\big) = 0`}
          solveText={
            <>
              ①② 可先相加、相减消去 c，得 a、c 关系与 b。③ 来自「两处 y 相等」两边相减：
              <MathText
                text={texEq(
                  `a(${fmtFrac(p.r1)}^2-${fmtFrac(p.r2)}^2)+b(${fmtFrac(p.r1)}-${fmtFrac(p.r2)})=0`,
                )}
              />
              。
            </>
          }
          x={s.x}
          y={s.y}
          z={s.z}
          answer={
            <>
              <MathText text={'$a=$'} />
              <AnimatedNumber value={s.x} />，<MathText text={'$b=$'} />
              <AnimatedNumber value={s.y} />，<MathText text={'$c=$'} />
              <AnimatedNumber value={s.z} />。
            </>
          }
          check={
            <MathText
              text={`验算：${texEq(
                `${s.x}(${p.x1})^2+(${s.y})(${p.x1})+${s.z}=${p.y1}`,
              )}；${texEq(`${s.x}(${p.x2})^2+(${s.y})(${p.x2})+${s.z}=${p.y2}`)}；两处 y 相等 ✓`}
            />
          }
        />
      )}
    />
  );
}

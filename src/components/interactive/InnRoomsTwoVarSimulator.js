import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 《算法统宗》：一房 a 客多 a 客；一房 b 客一房空。
 * 书题：a=7，b=9 → 8 间房、63 客。
 */
function bookProblem() {
  return { a: 7, b: 9, x: 8, y: 63 };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const a = randInt(5, 9);
    const b = randInt(a + 1, 12);
    // y = a x + a = b(x-1) = b x - b → (b-a)x = a+b → x = (a+b)/(b-a)
    if ((a + b) % (b - a) !== 0) continue;
    const x = (a + b) / (b - a);
    if (x <= 1 || !Number.isInteger(x)) continue;
    const y = a * x + a;
    return { a, b, x, y };
  }
  return bookProblem();
}

export default function InnRoomsTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="《算法统宗》：客房与房客"
      subtitle="「每房 a 人多 a 人」与「每房 b 人空一房」——翻译成两个方程"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          《算法统宗》有题：我问开店李三公，众客都来到店中。一房 <b>{p.a}</b> 客多 <b>{p.a}</b> 客，一房{' '}
          <b>{p.b}</b> 客一房空。李三公家有多少间客房，来了多少房客？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <TwoVarSolution
          legendX="客房间数"
          legendY="房客人数"
          setText={
            <>
              设客房 <MathText text={texX()} /> 间，房客 <MathText text={texY()} /> 人。
            </>
          }
          eq1={`y = ${p.a}x + ${p.a}`}
          eq2={`y = ${p.b}(x - 1)`}
          solveText={
            <>
              「一房 {p.a} 客多 {p.a} 客」即 <MathText text={texEq(`y=${p.a}x+${p.a}`)} />
              ；「一房 {p.b} 客一房空」即 <MathText text={texEq(`y=${p.b}(x-1)`)} />。两式联立。
            </>
          }
          x={s.x}
          y={s.y}
          answer={
            <>
              客房 <AnimatedNumber value={s.x} /> 间，房客 <AnimatedNumber value={s.y} /> 人。
            </>
          }
          check={
            <MathText
              text={`验算：${texEq(`${s.y}=${p.a}\\times ${s.x}+${p.a}`)}；${texEq(
                `${s.y}=${p.b}\\times(${s.x}-1)`,
              )} ✓`}
            />
          }
        />
      )}
    />
  );
}

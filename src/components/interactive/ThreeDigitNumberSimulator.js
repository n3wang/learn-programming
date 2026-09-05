import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import ThreeVarWordProblemBase from '@site/src/components/interactive/shell/ThreeVarWordProblemBase';
import ThreeVarSolution from '@site/src/components/interactive/shell/ThreeVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY, texZ } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：十位=2×百位；3×百位−个位=十位/4；各位和 11 → 245。x=百,y=十,z=个。 */
function bookProblem() {
  return { sum: 11, x: 2, y: 4, z: 5 };
}

function generate() {
  for (let h = 1; h <= 4; h++) {
    const t = 2 * h;
    // 3h - o = t/4 = h/2 → o = 3h - h/2 = (5/2)h
    if ((5 * h) % 2 !== 0) continue;
    const o = (5 * h) / 2;
    if (!Number.isInteger(o) || o < 0 || o > 9) continue;
    if (t > 9) continue;
    const sum = h + t + o;
    if (sum !== 11 && Math.random() < 0.7) {
      // occasionally keep other sums
    }
    return { sum, x: h, y: t, z: o };
  }
  // random variant: t = k*h with k=2, sum random valid
  for (let i = 0; i < 30; i++) {
    const h = randInt(1, 4);
    const t = 2 * h;
    if (t > 9) continue;
    const o = (5 * h) / 2;
    if (!Number.isInteger(o) || o < 0 || o > 9) continue;
    return { sum: h + t + o, x: h, y: t, z: o };
  }
  return bookProblem();
}

export default function ThreeDigitNumberSimulator() {
  return (
    <ThreeVarWordProblemBase
      title="三位数：各位数字关系"
      subtitle="设百、十、个位为未知数 → 三元一次方程组"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          一个三位数，十位上的数等于百位上的数的 2 倍，百位上的数的 3 倍减去个位上的数等于十位上的数的{' '}
          <MathText text={'$\\dfrac{1}{4}$'} />，且各数位上的数的和为 <b>{p.sum}</b>。求这个三位数。
        </Typography>
      )}
      renderSolution={(p, s) => {
        const n = 100 * s.x + 10 * s.y + s.z;
        return (
          <ThreeVarSolution
            legendX="百位数字"
            legendY="十位数字"
            legendZ="个位数字"
            setText={
              <>
                设百、十、个位数字分别为 <MathText text={texX()} />、<MathText text={texY()} />、
                <MathText text={texZ()} />。
              </>
            }
            eq1={`y = 2x`}
            eq2={`3x - z = \\dfrac{1}{4}y`}
            eq3={`x + y + z = ${p.sum}`}
            solveText={
              <>
                把 <MathText text={texEq('y=2x')} /> 代入 ②：
                <MathText text={texEq('3x - z = \\dfrac{1}{2}x')} />，得{' '}
                <MathText text={texEq('z = \\dfrac{5}{2}x')} />，再与 ③ 联立（x 须为 1–9 的整数）。
              </>
            }
            x={s.x}
            y={s.y}
            z={s.z}
            answer={
              <>
                这个三位数是 <AnimatedNumber value={n} />。
              </>
            }
            check={
              <MathText
                text={`验算：${texEq(`${s.y}=2\\times ${s.x}`)}；${texEq(
                  `3\\times ${s.x}-${s.z}=\\dfrac{1}{4}\\times ${s.y}`,
                )}；${texEq(`${s.x}+${s.y}+${s.z}=${p.sum}`)} ✓`}
              />
            }
          />
        );
      }}
    />
  );
}

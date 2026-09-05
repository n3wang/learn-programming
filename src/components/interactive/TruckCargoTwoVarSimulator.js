import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：2x+3y=15.5，5x+6y=35 → x=4，y=2.5；问 3x+5y。 */
function bookProblem() {
  return {
    a1: 2,
    b1: 3,
    c1: 15.5,
    a2: 5,
    b2: 6,
    c2: 35,
    qx: 3,
    qy: 5,
    x: 4,
    y: 2.5,
  };
}

function generate() {
  for (let t = 0; t < 40; t++) {
    const x = randInt(2, 8);
    const y = randInt(1, 6) + pickHalf();
    const a1 = randInt(1, 4);
    const b1 = randInt(2, 5);
    const a2 = a1 + randInt(1, 4);
    const b2 = b1 + randInt(1, 4);
    if (a1 * b2 === a2 * b1) continue;
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    if (!Number.isInteger(c1 * 2) || !Number.isInteger(c2 * 2)) continue;
    const qx = randInt(2, 5);
    const qy = randInt(3, 7);
    return { a1, b1, c1, a2, b2, c2, qx, qy, x, y };
  }
  return bookProblem();
}

function pickHalf() {
  return Math.random() < 0.5 ? 0 : 0.5;
}

export default function TruckCargoTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="大小货车运货"
      subtitle="两组「大车+小车」运量 → 再求另一组合的运量"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          某运输公司有大小两种型号的货车。
          <b>{p.a1}</b> 辆大货车与 <b>{p.b1}</b> 辆小货车一次可以运货 <b>{p.c1}</b> t；
          <b>{p.a2}</b> 辆大货车与 <b>{p.b2}</b> 辆小货车一次可以运货 <b>{p.c2}</b> t。
          <br />
          <b>{p.qx}</b> 辆大货车与 <b>{p.qy}</b> 辆小货车一次可以运货多少吨？
        </Typography>
      )}
      renderSolution={(p, s) => {
        const combo = p.qx * s.x + p.qy * s.y;
        return (
          <TwoVarSolution
            legendX="大货车运量（t / 辆）"
            legendY="小货车运量（t / 辆）"
            setText={
              <>
                设大货车每辆运 <MathText text={texX()} /> t，小货车每辆运 <MathText text={texY()} /> t。
              </>
            }
            eq1={`${p.a1}x + ${p.b1}y = ${p.c1}`}
            eq2={`${p.a2}x + ${p.b2}y = ${p.c2}`}
            solveText={<>用加减消元法（或代入法）求出每辆车的运量，再代入所求组合。</>}
            x={s.x}
            y={s.y}
            answer={
              <>
                <MathText text={texEq(`${p.qx}x + ${p.qy}y = ${combo}`)} />，即一次可运货{' '}
                <AnimatedNumber value={combo} decimals={Number.isInteger(combo) ? 0 : 1} /> t。
              </>
            }
            check={
              <MathText
                text={`验算：${texEq(`${p.a1}\\times ${s.x}+${p.b1}\\times ${s.y}=${p.c1}`)}；${texEq(
                  `${p.a2}\\times ${s.x}+${p.b2}\\times ${s.y}=${p.c2}`,
                )} ✓`}
              />
            }
          />
        );
      }}
    />
  );
}

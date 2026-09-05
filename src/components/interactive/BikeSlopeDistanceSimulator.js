import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 甲→乙：上坡 + 平路；乙→甲：下坡 + 平路。
 * 书题：30/40/50 km/h，54 min / 42 min → 上坡 15 km，平路 16 km，全程 31 km。
 */
function bookProblem() {
  return {
    vUp: 30,
    vFlat: 40,
    vDown: 50,
    tAB: 54,
    tBA: 42,
    x: 15,
    y: 16,
  };
}

function generate() {
  for (let i = 0; i < 50; i++) {
    const vUp = pickOne([20, 24, 30]);
    const vFlat = pickOne([30, 40, 45]);
    const vDown = pickOne([40, 48, 50, 60]);
    if (!(vUp < vFlat && vFlat < vDown)) continue;
    const x = randInt(8, 20);
    const y = randInt(8, 24);
    // times in hours
    const tAB = x / vUp + y / vFlat;
    const tBA = x / vDown + y / vFlat;
    const minAB = Math.round(tAB * 60);
    const minBA = Math.round(tBA * 60);
    if (Math.abs(minAB / 60 - tAB) > 1e-9 || Math.abs(minBA / 60 - tBA) > 1e-9) continue;
    if (minAB <= minBA) continue;
    return { vUp, vFlat, vDown, tAB: minAB, tBA: minBA, x, y };
  }
  return bookProblem();
}

export default function BikeSlopeDistanceSimulator() {
  return (
    <TwoVarWordProblemBase
      title="上坡·平路·下坡：求全程"
      subtitle="去程上坡+平路，回程下坡+平路——时间方程联立"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          甲地到乙地由一段上坡路与一段平路组成。运动员上坡 <b>{p.vUp}</b> km/h，平路{' '}
          <b>{p.vFlat}</b> km/h，下坡 <b>{p.vDown}</b> km/h。从甲地到乙地需 <b>{p.tAB}</b> min，从乙地到甲地需{' '}
          <b>{p.tBA}</b> min。甲地到乙地全程是多少千米？
        </Typography>
      )}
      renderSolution={(p, s) => {
        const total = s.x + s.y;
        const hAB = p.tAB / 60;
        const hBA = p.tBA / 60;
        return (
          <TwoVarSolution
            legendX="上坡路长（km）"
            legendY="平路路长（km）"
            setText={
              <>
                设上坡路长 <MathText text={texX()} /> km，平路路长 <MathText text={texY()} /> km。
                去程走「上坡+平路」，回程走「下坡+平路」（上坡段回程变为下坡）。
              </>
            }
            eq1={`\\dfrac{x}{${p.vUp}} + \\dfrac{y}{${p.vFlat}} = \\dfrac{${p.tAB}}{60}`}
            eq2={`\\dfrac{x}{${p.vDown}} + \\dfrac{y}{${p.vFlat}} = \\dfrac{${p.tBA}}{60}`}
            solveText={
              <>
                可先化为 <MathText text={texEq(`${hAB} = x/${p.vUp} + y/${p.vFlat}`)} /> 与{' '}
                <MathText text={texEq(`${hBA} = x/${p.vDown} + y/${p.vFlat}`)} />
                ，两边同乘公倍数消元。全程 = 上坡 + 平路。
              </>
            }
            x={s.x}
            y={s.y}
            answer={
              <>
                全程 <MathText text={texEq(`x + y = ${total}`)} /> km，即{' '}
                <AnimatedNumber value={total} /> km。
              </>
            }
            check={
              <MathText
                text={`验算：甲→乙 ${texEq(
                  `${s.x}/${p.vUp}+${s.y}/${p.vFlat}=${hAB}`,
                )}（${p.tAB} min）；乙→甲 ${texEq(
                  `${s.x}/${p.vDown}+${s.y}/${p.vFlat}=${hBA}`,
                )}（${p.tBA} min）✓`}
              />
            }
          />
        );
      }}
    />
  );
}

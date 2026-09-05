import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import ThreeVarWordProblemBase from '@site/src/components/interactive/shell/ThreeVarWordProblemBase';
import ThreeVarSolution from '@site/src/components/interactive/shell/ThreeVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY, texZ } from '@site/src/components/interactive/shell/texMath';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 上坡 x、平路 y、下坡 z。甲→乙：x/vu+y/vf+z/vd；乙→甲：z/vu+y/vf+x/vd。
 * 书题：3.3 km，3/4/5 km/h，51 min / 53.4 min → 1.2, 0.6, 1.5。
 */
function bookProblem() {
  return {
    total: 3.3,
    vUp: 3,
    vFlat: 4,
    vDown: 5,
    tAB: 51,
    tBA: 53.4,
    x: 1.2,
    y: 0.6,
    z: 1.5,
  };
}

function generate() {
  for (let i = 0; i < 60; i++) {
    const vUp = pickOne([3, 4]);
    const vFlat = pickOne([4, 5, 6]);
    const vDown = pickOne([5, 6, 8]);
    if (!(vUp < vFlat && vFlat <= vDown)) continue;
    const x = randInt(4, 16) / 10;
    const y = randInt(3, 12) / 10;
    const z = randInt(5, 20) / 10;
    const total = Number((x + y + z).toFixed(2));
    const hAB = x / vUp + y / vFlat + z / vDown;
    const hBA = z / vUp + y / vFlat + x / vDown;
    const tAB = Number((hAB * 60).toFixed(1));
    const tBA = Number((hBA * 60).toFixed(1));
    if (Math.abs(tAB / 60 - hAB) > 1e-9 || Math.abs(tBA / 60 - hBA) > 1e-9) continue;
    if (total < 2 || total > 8) continue;
    return { total, vUp, vFlat, vDown, tAB, tBA, x, y, z };
  }
  return bookProblem();
}

export default function ThreeSegmentRoadSimulator() {
  return (
    <ThreeVarWordProblemBase
      title="上坡 · 平路 · 下坡：三段路程"
      subtitle="全程方程 + 去程时间 + 回程时间（坡向对调）"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          甲地到乙地全程 <b>{p.total}</b> km，由上坡、平路、下坡组成。上坡 <b>{p.vUp}</b> km/h，平路{' '}
          <b>{p.vFlat}</b> km/h，下坡 <b>{p.vDown}</b> km/h。甲→乙需 <b>{p.tAB}</b> min，乙→甲需{' '}
          <b>{p.tBA}</b> min。从甲到乙时，上坡、平路、下坡的路程各是多少？
        </Typography>
      )}
      renderSolution={(p, s) => {
        const hAB = p.tAB / 60;
        const hBA = p.tBA / 60;
        return (
          <ThreeVarSolution
            legendX="上坡路程（km）"
            legendY="平路路程（km）"
            legendZ="下坡路程（km）"
            setText={
              <>
                设甲→乙时上坡、平路、下坡路程分别为 <MathText text={texX()} />、
                <MathText text={texY()} />、<MathText text={texZ()} /> km。回程时原上坡变为下坡、原下坡变为上坡。
              </>
            }
            eq1={`x + y + z = ${p.total}`}
            eq2={`\\dfrac{x}{${p.vUp}} + \\dfrac{y}{${p.vFlat}} + \\dfrac{z}{${p.vDown}} = \\dfrac{${p.tAB}}{60}`}
            eq3={`\\dfrac{z}{${p.vUp}} + \\dfrac{y}{${p.vFlat}} + \\dfrac{x}{${p.vDown}} = \\dfrac{${p.tBA}}{60}`}
            solveText={
              <>
                时间先化成小时。可先 ②−③ 消去平路项，再与 ① 联立。全程{' '}
                <MathText text={texEq(`${hAB}\\ \\mathrm{h}`)} /> /{' '}
                <MathText text={texEq(`${hBA}\\ \\mathrm{h}`)} />。
              </>
            }
            x={s.x}
            y={s.y}
            z={s.z}
            answer={
              <>
                上坡 <AnimatedNumber value={s.x} decimals={1} /> km，平路{' '}
                <AnimatedNumber value={s.y} decimals={1} /> km，下坡{' '}
                <AnimatedNumber value={s.z} decimals={1} /> km。
              </>
            }
            check={
              <MathText
                text={`验算：${texEq(`${s.x}+${s.y}+${s.z}=${p.total}`)}；去程 ${texEq(
                  `${s.x}/${p.vUp}+${s.y}/${p.vFlat}+${s.z}/${p.vDown}=${hAB}`,
                )}；回程 ${texEq(
                  `${s.z}/${p.vUp}+${s.y}/${p.vFlat}+${s.x}/${p.vDown}=${hBA}`,
                )} ✓`}
              />
            }
          />
        );
      }}
    />
  );
}

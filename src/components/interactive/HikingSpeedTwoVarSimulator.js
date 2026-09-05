import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：8h、10h，共 98 km，第一天少 2 km → v1=6，v2=5。 */
function bookProblem() {
  return { t1: 8, t2: 10, total: 98, less: 2, x: 6, y: 5 };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const t1 = randInt(5, 9);
    const t2 = randInt(t1 + 1, 12);
    const x = randInt(4, 9);
    const y = randInt(3, 8);
    const d1 = t1 * x;
    const d2 = t2 * y;
    if (d2 <= d1) continue;
    return {
      t1,
      t2,
      total: d1 + d2,
      less: d2 - d1,
      x,
      y,
    };
  }
  return bookProblem();
}

export default function HikingSpeedTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="两天徒步：求平均速度"
      subtitle="路程 = 速度 × 时间；用「总路程」和「相差」列方程组"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          户外俱乐部两天徒步时间分别为 <b>{p.t1}</b> h 和 <b>{p.t2}</b> h，共走了 <b>{p.total}</b> km，且第一天比第二天少走{' '}
          <b>{p.less}</b> km。两天徒步的平均速度各是多少？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <TwoVarSolution
          legendX="第一天平均速度（km/h）"
          legendY="第二天平均速度（km/h）"
          setText={
            <>
              设第一天速度 <MathText text={texX()} /> km/h，第二天速度 <MathText text={texY()} /> km/h。
            </>
          }
          eq1={`${p.t1}x + ${p.t2}y = ${p.total}`}
          eq2={`${p.t2}y - ${p.t1}x = ${p.less}`}
          solveText={
            <>
              也可先设两天路程为 <MathText text={texEq('d_1,d_2')} />：
              <MathText text={texEq(`d_1+d_2=${p.total}`)} />，
              <MathText text={texEq(`d_2-d_1=${p.less}`)} />，解出路程再除以时间得速度。
            </>
          }
          x={s.x}
          y={s.y}
          answer={
            <>
              第一天 <AnimatedNumber value={s.x} /> km/h，第二天 <AnimatedNumber value={s.y} /> km/h。
            </>
          }
          check={
            <MathText
              text={`验算：路程 ${texEq(
                `${p.t1}\\times ${s.x}+${p.t2}\\times ${s.y}=${p.total}`,
              )}；差 ${texEq(`${p.t2}\\times ${s.y}-${p.t1}\\times ${s.x}=${p.less}`)} ✓`}
            />
          }
        />
      )}
    />
  );
}

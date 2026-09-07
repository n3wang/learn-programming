import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texX, texY } from '@site/src/components/interactive/shell/texMath';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { quota: 12, use1: 14, fee1: 37.6, use2: 17, fee2: 47.2, x: 2.6, y: 3.2 };
}

function generate() {
  for (let i = 0; i < 40; i += 1) {
    const quota = pickOne([10, 12, 15]);
    const x = pickOne([2, 2.4, 2.6, 3]);
    const y = pickOne([3.2, 3.6, 4, 4.5]);
    if (y <= x) continue;
    const extra1 = randInt(1, 4);
    const extra2 = extra1 + randInt(2, 5);
    const use1 = quota + extra1;
    const use2 = quota + extra2;
    const fee1 = Number((quota * x + extra1 * y).toFixed(1));
    const fee2 = Number((quota * x + extra2 * y).toFixed(1));
    return { quota, use1, fee1, use2, fee2, x, y };
  }
  return bookProblem();
}

export default function TierWaterUnitPriceSimulator() {
  return (
    <TwoVarWordProblemBase
      title="综合运用 7：阶梯水价"
      subtitle="不超过定额按一级，超出部分按二级"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          每户每月用水不超过 <b>{p.quota}</b> m³ 时按一级单价收费，超出部分按二级单价收费。
          一家用水 <b>{p.use1}</b> m³，缴费 <b>{p.fee1}</b> 元；另一家用水 <b>{p.use2}</b> m³，缴费{' '}
          <b>{p.fee2}</b> 元。一级、二级单价各是多少？
        </Typography>
      )}
      renderSolution={(p) => {
        const e1 = p.use1 - p.quota;
        const e2 = p.use2 - p.quota;
        return (
          <TwoVarSolution
            legendX="一级单价（元/m³）"
            legendY="二级单价（元/m³）"
            setText={
              <>
                设一级单价 <MathText text={texX()} /> 元/m³，二级单价 <MathText text={texY()} /> 元/m³。
                两家都超过定额，定额内都是 {p.quota} m³，超出分别是 {e1} m³ 和 {e2} m³。
              </>
            }
            eq1={`${p.quota}x + ${e1}y = ${p.fee1}`}
            eq2={`${p.quota}x + ${e2}y = ${p.fee2}`}
            solveText={
              <>
                两式相减，消去定额内的部分，先求出二级单价，再代回求一级单价。
              </>
            }
            x={p.x}
            y={p.y}
            answer={
              <>
                一级单价 {p.x} 元/m³，二级单价 {p.y} 元/m³。
              </>
            }
            check={
              <>
                {p.quota} × {p.x} + {e1} × {p.y} = {p.fee1} 元；{p.quota} × {p.x} + {e2} × {p.y} = {p.fee2} 元。
              </>
            }
          />
        );
      }}
    />
  );
}

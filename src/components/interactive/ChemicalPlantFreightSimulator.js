import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 长青化工厂：A→厂（铁+公）、厂→B（铁+公）。
 * 书题：原料 1000 元/t，成品 8000 元/t；公路 1.5、铁路 1.2；
 * 公路运费共 15000，铁路 97200；路程 10+120、20+110 → x=400，y=300，超出 1887800。
 */
function bookProblem() {
  return {
    rawPrice: 1000,
    goodsPrice: 8000,
    roadRate: 1.5,
    railRate: 1.2,
    roadA: 10,
    railA: 120,
    roadB: 20,
    railB: 110,
    roadCost: 15000,
    railCost: 97200,
    x: 400,
    y: 300,
  };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const x = randInt(2, 8) * 50;
    const y = randInt(2, 8) * 50;
    const roadA = randInt(1, 3) * 5;
    const roadB = randInt(2, 5) * 5;
    const railA = randInt(8, 15) * 10;
    const railB = randInt(8, 15) * 10;
    const roadRate = 1.5;
    const railRate = 1.2;
    const roadCost = roadRate * (roadA * x + roadB * y);
    const railCost = railRate * (railA * x + railB * y);
    if (!Number.isInteger(roadCost) || !Number.isInteger(railCost)) continue;
    const rawPrice = pickPrice();
    const goodsPrice = rawPrice * randInt(5, 10);
    return {
      rawPrice,
      goodsPrice,
      roadRate,
      railRate,
      roadA,
      railA,
      roadB,
      railB,
      roadCost,
      railCost,
      x,
      y,
    };
  }
  return bookProblem();
}

function pickPrice() {
  return randInt(8, 15) * 100;
}

export default function ChemicalPlantFreightSimulator() {
  return (
    <TwoVarWordProblemBase
      title="化工厂：公路与铁路运费"
      subtitle="原料吨数 x、成品吨数 y —— 两类运费各列一个方程"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          长青化工厂与 A、B 两地有公路和铁路相连。从 A 地购进原料每吨 <b>{p.rawPrice}</b> 元运回工厂，
          生产成每吨售价 <b>{p.goodsPrice}</b> 元的产品运往 B 地。公路运费{' '}
          <b>{p.roadRate}</b> 元/(t·km)，铁路运费 <b>{p.railRate}</b> 元/(t·km)。
          <br />
          A→厂：公路 <b>{p.roadA}</b> km、铁路 <b>{p.railA}</b> km；厂→B：公路 <b>{p.roadB}</b> km、铁路{' '}
          <b>{p.railB}</b> km。两趟运输中公路运费共 <b>{p.roadCost.toLocaleString('zh-CN')}</b> 元，铁路运费共{' '}
          <b>{p.railCost.toLocaleString('zh-CN')}</b> 元。
          <br />
          这批产品的销售收入比原料费与运费的和超出多少元？
        </Typography>
      )}
      renderSolution={(p, s) => {
        const sales = p.goodsPrice * s.y;
        const raw = p.rawPrice * s.x;
        const freight = p.roadCost + p.railCost;
        const excess = sales - (raw + freight);
        const roadRHS = p.roadCost / p.roadRate;
        const railRHS = p.railCost / p.railRate;
        return (
          <TwoVarSolution
            legendX="原料质量（t）"
            legendY="成品质量（t）"
            setText={
              <>
                设购进原料 <MathText text={texX()} /> t，运出成品 <MathText text={texY()} /> t。
              </>
            }
            eq1={`${p.roadRate}(${p.roadA}x + ${p.roadB}y) = ${p.roadCost}`}
            eq2={`${p.railRate}(${p.railA}x + ${p.railB}y) = ${p.railCost}`}
            solveText={
              <>
                先化简（两边同除运价）：公路{' '}
                <MathText text={texEq(`${p.roadA}x + ${p.roadB}y = ${roadRHS}`)} />
                ，铁路 <MathText text={texEq(`${p.railA}x + ${p.railB}y = ${railRHS}`)} />
                。解出 x、y 后：
                <br />
                超出额 = 销售收入 −（原料费 + 公路运费 + 铁路运费）。
              </>
            }
            x={s.x}
            y={s.y}
            answer={
              <>
                销售收入 <AnimatedNumber value={sales} /> 元，成本合计{' '}
                <AnimatedNumber value={raw + freight} /> 元，超出{' '}
                <AnimatedNumber value={excess} /> 元。
              </>
            }
            check={
              <MathText
                text={`验算：公路 ${texEq(
                  `${p.roadRate}\\times(${p.roadA}\\times ${s.x}+${p.roadB}\\times ${s.y})=${p.roadCost}`,
                )}；铁路 ${texEq(
                  `${p.railRate}\\times(${p.railA}\\times ${s.x}+${p.railB}\\times ${s.y})=${p.railCost}`,
                )} ✓`}
              />
            }
          />
        );
      }}
    />
  );
}

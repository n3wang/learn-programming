import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 两天销量成比例时，收入也应成同一比例；否则账目有误。
 * 书题：39 刷 + 21 膏 = 396；52 刷 + 28 膏 = 518（应为 528）→ 有误。
 */
function bookProblem() {
  return {
    b1: 39,
    p1: 21,
    r1: 396,
    b2: 52,
    p2: 28,
    r2: 518,
    // sentinel: no unique price solution; x/y unused for display
    x: 0,
    y: 0,
    consistent: false,
    expectedR2: 528,
  };
}

function generate() {
  const priceB = randInt(3, 9);
  const priceP = randInt(8, 16);
  const b1 = randInt(3, 8) * 5 + 4; // avoid too round
  const p1 = randInt(2, 6) * 5 + 1;
  const kNum = randInt(2, 5);
  const kDen = randInt(2, 4);
  if (kNum === kDen) return generate();
  const b2 = (b1 * kNum) / kDen;
  const p2 = (p1 * kNum) / kDen;
  if (!Number.isInteger(b2) || !Number.isInteger(p2)) {
    // force integer by scaling base
    const b1s = b1 * kDen;
    const p1s = p1 * kDen;
    const b2s = b1 * kNum;
    const p2s = p1 * kNum;
    const r1 = priceB * b1s + priceP * p1s;
    const expectedR2 = priceB * b2s + priceP * p2s;
    const makeError = Math.random() < 0.55;
    const r2 = makeError ? expectedR2 - randInt(1, 3) * 5 : expectedR2;
    return {
      b1: b1s,
      p1: p1s,
      r1,
      b2: b2s,
      p2: p2s,
      r2,
      x: priceB,
      y: priceP,
      consistent: !makeError,
      expectedR2,
    };
  }
  const r1 = priceB * b1 + priceP * p1;
  const expectedR2 = priceB * b2 + priceP * p2;
  const makeError = Math.random() < 0.55;
  const r2 = makeError ? expectedR2 - randInt(1, 4) * 5 : expectedR2;
  return {
    b1,
    p1,
    r1,
    b2,
    p2,
    r2,
    x: priceB,
    y: priceP,
    consistent: !makeError,
    expectedR2,
  };
}

export default function ToothbrushRecordCheckSimulator() {
  return (
    <TwoVarWordProblemBase
      title="牙刷牙膏账目：是否有误？"
      subtitle="先看两天销量是否成比例；再判断收入是否应按同一比例放大"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          某天卖出牙刷 <b>{p.b1}</b> 支、牙膏 <b>{p.p1}</b> 盒，收入 <b>{p.r1}</b> 元；另一天以同样价格卖出牙刷{' '}
          <b>{p.b2}</b> 支、牙膏 <b>{p.p2}</b> 盒，收入 <b>{p.r2}</b> 元。这个记录是否有误？如果有误，请说明理由。
        </Typography>
      )}
      renderSolution={(p) => {
        const ratioOk =
          p.b1 * p.p2 === p.b2 * p.p1 || (p.b2 / p.b1 === p.p2 / p.p1 && Number.isFinite(p.b2 / p.b1));
        const scale = p.b2 / p.b1;
        return (
          <TwoVarSolution
            legendX="牙刷单价（元）"
            legendY="牙膏单价（元）"
            setText={
              <>
                设牙刷单价 <MathText text={texX()} /> 元，牙膏单价 <MathText text={texY()} /> 元。
              </>
            }
            eq1={`${p.b1}x + ${p.p1}y = ${p.r1}`}
            eq2={`${p.b2}x + ${p.p2}y = ${p.r2}`}
            solveText={
              <>
                观察系数：牙刷 <MathText text={texEq(`${p.b1}:${p.b2}`)} />，牙膏{' '}
                <MathText text={texEq(`${p.p1}:${p.p2}`)} />
                {ratioOk ? (
                  <>
                    ，两天销量成比例（约 {scale.toFixed(3)} 倍）。若价格不变，收入也应是同一倍数，即第二天收入应为{' '}
                    <MathText text={texEq(`${p.r1}\\times\\dfrac{${p.b2}}{${p.b1}}=${p.expectedR2}`)} />。
                  </>
                ) : (
                  <>；两天销量不成简单比例，需直接解方程组或用消元判断是否矛盾。</>
                )}
              </>
            }
            x={p.consistent ? p.x : '\\text{无解}'}
            y={p.consistent ? p.y : '\\text{无解}'}
            answer={
              p.consistent ? (
                <>记录无误：存在单价解，且第二天收入与销量比例一致。</>
              ) : (
                <>
                  记录有误：按销量比例，第二天收入应为 <b>{p.expectedR2}</b> 元，但账上是{' '}
                  <b>{p.r2}</b> 元（差 {Math.abs(p.expectedR2 - p.r2)} 元）。方程组无解（两式矛盾）。
                </>
              )
            }
            check={
              <MathText
                text={
                  p.consistent
                    ? `验算：${texEq(`${p.b1}\\times ${p.x}+${p.p1}\\times ${p.y}=${p.r1}`)}；${texEq(
                        `${p.b2}\\times ${p.x}+${p.p2}\\times ${p.y}=${p.r2}`,
                      )} ✓`
                    : `矛盾：${texEq(`${p.b2}/${p.b1}=${p.p2}/${p.p1}`)} 但 ${texEq(
                        `${p.r2}\\neq ${p.expectedR2}`,
                      )}`
                }
              />
            }
          />
        );
      }}
    />
  );
}

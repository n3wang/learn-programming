import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 长方形场地：3 列 × 2 行草坪，2 条竖向通道 + 1 条横向通道，宽度均为 w。
 * 一块草坪两边比 m:n。书题：18×13，8:9 → w=1。
 * 设草坪沿长边为 mx、沿宽边为 nx，通道宽为 y（此处 y 即 w）。
 */
function bookProblem() {
  return {
    length: 18,
    width: 13,
    cols: 3,
    rows: 2,
    ratioM: 8,
    ratioN: 9,
    x: '\\dfrac{2}{3}',
    xNum: 2 / 3,
    y: 1,
  };
}

function generate() {
  for (let i = 0; i < 60; i++) {
    const cols = 3;
    const rows = 2;
    const ratioM = randInt(4, 9);
    const ratioN = randInt(ratioM + 1, 12);
    const y = randInt(1, 3);
    const uNum = randInt(1, 4);
    const uDen = randInt(1, 3);
    const u = uNum / uDen;
    const length = cols * ratioM * u + (cols - 1) * y;
    const width = rows * ratioN * u + (rows - 1) * y;
    if (length <= y * 2 || width <= y) continue;
    if (!Number.isInteger(length * 2) || !Number.isInteger(width * 2)) continue;
    return {
      length,
      width,
      cols,
      rows,
      ratioM,
      ratioN,
      x: uDen === 1 ? uNum : `\\dfrac{${uNum}}{${uDen}}`,
      xNum: u,
      y,
    };
  }
  return bookProblem();
}

export default function LawnPathWidthSimulator() {
  return (
    <TwoVarWordProblemBase
      title="草坪与等宽通道"
      subtitle="3×2 块相同草坪 + 等宽通道 → 用边长比列方程组求通道宽"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          学校在一块长 <b>{p.length}</b> m、宽 <b>{p.width}</b> m 的长方形场地上，分别设计与短边、长边平行的横向和纵向通道，其余部分铺草皮。通道宽度相等，共{' '}
          <b>{p.cols * p.rows}</b> 块形状、大小相同的草坪。其中一块草坪的两边之比为{' '}
          <b>
            {p.ratioM}:{p.ratioN}
          </b>
          （沿长边方向 : 沿宽边方向）。通道的宽是多少？
        </Typography>
      )}
      renderSolution={(p, s) => {
        const unit = p.xNum ?? (typeof s.x === 'number' ? s.x : 2 / 3);
        const lawnL = p.ratioM * unit;
        const lawnW = p.ratioN * unit;
        return (
          <TwoVarSolution
            legendX="比例单位（m）"
            legendY="通道宽（m）"
            setText={
              <>
                设比例单位为 <MathText text={texX()} /> m，则一块草坪沿长边为{' '}
                <MathText text={texEq(`${p.ratioM}x`)} /> m、沿宽边为{' '}
                <MathText text={texEq(`${p.ratioN}x`)} /> m；设通道宽为 <MathText text={texY()} /> m。
                （布局：{p.cols} 列 × {p.rows} 行草坪，竖向通道 {p.cols - 1} 条、横向通道 {p.rows - 1}{' '}
                条。）
              </>
            }
            eq1={`${p.cols}\\cdot ${p.ratioM}x + ${p.cols - 1}y = ${p.length}`}
            eq2={`${p.rows}\\cdot ${p.ratioN}x + ${p.rows - 1}y = ${p.width}`}
            solveText={
              <>
                化简为 <MathText text={texEq(`${p.cols * p.ratioM}x + ${p.cols - 1}y = ${p.length}`)} />{' '}
                与 <MathText text={texEq(`${p.rows * p.ratioN}x + ${p.rows - 1}y = ${p.width}`)} />
                ，用加减消元法求出通道宽 <MathText text={texY()} />。
              </>
            }
            x={s.x}
            y={s.y}
            answer={
              <>
                通道宽 <AnimatedNumber value={s.y} decimals={Number.isInteger(s.y) ? 0 : 2} /> m
                （草坪约 {Number(lawnL.toFixed(2))} m × {Number(lawnW.toFixed(2))} m）。
              </>
            }
            check={
              <MathText
                text={`验算：长 ${texEq(
                  `${p.cols}\\times ${Number(lawnL.toFixed(4))}+${p.cols - 1}\\times ${s.y}=${p.length}`,
                )}；宽 ${texEq(
                  `${p.rows}\\times ${Number(lawnW.toFixed(4))}+${p.rows - 1}\\times ${s.y}=${p.width}`,
                )} ✓`}
              />
            }
          />
        );
      }}
    />
  );
}

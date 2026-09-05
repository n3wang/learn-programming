import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import ThreeVarWordProblemBase from '@site/src/components/interactive/shell/ThreeVarWordProblemBase';
import ThreeVarSolution from '@site/src/components/interactive/shell/ThreeVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY, texZ } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：z=ax+by+c；三点 (1,2,8),(2,1,5),(-1,-1,4) → a=-1,b=2,c=5。变量用 x,y,z 存 a,b,c。 */
function bookProblem() {
  return {
    pts: [
      { u: 1, v: 2, w: 8 },
      { u: 2, v: 1, w: 5 },
      { u: -1, v: -1, w: 4 },
    ],
    x: -1,
    y: 2,
    z: 5,
  };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const a = randInt(-3, 3) || -1;
    const b = randInt(-3, 4) || 2;
    const c = randInt(-4, 8);
    const pts = [
      { u: 1, v: randInt(1, 3), w: 0 },
      { u: randInt(2, 3), v: 1, w: 0 },
      { u: -1, v: -1, w: 0 },
    ];
    pts.forEach((p) => {
      p.w = a * p.u + b * p.v + c;
    });
    return { pts, x: a, y: b, z: c };
  }
  return bookProblem();
}

function fmtPlaneEq(u, v, w) {
  const ax = u === 1 ? 'x' : u === -1 ? '-x' : `${u}x`;
  const by =
    v === 0
      ? ''
      : v === 1
        ? ' + y'
        : v === -1
          ? ' - y'
          : v > 0
            ? ` + ${v}y`
            : ` - ${-v}y`;
  return `${ax}${by} + z = ${w}`;
}

export default function LinearPlaneFitSimulator() {
  return (
    <ThreeVarWordProblemBase
      title="求平面式 z = ax + by + c"
      subtitle="三个点代入 → 关于 a、b、c 的三元一次方程组"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          在等式 <MathText text={'$z = ax + by + c$'} /> 中，当{' '}
          <MathText text={`$x=${p.pts[0].u},\\ y=${p.pts[0].v}$`} /> 时，
          <MathText text={`$z=${p.pts[0].w}$`} />；当{' '}
          <MathText text={`$x=${p.pts[1].u},\\ y=${p.pts[1].v}$`} /> 时，
          <MathText text={`$z=${p.pts[1].w}$`} />；当{' '}
          <MathText text={`$x=${p.pts[2].u},\\ y=${p.pts[2].v}$`} /> 时，
          <MathText text={`$z=${p.pts[2].w}$`} />。求 <MathText text={'$a,b,c$'} /> 的值。
        </Typography>
      )}
      renderSolution={(p, s) => (
        <ThreeVarSolution
          legendX="系数 a"
          legendY="系数 b"
          legendZ="系数 c"
          setText={
            <>
              设未知数为 <MathText text={texX()} />、<MathText text={texY()} />、
              <MathText text={texZ()} />（分别表示 a、b、c）。把三组{' '}
              <MathText text={'$x,y,z$'} /> 代入原式。
            </>
          }
          eq1={fmtPlaneEq(p.pts[0].u, p.pts[0].v, p.pts[0].w)}
          eq2={fmtPlaneEq(p.pts[1].u, p.pts[1].v, p.pts[1].w)}
          eq3={fmtPlaneEq(p.pts[2].u, p.pts[2].v, p.pts[2].w)}
          solveText={<>用加减消元法（可先两式相减消去 c）求出 a、b，再求 c。</>}
          x={s.x}
          y={s.y}
          z={s.z}
          answer={
            <>
              <MathText text={'$a=$'} />
              <AnimatedNumber value={s.x} />，<MathText text={'$b=$'} />
              <AnimatedNumber value={s.y} />，<MathText text={'$c=$'} />
              <AnimatedNumber value={s.z} />。
            </>
          }
          check={
            <MathText
              text={`验算三点：${p.pts
                .map(
                  (pt) =>
                    texEq(
                      `${s.x}\\times(${pt.u})+${s.y}\\times(${pt.v})+${s.z}=${pt.w}`,
                    ),
                )
                .join('；')} ✓`}
            />
          }
        />
      )}
    />
  );
}

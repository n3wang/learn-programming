import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function frac(n, d) {
  const g = (a, b) => (b ? g(b, a % b) : a);
  const s = n < 0 ? -1 : 1;
  const a = Math.abs(n);
  const k = g(a, d);
  const num = (s * a) / k;
  const den = d / k;
  if (den === 1) return `${num}`;
  return `${num < 0 ? '-' : ''}\\dfrac{${Math.abs(num)}}{${den}}`;
}

function bookProblem() {
  return { bigN: 5, smallN: 1, total1: 3, bigM: 1, smallM: 5, total2: 2, x: '13/24', y: '7/24' };
}

function generate() {
  const bigN = randInt(3, 6);
  const smallM = randInt(3, 6);
  const xNum = randInt(1, 5);
  const yNum = randInt(1, 5);
  const den = bigN * smallM - 1;
  const total1Num = bigN * xNum + yNum;
  const total2Num = xNum + smallM * yNum;
  return {
    bigN,
    smallN: 1,
    total1: `${total1Num}/${den}`,
    bigM: 1,
    smallM,
    total2: `${total2Num}/${den}`,
    x: frac(xNum, den),
    y: frac(yNum, den),
  };
}

function texFrac(text) {
  if (typeof text === 'number') return `${text}`;
  const [n, d] = String(text).split('/');
  if (!d) return text;
  return `\\dfrac{${n}}{${d}}`;
}

export default function AncientVesselSimulator() {
  return (
    <TwoVarWordProblemBase
      title="综合运用 10：大小容器"
      subtitle="两组「若干大 + 若干小 = 总容量」"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          {p.bigN} 个大容器和 {p.smallN} 个小容器的总容量是 <MathText text={`$${texFrac(p.total1)}$`} /> 斛，
          {p.bigM} 个大容器和 {p.smallM} 个小容器的总容量是 <MathText text={`$${texFrac(p.total2)}$`} /> 斛。
          大、小容器的容量各是多少斛？
        </Typography>
      )}
      renderSolution={(p) => (
        <TwoVarSolution
          legendX="大容器容量（斛）"
          legendY="小容器容量（斛）"
          setText={
            <>
              设大容器容量 <MathText text={texX()} /> 斛，小容器容量 <MathText text={texY()} /> 斛。
            </>
          }
          eq1={`${p.bigN}x + ${p.smallN}y = ${texFrac(p.total1)}`}
          eq2={`${p.bigM}x + ${p.smallM}y = ${texFrac(p.total2)}`}
          solveText="用加减消元法消去一个未知数。书题可把第二式乘 5 再减去第一式。"
          x={texFrac(p.x)}
          y={texFrac(p.y)}
          answer={
            <>
              大容器 <MathText text={`$${texFrac(p.x)}$`} /> 斛，小容器 <MathText text={`$${texFrac(p.y)}$`} /> 斛。
            </>
          }
        />
      )}
    />
  );
}

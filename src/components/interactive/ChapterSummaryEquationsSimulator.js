import React, { useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

function signed(n) {
  return n < 0 ? `${n}` : `+${n}`;
}

function formatDecimalPrompt(leftD, constL, constR, rightD) {
  const fmt = (n) => {
    const v = n / 10;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  };
  const left = `${fmt(leftD)}x${signed(-constL)}`;
  const right = `${fmt(constR)}${signed(-rightD)}x`;
  return `${left}=${right}`;
}

function bookSet() {
  return {
    solve: [
      {
        prompt: '\\dfrac{4}{3}-8x=3-\\dfrac{11}{2}x',
        steps: ['两边同乘 6：\\; 8-48x=18-33x', '移项合并：\\; -15x=10', 'x=-\\dfrac{2}{3}'],
        answer: 'x=-\\dfrac{2}{3}',
      },
      {
        prompt: '0.5x-0.7=6.5-1.3x',
        steps: ['两边同乘 10：\\; 5x-7=65-13x', '18x=72', 'x=4'],
        answer: 'x=4',
      },
      {
        prompt: '\\dfrac{1}{6}(3x-6)=\\dfrac{2}{5}x-3',
        steps: ['去括号：\\; \\dfrac{1}{2}x-1=\\dfrac{2}{5}x-3', '两边同乘 10：\\; 5x-10=4x-30', 'x=-20'],
        answer: 'x=-20',
      },
      {
        prompt: '\\dfrac{1-2x}{3}=\\dfrac{3x+1}{7}-3',
        steps: ['两边同乘 21：\\; 7(1-2x)=3(3x+1)-63', '7-14x=9x-60', 'x=\\dfrac{67}{23}'],
        answer: 'x=\\dfrac{67}{23}',
      },
    ],
    match: [
      {
        prompt: 'x-\\dfrac{x-1}{3}\\;\\text{与}\\;7-\\dfrac{x+3}{5}',
        steps: ['列方程：\\; x-\\dfrac{x-1}{3}=7-\\dfrac{x+3}{5}', '两边同乘 15：\\; 10x+5=96-3x', 'x=7'],
        answer: 'x=7',
      },
      {
        prompt: '\\dfrac{2}{5}x+\\dfrac{x-1}{2}\\;\\text{与}\\;\\dfrac{3(x-1)}{2}-\\dfrac{8}{5}x',
        steps: [
          '列方程：\\; \\dfrac{2}{5}x+\\dfrac{x-1}{2}=\\dfrac{3(x-1)}{2}-\\dfrac{8}{5}x',
          '两边同乘 10：\\; 9x-5=-x-15',
          'x=-1',
        ],
        answer: 'x=-1',
      },
    ],
  };
}

function genSet() {
  const x = pickOne([-5, -3, -2, 2, 3, 4, 6]);
  const a = randInt(2, 7);
  const b = a + pickOne([1, 2, 3]);
  const leftC = randInt(3, 12);
  const rightC = leftC - (a - b) * x;
  const tenth = pickOne([2, 5]);
  const leftD = tenth * randInt(1, 3);
  const rightD = leftD + tenth;
  const constL = tenth * randInt(1, 4);
  const constR = (leftD + rightD) * x - constL;
  const p = pickOne([2, 3, 6]);
  const shift = pickOne([1, 2, 3]);
  const q = pickOne([2, 5]);
  // x - shift = (2/q)x - rightConst  ⇒  rightConst = (2x - qx)/q + shift
  const rightNum = 2 * x - q * x + shift * q;
  if (rightNum % q !== 0) return bookSet();
  const rightConst = rightNum / q;
  const den = pickOne([3, 4, 5]);
  const add = pickOne([1, 2, 3]);
  const other = x - (x - 1) / den + (x + add) / den;
  if (!Number.isInteger(other)) return bookSet();
  const c1 = pickOne([2, 3, 4]);
  const c2 = c1 + 1;
  const matchConst = ((c2 - c1) * x) / 2;
  if (!Number.isInteger(matchConst)) return bookSet();

  return {
    solve: [
      {
        prompt: `${leftC}-${a}x=${rightC}${signed(-b)}x`,
        steps: [`${b - a}x=${rightC - leftC}`, `x=${x}`],
        answer: `x=${x}`,
      },
      {
        prompt: formatDecimalPrompt(leftD, constL, constR, rightD),
        steps: ['两边同乘 10 去小数后移项', `x=${x}`],
        answer: `x=${x}`,
      },
      {
        prompt: `\\dfrac{1}{${p}}(${p}x-${p * shift})=\\dfrac{2}{${q}}x${signed(-rightConst)}`,
        steps: [`去括号：\\; x-${shift}=\\dfrac{2}{${q}}x${signed(-rightConst)}`, `x=${x}`],
        answer: `x=${x}`,
      },
      {
        prompt: `\\dfrac{x${x - 2 >= 0 ? '+' : ''}${x - 2}}{2}=x-1`,
        steps: [`\\dfrac{x${x - 2 >= 0 ? '+' : ''}${x - 2}}{2}=x-1`, `x${x - 2 >= 0 ? '+' : ''}${x - 2}=2x-2`, `x=${x}`],
        answer: `x=${x}`,
      },
    ],
    match: [
      {
        prompt: `x-\\dfrac{x-1}{${den}}\\;\\text{与}\\;${other}-\\dfrac{x+${add}}{${den}}`,
        steps: ['令两式相等，去分母后解得', `x=${x}`],
        answer: `x=${x}`,
      },
      {
        prompt: `\\dfrac{${c1}}{2}x\\;\\text{与}\\;\\dfrac{${c2}}{2}x${signed(-matchConst)}`,
        steps: [`\\dfrac{${c1}}{2}x=\\dfrac{${c2}}{2}x${signed(-matchConst)}`, `x=${x}`],
        answer: `x=${x}`,
      },
    ],
  };
}

export default function ChapterSummaryEquationsSimulator() {
  const [key, setKey] = useState(0);
  const [set, setP] = useState(bookSet);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="3" badgeClass={stepStyles.badgeSolve}>
        {set.solve.map((item, i) => (
          <div key={item.prompt} style={{ marginBottom: 10 }}>
            <MathText text={tex(`(${i + 1})\\;${item.prompt}`)} />
            <div className={stepStyles.eqBox}>
              {item.steps.map((step) => (
                <div key={step}>
                  <MathText text={tex(step)} />
                </div>
              ))}
            </div>
            <MathText text={tex(item.answer)} />
          </div>
        ))}
      </SolutionStep>
      <SolutionStep badge="4" badgeClass={stepStyles.badgeList}>
        {set.match.map((item, i) => (
          <div key={item.prompt} style={{ marginBottom: 10 }}>
            <MathText text={tex(`(${i + 1})\\;${item.prompt}`)} />
            <div className={stepStyles.eqBox}>
              {item.steps.map((step) => (
                <div key={step}>
                  <MathText text={tex(step)} />
                </div>
              ))}
            </div>
            <MathText text={tex(item.answer)} />
          </div>
        ))}
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="3–4 解方程；两式何时相等"
      subtitle="先去分母、去括号，再移项合并。令两式相等，就是列方程"
      problemKey={key}
      onRandomize={() => {
        setP(genSet());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookSet());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <Typography sx={{ mb: 1 }}>
        <b>3.</b> 解下列方程：
      </Typography>
      {set.solve.map((item, i) => (
        <Typography key={item.prompt} sx={{ mb: 0.5 }}>
          （{i + 1}）<MathText text={tex(item.prompt)} />
        </Typography>
      ))}
      <Typography sx={{ mt: 1.5, mb: 1 }}>
        <b>4.</b> 当 <MathText text={tex('x')} /> 为何值时，下列各组中两个式子的值相等？
      </Typography>
      {set.match.map((item, i) => (
        <Typography key={item.prompt} sx={{ mb: 0.5 }}>
          （{i + 1}）<MathText text={tex(item.prompt)} />
        </Typography>
      ))}
    </ProblemShell>
  );
}

import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 6：5 台 A → 8 箱余 4；7 台 B → 11 箱余 1；A 比 B 每天多 1；箱装 12。 */
function bookProblem() {
  return { nA: 5, nB: 7, boxesA: 8, remA: 4, boxesB: 11, remB: 1, extra: 1 };
}

function generate() {
  for (let i = 0; i < 60; i++) {
    const extra = pickOne([1, 2]);
    const b = randInt(10, 30);
    const a = b + extra;
    const c = randInt(8, 20);
    const nA = pickOne([4, 5, 6]);
    const nB = pickOne([5, 6, 7, 8]);
    const totalA = nA * a;
    const totalB = nB * b;
    const remA = totalA % c;
    const remB = totalB % c;
    if (remA === 0 || remB === 0) continue;
    const boxesA = Math.floor(totalA / c);
    const boxesB = Math.floor(totalB / c);
    if (boxesA < 2 || boxesB < 2) continue;
    const denom = nA * boxesB - nB * boxesA;
    if (denom === 0) continue;
    return { nA, nB, boxesA, remA, boxesB, remB, extra };
  }
  return bookProblem();
}

function derive(p) {
  // nA (b + extra) = boxesA * c + remA
  // nB * b = boxesB * c + remB
  // From ②: b = (boxesB*c + remB) / nB
  // Plug into ① to solve c — but we already have book numbers; solve via elimination.
  // nA * b + nA*extra = boxesA*c + remA
  // nA/nB * (boxesB*c + remB) + nA*extra = boxesA*c + remA
  // Multiply by nB:
  // nA (boxesB*c + remB) + nA*extra*nB = nB*boxesA*c + nB*remA
  // c * (nA*boxesB - nB*boxesA) = nB*remA - nA*remB - nA*extra*nB
  const denom = p.nA * p.boxesB - p.nB * p.boxesA;
  if (denom === 0) return { c: NaN, a: NaN, b: NaN };
  const c = (p.nB * p.remA - p.nA * p.remB - p.nA * p.extra * p.nB) / denom;
  const b = (p.boxesB * c + p.remB) / p.nB;
  const a = b + p.extra;
  const roundInt = (n) => (Math.abs(n - Math.round(n)) < 1e-6 ? Math.round(n) : n);
  return { c: roundInt(c), a: roundInt(a), b: roundInt(b) };
}

export default function MachineBoxRemainderSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设每箱装 <MathText text={tex('x')} /> 个产品，每台 B 型机器一天生产{' '}
        <MathText text={tex('y')} /> 个，则每台 A 型一天生产{' '}
        <MathText text={tex(`y+${p.extra}`)} /> 个。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${p.nA}(y+${p.extra}) = ${p.boxesA}x + ${p.remA}`)} />
          <br />
          <MathText text={tex(`${p.nB}y = ${p.boxesB}x + ${p.remB}`)} />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        由第二式得 <MathText text={tex(`y = \\dfrac{${p.boxesB}x + ${p.remB}}{${p.nB}}`)} />，代入第一式解得{' '}
        <MathText text={tex(`x = ${d.c}`)} />，进而{' '}
        <MathText text={tex(`y = ${d.b}`)} />（A 型每天 {d.a} 个）。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          每箱装 <AnimatedNumber value={d.c} /> 个产品。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="余数问题：A/B 型机器与装箱"
      subtitle="「装满若干箱还剩几个」翻译成一次式，再联立求解"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <Typography>
        用 A 型和 B 型机器生产同样的产品。已知 <b>{p.nA}</b> 台 A 型机器一天生产的产品装满{' '}
        <b>{p.boxesA}</b> 箱后还剩 <b>{p.remA}</b> 个，<b>{p.nB}</b> 台 B 型机器一天生产的产品装满{' '}
        <b>{p.boxesB}</b> 箱后还剩 <b>{p.remB}</b> 个，每台 A 型机器比 B 型机器一天多生产{' '}
        <b>{p.extra}</b> 个产品。求每箱装多少个产品。
      </Typography>
    </ProblemShell>
  );
}

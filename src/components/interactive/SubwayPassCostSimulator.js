import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

const P1 = '#1565c0';
const P2 = '#6a1b9a';

function tex(expr) {
  return `$${expr}$`;
}

/** 书练习 2：200/10 次 vs 300/20 次，超出 25 元/次。 */
function bookProblem() {
  return {
    price1: 200,
    incl1: 10,
    price2: 300,
    incl2: 20,
    extra: 25,
  };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const extra = pickOne([20, 25, 30]);
    const incl1 = pickOne([8, 10, 12]);
    const incl2 = incl1 + pickOne([8, 10, 12]);
    const price1 = randInt(15, 25) * 10;
    // For incl1 < n ≤ incl2: C1 = price1 + extra*(n-incl1), C2 = price2
    // Equal at n* = (price2 - price1)/extra + incl1 — keep integer
    const nMid = pickOne([incl1 + 2, incl1 + 3, incl1 + 4, incl1 + 5]);
    if (nMid > incl2) continue;
    const price2 = price1 + extra * (nMid - incl1);
    if (price2 <= price1) continue;
    return { price1, incl1, price2, incl2, extra };
  }
  return bookProblem();
}

function derive(p) {
  // Break-even in (incl1, incl2]: price1 + extra*(n-incl1) = price2
  const nStar = (p.price2 - p.price1) / p.extra + p.incl1;
  // For n > incl2: C1 - C2 = (price1 - extra*incl1) - (price2 - extra*incl2) = constant
  const c1High = (n) => p.price1 + p.extra * (n - p.incl1);
  const c2High = (n) => p.price2 + p.extra * (n - p.incl2);
  const gapHigh = c1High(p.incl2 + 1) - c2High(p.incl2 + 1);
  return { nStar, gapHigh };
}

export default function SubwayPassCostSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <div className={stepStyles.legend}>
        <span>
          <span className={stepStyles.swatch} style={{ background: P1 }} />
          第一种月票
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: P2 }} />
          第二种月票
        </span>
      </div>

      <SolutionStep badge="列" badgeClass={stepStyles.badgeSet}>
        设每月乘坐 <MathText text={tex('n')} /> 次，且 <MathText text={tex(`n > ${p.incl1}`)} />。
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\textcolor{${P1}}{C_{1}} = ${p.price1} + ${p.extra}(n - ${p.incl1})\\quad (n > ${p.incl1})`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `\\textcolor{${P2}}{C_{2}} = \\begin{cases} ${p.price2}, & ${p.incl1} < n \\le ${p.incl2} \\\\ ${p.price2} + ${p.extra}(n - ${p.incl2}), & n > ${p.incl2} \\end{cases}`,
            )}
          />
        </div>
      </SolutionStep>

      <SolutionStep badge="比" badgeClass={stepStyles.badgeSolve}>
        在区间 <MathText text={tex(`${p.incl1} < n \\le ${p.incl2}`)} /> 内，令{' '}
        <MathText text={tex(`${p.price1} + ${p.extra}(n - ${p.incl1}) = ${p.price2}`)} />，解得{' '}
        <MathText text={tex(`n = ${d.nStar}`)} />。
        <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem' }}>
          <li>
            <MathText text={tex(`${p.incl1} < n < ${d.nStar}`)} />：第一种更省；
          </li>
          <li>
            <MathText text={tex(`n = ${d.nStar}`)} />：费用相同；
          </li>
          <li>
            <MathText text={tex(`${d.nStar} < n \\le ${p.incl2}`)} />：第二种更省；
          </li>
          <li>
            <MathText text={tex(`n > ${p.incl2}`)} />：两种超出单价相同，第二种始终少付{' '}
            <AnimatedNumber value={Math.abs(d.gapHigh)} /> 元，仍选第二种。
          </li>
        </ul>
      </SolutionStep>

      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          每月超过 <b>{p.incl1}</b> 次时：少于 <AnimatedNumber value={d.nStar} /> 次选第一种更省；
          从 <AnimatedNumber value={d.nStar} /> 次起（含更多）选第二种更省。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习：地铁机场线计次月票"
      subtitle="含次数内固定价 + 超出按次加价——分段比较两个一次式"
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
        两种地铁机场线计次月票：第一种售价 <b>{p.price1}</b> 元，每月包含 <b>{p.incl1}</b>{' '}
        次；第二种售价 <b>{p.price2}</b> 元，每月包含 <b>{p.incl2}</b> 次。超出包含次数后，都需另购票，票价{' '}
        <b>{p.extra}</b> 元/次。某人每月乘坐超过 <b>{p.incl1}</b> 次，他购买哪种月票比较节省费用？
      </Typography>
    </ProblemShell>
  );
}

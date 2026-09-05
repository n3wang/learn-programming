import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

const PROFIT_COLOR = '#2e7d32';
const LOSS_COLOR = '#c62828';
const COST_COLOR = '#1565c0';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题目：进价 60 元；盈利 25%；亏损 10%。 */
function bookProblem() {
  return { cost: 60, gainPct: 25, lossPct: 10 };
}

function generate() {
  // Keep profit/loss amounts as integers.
  const gainPct = pickOne([10, 20, 25, 50]);
  const lossPct = pickOne([10, 20, 25]);
  let cost;
  do {
    cost = randInt(4, 24) * 5;
  } while ((cost * gainPct) % 100 !== 0 || (cost * lossPct) % 100 !== 0);
  return { cost, gainPct, lossPct };
}

function derive(p) {
  const gainAmount = (p.cost * p.gainPct) / 100;
  const gainSell = p.cost + gainAmount;
  const lossAmount = (p.cost * p.lossPct) / 100;
  const lossSell = p.cost - lossAmount;
  return { gainAmount, gainSell, lossAmount, lossSell };
}

export default function CostPriceProfitSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <div className={stepStyles.legend}>
        <span>
          <span className={stepStyles.swatch} style={{ background: COST_COLOR }} />
          进价
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: PROFIT_COLOR }} />
          盈利
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: LOSS_COLOR }} />
          亏损
        </span>
      </div>

      <SolutionStep badge="知" badgeClass={stepStyles.badgeSet}>
        一件商品进价 <MathText text={tex(`\\textcolor{${COST_COLOR}}{${p.cost}}`)} /> 元。
        记住：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\text{利润} = \\text{进价}\\times\\text{利润率},\\quad \\text{售价} = \\text{进价} + \\text{利润}`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `\\text{亏损额} = \\text{进价}\\times\\text{亏损率},\\quad \\text{售价} = \\text{进价} - \\text{亏损额}`,
            )}
          />
        </div>
      </SolutionStep>

      <SolutionStep badge="(a)" badgeClass={stepStyles.badgeList}>
        盈利 <b>{p.gainPct}%</b>：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\text{利润} = ${p.cost}\\times ${p.gainPct}\\% = ${p.cost}\\times \\dfrac{${p.gainPct}}{100} = \\textcolor{${PROFIT_COLOR}}{${d.gainAmount}}\\text{（元）}`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `\\text{售价} = ${p.cost} + ${d.gainAmount} = \\textcolor{${PROFIT_COLOR}}{${d.gainSell}}\\text{（元）}`,
            )}
          />
        </div>
        也可以写成 <MathText text={tex(`\\text{售价} = ${p.cost}\\times(1+${p.gainPct}\\%) = ${d.gainSell}`)} />。
      </SolutionStep>

      <SolutionStep badge="(b)" badgeClass={stepStyles.badgeSolve}>
        亏损 <b>{p.lossPct}%</b>：这时没有盈利，利润为 <MathText text={tex('0')} />（或记作负的利润
        <MathText text={tex(`-${d.lossAmount}`)} />），亏损额是：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\text{亏损额} = ${p.cost}\\times ${p.lossPct}\\% = \\textcolor{${LOSS_COLOR}}{${d.lossAmount}}\\text{（元）}`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `\\text{售价} = ${p.cost} - ${d.lossAmount} = \\textcolor{${LOSS_COLOR}}{${d.lossSell}}\\text{（元）}`,
            )}
          />
        </div>
      </SolutionStep>

      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          (a) 利润 <AnimatedNumber value={d.gainAmount} /> 元，售价{' '}
          <AnimatedNumber value={d.gainSell} /> 元；
          <br />
          (b) 利润 0 元（亏损），亏损 <AnimatedNumber value={d.lossAmount} /> 元，售价{' '}
          <AnimatedNumber value={d.lossSell} /> 元。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="进价、利润率与售价"
      subtitle="先算利润（或亏损额），再求售价——百分比永远相对进价"
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
        假设一件商品的进价是 <b>{p.cost}</b> 元。
        <br />
        (a) 如果卖出后盈利 <b>{p.gainPct}%</b>，利润是多少？售价是多少？
        <br />
        (b) 如果卖出后亏损 <b>{p.lossPct}%</b>，利润是多少？亏损是多少元？售价是多少？
      </Typography>
    </ProblemShell>
  );
}

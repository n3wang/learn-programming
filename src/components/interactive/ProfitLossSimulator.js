import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField, choiceField } from '@site/src/components/interactive/shell/practiceFields';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Same sell price S for both items; one gains pct%, one loses pct%.
 * Built so cost1, cost2, and S are all integers.
 */
function generate() {
  const pct = pickOne([10, 20, 25]);
  let cost1;
  let S;
  let cost2;
  do {
    cost1 = randInt(4, 40) * 5;
    S = (cost1 * (100 + pct)) / 100;
    cost2 = (cost1 * (100 + pct)) / (100 - pct);
  } while (!Number.isInteger(S) || !Number.isInteger(cost2));
  return { S, pct, cost1, cost2 };
}

/** 人教版原题：每件 120 元，一件盈利 25%，一件亏损 25%。 */
function bookProblem() {
  const pct = 25;
  const S = 120;
  const cost1 = 96;
  const cost2 = 160;
  return { S, pct, cost1, cost2 };
}

export default function ProfitLossSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([
    choiceField("pl", "总的是盈利还是亏损？", ["盈利", "亏损", "不盈不亏"], 2 * p.S > p.cost1 + p.cost2 ? "盈利" : 2 * p.S < p.cost1 + p.cost2 ? "亏损" : "不盈不亏"),
    numberField("amt", "盈亏的钱数（元）", Math.abs(2 * p.S - p.cost1 - p.cost2), "\\text{金额}"),
  ]);

  const { totalCost, totalSell, diff } = useMemo(() => {
    const tCost = p.cost1 + p.cost2;
    const tSell = 2 * p.S;
    return { totalCost: tCost, totalSell: tSell, diff: tSell - tCost };
  }, [p]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const loadBook = () => {
    setP(bookProblem());
    setKey((k) => k + 1);
  };

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '盈利'], [RED, '亏损']]}>
      <Step b="知" kind="set">
        盈亏要和<b>进价</b>比，不能只看售价。两件售价相同，但进价不同，要分别求：
        <EqBox lines={['\\text{售价} = \\text{进价} \\times (1 \\pm \\text{盈亏率})']} />
      </Step>
      <Step b="1" kind="list">
        盈利 {p.pct}% 的那件，设进价 <M t="x" /> 元：
        <EqBox
          lines={[`x(1 + ${c(BLUE, `${p.pct}\\%`)}) = ${c(BLUE, p.S)}, \\qquad x = ${p.S} \\div ${(100 + p.pct) / 100} = ${p.cost1}`]}
        />
        这件赚了 <M t={c(GREEN, `${p.S} - ${p.cost1} = ${p.S - p.cost1}`)} /> 元。
      </Step>
      <Step b="2" kind="list">
        亏损 {p.pct}% 的那件，设进价 <M t="y" /> 元：
        <EqBox
          lines={[`y(1 - ${c(BLUE, `${p.pct}\\%`)}) = ${c(BLUE, p.S)}, \\qquad y = ${p.S} \\div ${(100 - p.pct) / 100} = ${p.cost2}`]}
        />
        这件亏了 <M t={c(RED, `${p.cost2} - ${p.S} = ${p.cost2 - p.S}`)} /> 元。
      </Step>
      <Step b="合" kind="solve">
        <EqBox
          lines={[
            `\\text{总售价} - \\text{总进价} = ${totalSell} - (${p.cost1} + ${p.cost2}) = ${c(diff >= 0 ? GREEN : RED, diff)}`,
          ]}
        />
        亏损那件的进价更高，同样是 {p.pct}%，亏的钱比赚的钱多{diff < 0 ? '，所以总的是亏损。' : '。'}
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {diff > 0 ? `总的盈利 ${diff} 元。` : diff < 0 ? `总的亏损 ${-diff} 元。` : '不盈不亏。'}
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="销售中的盈亏"
      subtitle="两件衣服都按同一价格卖出，一件盈利、一件亏损，同样的百分比——总的是赚还是亏？"
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={solution}
    >
      <Typography>
        一商店以每件 <b>{p.S}</b> 元的价格卖出两件衣服，其中一件盈利 <b>{p.pct}%</b>，另一件
        亏损 <b>{p.pct}%</b>，卖这两件衣服总的是盈利还是亏损，或是不盈不亏？
      </Typography>
    </ProblemShell>
  );
}

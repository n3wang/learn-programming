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
 * Football: win=3, draw=1, loss=0. Team undefeated (losses = 0).
 * (1) Given games G and points P, find wins & draws.
 * (2) Can win-points equal draw-points?
 */

const WORDINGS = [
  (p) =>
    `在足球联赛中，胜一场得 ${p.winPts} 分，平一场得 ${p.drawPts} 分，负一场得 0 分．某队 ${p.G} 场比赛保持不败．` +
    `（1）如果这支球队 ${p.G} 场比赛得到的积分是 ${p.points} 分，你能算出这 ${p.G} 场比赛中的胜场数和平场数吗？` +
    `（2）这支球队 ${p.G} 场比赛的胜场总积分能等于它的平场总积分吗？`,
  (p) =>
    `足球赛：胜一场 ${p.winPts} 分、平一场 ${p.drawPts} 分、负一场 0 分．一支球队打了 ${p.G} 场且一场未负，共得 ${p.points} 分．` +
    `（1）胜场、平场各几场？（2）胜场得分总和有没有可能等于平场得分总和？`,
  (p) =>
    `某队 ${p.G} 场足球比赛不败（无负场），积分 ${p.points}．规则：胜 ${p.winPts} 分、平 ${p.drawPts} 分、负 0 分．` +
    `（1）求胜场数与平场数；（2）判断“胜场总积分 = 平场总积分”是否可能．`,
];

function bookProblem() {
  const winPts = 3;
  const drawPts = 1;
  const G = 9;
  const wins = 6;
  const draws = 3;
  const points = winPts * wins + drawPts * draws;
  const text = WORDINGS[0]({ winPts, drawPts, G, points });
  return { winPts, drawPts, G, wins, draws, points, text };
}

function generate() {
  const winPts = 3;
  const drawPts = 1;
  const wins = randInt(3, 8);
  const draws = randInt(1, 6);
  const G = wins + draws;
  const points = winPts * wins + drawPts * draws;
  const text = pickOne(WORDINGS)({ winPts, drawPts, G, points });
  return { winPts, drawPts, G, wins, draws, points, text };
}

export default function FootballUndefeatedSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([
    numberField("w", "（1）胜场数", p.wins),
    numberField("d", "平场数", p.draws),
    choiceField("eq", "（2）胜场总积分能等于平场总积分吗？", ["能", "不能"], (p.drawPts * p.G) % (p.winPts + p.drawPts) === 0 ? "能" : "不能"),
  ]);

  const derived = useMemo(() => {
    //  winPts·w + drawPts·(G−w) = points  →  w = (points − drawPts·G) / (winPts − drawPts)
    const w =
      (p.points - p.drawPts * p.G) / (p.winPts - p.drawPts);
    const d = p.G - w;
    // win points = draw points: winPts·m = drawPts·(G−m) → m = drawPts·G / (winPts+drawPts)
    const mEqual = (p.drawPts * p.G) / (p.winPts + p.drawPts);
    const equalPossible =
      Number.isInteger(mEqual) && mEqual >= 0 && mEqual <= p.G;
    return { w, d, mEqual, equalPossible };
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
    <Solution legend={[[BLUE, '已知'], [GREEN, '所求']]}>
      <Step b="知" kind="set">
        胜一场得 {p.winPts} 分，平一场得 {p.drawPts} 分，负一场 0 分。<b>不败</b>：负 0 场，{p.G} 场全是胜或平。
      </Step>
      <Step b="设" kind="set">
        设胜 <M t="w" /> 场，则平 <M t={`${p.G} - w`} /> 场。
      </Step>
      <Step b="(1)" kind="list">
        胜场得分 + 平场得分 = 总积分：
        <EqBox
          lines={[
            `${c(BLUE, p.winPts)}w + ${c(BLUE, p.drawPts)}(${p.G} - w) = ${c(BLUE, p.points)}`,
            `${p.winPts - p.drawPts}w = ${p.points} - ${p.drawPts * p.G} = ${p.points - p.drawPts * p.G}`,
            `w = ${c(GREEN, derived.w)}, \\qquad \\text{平} = ${p.G} - ${derived.w} = ${c(GREEN, derived.d)}`,
          ]}
        />
      </Step>
      <Step b="(2)" kind="solve">
        假设胜 <M t="m" /> 场时，胜场总积分 = 平场总积分：
        <EqBox
          lines={[
            `${p.winPts}m = ${p.drawPts}(${p.G} - m)`,
            `${p.winPts + p.drawPts}m = ${p.drawPts * p.G}, \\qquad m = \\dfrac{${p.drawPts * p.G}}{${p.winPts + p.drawPts}}${
              derived.equalPossible ? ` = ${c(GREEN, derived.mEqual)}` : ` \\approx ${Number(derived.mEqual.toFixed(2))}`
            }`,
          ]}
        />
        {derived.equalPossible
          ? `m 是整数，可能：胜 ${derived.mEqual} 场、平 ${p.G - derived.mEqual} 场时两者相等。`
          : '场数必须是整数，m 不是整数，所以不可能。'}
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          (1) 胜 {derived.w} 场，平 {derived.d} 场；(2) {derived.equalPossible ? '能' : '不能'}。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="足球不败：胜平积分"
      subtitle="场次与积分随机生成；保持不败（负场为 0）"
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={solution}
    >
      <Typography>{p.text}</Typography>
    </ProblemShell>
  );
}

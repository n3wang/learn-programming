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
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const NAME_POOL = ['前进', '东方', '光明', '蓝天', '雄鹰', '远大', '卫星', '钢铁'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 负一场固定积 1 分，胜一场积分和总场次随机生成。 */
function generate() {
  const G = randInt(8, 24);
  const W = randInt(2, 5);
  const L = 1;
  const names = shuffle(NAME_POOL).slice(0, 4);
  const wins = [0, randInt(1, G - 1), randInt(1, G - 1), G];
  const teams = names.map((name, i) => {
    const w = wins[i];
    const losses = G - w;
    return { name, wins: w, losses, points: w * W + losses * L };
  });
  return { G, W, L, teams };
}

/** 人教版表 5.3-1：胜一场 2 分，负一场 1 分，共 14 场。 */
function bookProblem() {
  const G = 14;
  const W = 2;
  const L = 1;
  const rows = [
    ['前进', 10],
    ['东方', 10],
    ['光明', 9],
    ['蓝天', 9],
    ['雄鹰', 7],
    ['远大', 7],
    ['卫星', 4],
    ['钢铁', 0],
  ];
  const teams = rows.map(([name, wins]) => {
    const losses = G - wins;
    return { name, wins, losses, points: wins * W + losses * L };
  });
  return { G, W, L, teams };
}

export default function LeagueStandingsSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([
    numberField("W", "（1）胜一场积分", p.W, "W"),
    numberField("L", "负一场积分", p.L, "L"),
    choiceField("eq", "（3）胜场总积分能等于负场总积分吗？", ["能", "不能"], (p.G * p.L) % (p.W + p.L) === 0 ? "能" : "不能"),
  ]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const loadBook = () => {
    setP(bookProblem());
    setKey((k) => k + 1);
  };

  const derived = useMemo(() => {
    const zeroRow = p.teams.find((t) => t.wins === 0);
    const otherRow = p.teams.find((t) => t.wins > 0);
    const solvedL = zeroRow.points / zeroRow.losses;
    const solvedW = (otherRow.points - otherRow.losses * solvedL) / otherRow.wins;
    const m = (p.G * solvedL) / (solvedW + solvedL);
    const mIsValid = Number.isInteger(m) && m >= 0 && m <= p.G;
    return { zeroRow, otherRow, solvedL, solvedW, m, mIsValid };
  }, [p]);

  const { zeroRow, otherRow, solvedL, solvedW } = derived;
  const solution = (
    <Solution legend={[[BLUE, '表中数据'], [ORANGE, '先求出的量'], [GREEN, '所求']]}>
      <Step b="(1)" kind="list">
        先找<b>一场没胜</b>的队：{zeroRow.name} 队 0 胜 {zeroRow.losses} 负，积 {zeroRow.points} 分，所以
        <EqBox lines={[`\\text{负一场积分} = ${c(BLUE, zeroRow.points)} \\div ${c(BLUE, zeroRow.losses)} = ${c(ORANGE, solvedL)}`]} />
        再看 {otherRow.name} 队（{otherRow.wins} 胜 {otherRow.losses} 负，积 {otherRow.points} 分），设胜一场积 <M t="x" /> 分：
        <EqBox
          lines={[
            `${otherRow.wins}x + ${otherRow.losses}\\times ${c(ORANGE, solvedL)} = ${otherRow.points}`,
            `x = (${otherRow.points} - ${otherRow.losses * solvedL}) \\div ${otherRow.wins} = ${c(GREEN, solvedW)}`,
          ]}
        />
      </Step>
      <Step b="(2)" kind="list">
        胜 <M t="m" /> 场，则负 <M t={`${p.G} - m`} /> 场：
        <EqBox
          lines={[`\\text{总积分} = ${solvedW}m + ${solvedL}(${p.G} - m) = ${solvedW - solvedL}m + ${p.G * solvedL}`]}
        />
      </Step>
      <Step b="(3)" kind="solve">
        胜场总积分 = 负场总积分：
        <EqBox
          lines={[
            `${solvedW}m = ${solvedL}(${p.G} - m)`,
            `m = \\dfrac{${solvedL * p.G}}{${solvedW + solvedL}}${derived.mIsValid ? ` = ${derived.m}` : ` \\approx ${derived.m.toFixed(2)}`}`,
          ]}
        />
        {derived.mIsValid
          ? `m 是 0～${p.G} 之间的整数，所以能：胜 ${derived.m} 场、负 ${p.G - derived.m} 场时正好相等。`
          : '胜场数必须是整数，m 不是整数，所以不能。'}
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          (1) 胜一场积 {solvedW} 分，负一场积 {solvedL} 分；(2) 总积分 = {solvedW - solvedL}m + {p.G * solvedL}；(3){' '}
          {derived.mIsValid ? '能' : '不能'}。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="球赛积分表问题"
      subtitle="胜一场的分值、总场次、每队的胜负记录都会重新生成"
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={solution}
    >
      <Box>
        <Typography sx={{ mb: 1.5 }}>
          下表是某次篮球联赛的积分情况，每队共赛 <b>{p.G}</b> 场。(1) 胜一场和负一场各积多少
          分？(2) 用代数式表示一支球队的总积分与胜、负场数之间的关系。(3) 某队的胜场总积分能
          等于它的负场总积分吗？
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>队名</TableCell>
              <TableCell align="right">比赛场次</TableCell>
              <TableCell align="right">胜场</TableCell>
              <TableCell align="right">负场</TableCell>
              <TableCell align="right">积分</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {p.teams.map((t) => (
              <TableRow key={t.name}>
                <TableCell>{t.name}</TableCell>
                <TableCell align="right">{p.G}</TableCell>
                <TableCell align="right">{t.wins}</TableCell>
                <TableCell align="right">{t.losses}</TableCell>
                <TableCell align="right">{t.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </ProblemShell>
  );
}

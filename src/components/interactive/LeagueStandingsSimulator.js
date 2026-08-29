import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
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
  const [p, setP] = useState(bookProblem);

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

  const solution = (
    <Box>
      <Typography sx={{ mb: 1 }}>
        <b>(1)</b> {derived.zeroRow.name} 队 {derived.zeroRow.wins} 胜 {derived.zeroRow.losses} 负，
        积 {derived.zeroRow.points} 分，说明负一场积{' '}
        <AnimatedNumber value={derived.solvedL} /> 分。
        再看 {derived.otherRow.name} 队：{derived.otherRow.wins} 胜{' '}
        {derived.otherRow.losses} 负，积 {derived.otherRow.points} 分，列方程{' '}
        {derived.otherRow.wins}x + {derived.otherRow.losses} × {derived.solvedL} ={' '}
        {derived.otherRow.points}，解得胜一场积 <AnimatedNumber value={derived.solvedW} /> 分。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        <b>(2)</b> 若一支球队胜 <b>m</b> 场，则负 ({p.G} − m) 场，总积分 = m ×{' '}
        <AnimatedNumber value={derived.solvedW} /> + ({p.G} − m) × <AnimatedNumber value={derived.solvedL} />{' '}
        = m × <AnimatedNumber value={derived.solvedW - derived.solvedL} /> + <AnimatedNumber value={p.G * derived.solvedL} />。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        <b>(3)</b> 胜场总积分等于负场总积分，即 m × {derived.solvedW} = ({p.G} − m) ×{' '}
        {derived.solvedL}，解得 m = <AnimatedNumber value={derived.m} decimals={2} />。
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {derived.mIsValid
          ? `m 是整数且在 0～${p.G} 之间 —— 存在这样的球队：胜 ${derived.m} 场、负 ${p.G - derived.m} 场时，胜场总积分正好等于负场总积分。`
          : `m 必须是整数（场次不能是分数），但方程解出 m = ${derived.m.toFixed(2)} 不是整数，所以没有哪支球队的胜场总积分能等于它的负场总积分。`}
      </Typography>
    </Box>
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

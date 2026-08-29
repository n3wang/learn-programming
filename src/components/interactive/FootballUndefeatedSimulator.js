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
  const [p, setP] = useState(bookProblem);

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
    <Box>
      <Typography sx={{ mb: 1 }}>
        不败 ⇒ 负场 = 0，设胜 <b>w</b> 场，则平 <b>{p.G} − w</b> 场。
      </Typography>
      <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
        {p.winPts}w + {p.drawPts}({p.G} − w) = {p.points}
      </Typography>
      <Typography sx={{ mb: 1.5 }}>
        解得 w = <AnimatedNumber value={derived.w} />，平场 ={' '}
        <AnimatedNumber value={derived.d} />。
      </Typography>

      <Table size="small" sx={{ mb: 2, maxWidth: 420 }}>
        <TableHead>
          <TableRow>
            <TableCell>结果</TableCell>
            <TableCell align="right">场数</TableCell>
            <TableCell align="right">每场得分</TableCell>
            <TableCell align="right">小计</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>胜</TableCell>
            <TableCell align="right">{derived.w}</TableCell>
            <TableCell align="right">{p.winPts}</TableCell>
            <TableCell align="right">{derived.w * p.winPts}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>平</TableCell>
            <TableCell align="right">{derived.d}</TableCell>
            <TableCell align="right">{p.drawPts}</TableCell>
            <TableCell align="right">{derived.d * p.drawPts}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>负</TableCell>
            <TableCell align="right">0</TableCell>
            <TableCell align="right">0</TableCell>
            <TableCell align="right">0</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>合计</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {p.G}
            </TableCell>
            <TableCell />
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {p.points}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Typography sx={{ mb: 1 }}>
        <b>（2）</b> 设胜场总积分等于平场总积分：
      </Typography>
      <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
        {p.winPts}m = {p.drawPts}({p.G} − m) ⇒ m = {derived.mEqual.toFixed(2)}
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {derived.equalPossible
          ? `m = ${derived.mEqual} 是整数，可能：胜 ${derived.mEqual} 场、平 ${p.G - derived.mEqual} 场时，胜场总积分 = 平场总积分 = ${derived.mEqual * p.winPts}。`
          : `m 必须是整数场次，但解出 m = ${derived.mEqual.toFixed(2)} 不是整数，所以不可能。`}
      </Typography>
    </Box>
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

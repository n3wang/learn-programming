import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import Box from '@site/src/components/ui/Box';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：往返 80、单程 45；20 人共 1180 → 往返 8、单程 12。 */
function bookProblem() {
  return { round: 80, one: 45, people: 20, total: 1180, x: 8, y: 12 };
}

function generate() {
  const round = randInt(6, 12) * 10;
  const one = randInt(3, 6) * 10 + 5;
  const x = randInt(4, 12);
  const y = randInt(4, 14);
  return {
    round,
    one,
    people: x + y,
    total: round * x + one * y,
    x,
    y,
  };
}

export default function CableTicketTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="缆车：往返票与单程票"
      subtitle="人数方程 + 金额方程（表中票价）"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <>
          <Typography sx={{ mb: 1.25 }}>
            七年级地质兴趣小组到山顶做田野调查。上山前 <b>{p.people}</b> 名成员各买了一张缆车票，共花费{' '}
            <b>{p.total}</b> 元。票价如下，他们购买了往返票和单程票各多少张？
          </Typography>
          <Box sx={{ overflowX: 'auto', maxWidth: 280 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>票种</TableCell>
                  <TableCell align="right">票价 / 元</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>往返</TableCell>
                  <TableCell align="right">{p.round}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>单程</TableCell>
                  <TableCell align="right">{p.one}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </>
      )}
      renderSolution={(p, s) => (
        <TwoVarSolution
          legendX="往返票张数"
          legendY="单程票张数"
          setText={
            <>
              设往返票 <MathText text={texX()} /> 张，单程票 <MathText text={texY()} /> 张。
            </>
          }
          eq1={`x + y = ${p.people}`}
          eq2={`${p.round}x + ${p.one}y = ${p.total}`}
          solveText={
            <>
              由第一个方程得 <MathText text={texEq(`y = ${p.people} - x`)} />，代入第二个方程。
            </>
          }
          x={s.x}
          y={s.y}
          answer={
            <>
              往返票 <AnimatedNumber value={s.x} /> 张，单程票 <AnimatedNumber value={s.y} /> 张。
            </>
          }
          check={
            <MathText
              text={`验算：${texEq(`${s.x}+${s.y}=${p.people}`)}；${texEq(
                `${p.round}\\times ${s.x}+${p.one}\\times ${s.y}=${p.total}`,
              )} ✓`}
            />
          }
        />
      )}
    />
  );
}

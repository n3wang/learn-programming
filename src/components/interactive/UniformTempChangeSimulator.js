import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import Box from '@site/src/components/ui/Box';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 7：每 5 min 升 15°C，即 3°C/min；T=10+3t。 */
function bookProblem() {
  return {
    step: 5,
    startTemp: 10,
    delta: 15,
    askTime: 21,
    askTemp: 34,
  };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const step = pickOne([5, 10]);
    const startTemp = pickOne([0, 5, 10, 20]);
    const delta = pickOne([10, 15, 20]);
    const rate = delta / step;
    if (!Number.isInteger(rate) && Math.abs(rate * 2 - Math.round(rate * 2)) > 1e-9) continue;
    const askTime = step * randInt(2, 5) + randInt(1, step - 1);
    const askTemp = startTemp + rate * randInt(1, 8);
    if (askTemp === startTemp) continue;
    return { step, startTemp, delta, askTime, askTemp };
  }
  return bookProblem();
}

function derive(p) {
  const rate = p.delta / p.step;
  const tempAtAsk = p.startTemp + rate * p.askTime;
  const timeAtAsk = (p.askTemp - p.startTemp) / rate;
  const times = [0, 1, 2, 3, 4, 5].map((i) => i * p.step);
  const temps = times.map((t) => p.startTemp + rate * t);
  return { rate, tempAtAsk, timeAtAsk, times, temps };
}

export default function UniformTempChangeSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="模" badgeClass={stepStyles.badgeSet}>
        温度均匀变化，设 <MathText text={tex('t')} /> 分钟时温度为{' '}
        <MathText text={tex('T')} /> ℃。由表得每分钟升高{' '}
        <MathText text={tex(`${p.delta}\\div ${p.step} = ${d.rate}`)} /> ℃，故
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`T = ${p.startTemp} + ${d.rate}t`)} />
        </div>
      </SolutionStep>
      <SolutionStep badge="(1)" badgeClass={stepStyles.badgeList}>
        <MathText text={tex(`t = ${p.askTime}`)} /> 时，
        <MathText text={tex(`T = ${p.startTemp} + ${d.rate}\\times ${p.askTime} = ${d.tempAtAsk}`)} /> ℃。
      </SolutionStep>
      <SolutionStep badge="(2)" badgeClass={stepStyles.badgeSolve}>
        令 <MathText text={tex(`T = ${p.askTemp}`)} />：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `${p.startTemp} + ${d.rate}t = ${p.askTemp} \\Rightarrow t = ${d.timeAtAsk}`,
            )}
          />
        </div>
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          （1）<AnimatedNumber value={d.tempAtAsk} /> ℃； （2）
          <AnimatedNumber value={d.timeAtAsk} /> min。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="均匀变化：时间与温度"
      subtitle="先从表中读出变化率，再写成一次函数求值 / 反求"
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
      <Typography sx={{ mb: 1.5 }}>
        下表记录了一次实验中时间和温度的数据，假设温度的变化是均匀的。
      </Typography>
      <Box sx={{ overflowX: 'auto', mb: 1.5 }}>
        <Table sx={{ minWidth: 360 }}>
          <TableHead>
            <TableRow>
              <TableCell>时间 / min</TableCell>
              {d.times.map((t) => (
                <TableCell key={t} align="right">
                  {t}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>温度 / ℃</TableCell>
              {d.temps.map((temp, i) => (
                <TableCell key={i} align="right">
                  {temp}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Box>
      <Typography>
        （1）实验进行 <b>{p.askTime}</b> min 时的温度是多少？
        <br />
        （2）实验进行多长时间的温度是 <b>{p.askTemp}</b> ℃？
      </Typography>
    </ProblemShell>
  );
}

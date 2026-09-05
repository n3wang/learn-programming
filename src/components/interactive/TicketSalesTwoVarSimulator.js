import React from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 影院包场：成人票 / 学生票 — 总张数 + 总收入。
 * 书题目：x+y=30, 50x+30y=1140 → x=12, y=18。
 */
function bookProblem() {
  const priceA = 50;
  const priceB = 30;
  const x = 12;
  const y = 18;
  return {
    priceA,
    priceB,
    x,
    y,
    total: x + y,
    cost: priceA * x + priceB * y,
  };
}

function generate() {
  const priceA = randInt(4, 8) * 10;
  const priceB = randInt(2, 5) * 10;
  const x = randInt(8, 25);
  const y = randInt(8, 25);
  return {
    priceA,
    priceB,
    x,
    y,
    total: x + y,
    cost: priceA * x + priceB * y,
  };
}

export default function TicketSalesTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="影院包场：成人票与学生票"
      subtitle="「总张数」和「总收入」——最常见的二元一次应用题骨架"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          电影院为学校包场，一共售出了 <b>{p.total}</b> 张成人票和学生票。每张成人票{' '}
          <b>{p.priceA}</b> 元，每张学生票 <b>{p.priceB}</b> 元。总收入为{' '}
          <b>{p.cost.toLocaleString('zh-CN')}</b> 元。
          <br />
          成人票和学生票各售出了多少张？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <Box>
          <Typography sx={{ mb: 1 }}>
            设成人票售出 <b>x</b> 张，学生票售出 <b>y</b> 张：
          </Typography>
          <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
            {`{ x + y = ${p.total}`}
            <br />
            {`  ${p.priceA}x + ${p.priceB}y = ${p.cost} }`}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            由第一个方程得 y = {p.total} − x，代入第二个方程：
            <br />
            <span style={{ fontFamily: 'monospace' }}>
              {p.priceA}x + {p.priceB}({p.total} − x) = {p.cost}
            </span>
            <br />
            解得 x = <AnimatedNumber value={s.x} />，进而 y = <AnimatedNumber value={s.y} />。
          </Typography>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            答：成人票 <AnimatedNumber value={s.x} /> 张，学生票 <AnimatedNumber value={s.y} />{' '}
            张。
          </Typography>
          <Typography variant="caption" color="text.secondary">
            验算：{s.x} + {s.y} = {p.total}；收入 {p.priceA}×{s.x} + {p.priceB}×{s.y} = {p.cost} ✓
          </Typography>
        </Box>
      )}
    />
  );
}

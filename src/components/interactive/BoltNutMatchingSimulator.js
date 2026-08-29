import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Generates a random-but-solvable "配套问题" (matching-quota problem):
 * T workers, each can make B bolts/day or N nuts/day, and each bolt needs
 * r nuts. B and N are built from the (hidden) true split x/y so that
 * N·(T−x) = r·B·x always has an exact integer solution.
 */
function generate() {
  const x = randInt(4, 12);
  const y = randInt(4, 12);
  const r = randInt(2, 4);
  const m = randInt(5, 15) * 10;
  const B = y * m;
  const N = r * m * x;
  return { r, B, N, T: x + y };
}

export default function BoltNutMatchingSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(generate);

  const solvedX = useMemo(() => Math.round((p.N * p.T) / (p.N + p.r * p.B)), [p]);
  const solvedY = p.T - solvedX;
  const boltsMade = p.B * solvedX;
  const nutsMade = p.N * solvedY;

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const solution = (
    <Box>
      <Typography sx={{ mb: 1 }}>
        设应安排 <b>x</b> 名工人生产螺栓，则 (<b>{p.T}</b> − x) 名工人生产螺母。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        每天生产的螺母数量应是螺栓数量的 {p.r} 倍，列得方程：
      </Typography>
      <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
        {p.N} × ({p.T} − x) = {p.r} × {p.B} × x
      </Typography>
      <Typography sx={{ mb: 1 }}>
        解得 x = <AnimatedNumber value={solvedX} />，进而 {p.T} − x ={' '}
        <AnimatedNumber value={solvedY} />。
      </Typography>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>
        答：应安排 <AnimatedNumber value={solvedX} /> 名工人生产螺栓，
        <AnimatedNumber value={solvedY} /> 名工人生产螺母。
      </Typography>
      <Typography variant="caption" color="text.secondary">
        验算：{p.B} × {solvedX} = <AnimatedNumber value={boltsMade} /> 个螺栓，需配{' '}
        {p.r} × <AnimatedNumber value={boltsMade} /> ={' '}
        <AnimatedNumber value={p.r * boltsMade} /> 个螺母；{p.N} × {solvedY} ={' '}
        <AnimatedNumber value={nutsMade} /> 个螺母，两者相等 ✓
      </Typography>
    </Box>
  );

  return (
    <ProblemShell
      title="配套问题：螺栓与螺母"
      subtitle="每人每天的产量和工人总数每次都随机生成——自己先列方程，再点开解答核对"
      problemKey={key}
      onRandomize={randomize}
      solution={solution}
    >
      <Typography>
        某车间共有 <b>{p.T}</b> 名工人，每人每天可以生产 <b>{p.B}</b> 个螺栓，或者{' '}
        <b>{p.N}</b> 个螺母。1 个螺栓需要配 <b>{p.r}</b> 个螺母。为使每天生产的螺栓和
        螺母刚好配套，应安排生产螺栓和螺母的工人各多少名？
      </Typography>
    </ProblemShell>
  );
}

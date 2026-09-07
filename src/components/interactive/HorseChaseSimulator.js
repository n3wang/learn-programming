import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 8（朱世杰）：良马 240 里/日，驽马 150 里/日，驽马先走 12 日 → 20 日追上。 */
function bookProblem() {
  return { fast: 240, slow: 150, headStart: 12 };
}

function generate() {
  const gap = pickOne([30, 40, 60, 90]);
  const days = pickOne([8, 10, 12, 15, 20]);
  const slow = pickOne([120, 150, 180]);
  const fast = slow + gap;
  const headStart = (gap * days) / slow;
  if (!Number.isInteger(headStart) || headStart <= 0) return bookProblem();
  return { fast, slow, headStart };
}

function derive(p) {
  const lead = p.slow * p.headStart;
  const days = lead / (p.fast - p.slow);
  return { lead, days };
}

export default function HorseChaseSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设快马 <MathText text={tex('x')} /> 天追上慢马。慢马先走的路程是{' '}
        <MathText text={tex(`${p.slow}\\times ${p.headStart}=${d.lead}`)} /> 里。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        追上时快马多走的路程等于这段领先路程：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${p.fast}x=${p.slow}(x+${p.headStart})`)} />
        </div>
        或 <MathText text={tex(`(${p.fast}-${p.slow})x=${d.lead}`)} />。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        <MathText text={tex(`${p.fast - p.slow}x=${d.lead}`)} />
        ，解得 <MathText text={tex(`x=${d.days}`)} />。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          快马 <AnimatedNumber value={d.days} /> 天可以追上慢马。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="8 良马追驽马"
      subtitle="追上时，快马路程 = 慢马路程；先走的天数要算进慢马的总时间"
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
        跑得快的马每天走 <b>{p.fast}</b> 里，跑得慢的马每天走 <b>{p.slow}</b> 里。慢马先走{' '}
        <b>{p.headStart}</b> 天，快马几天可以追上慢马？
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        书题目选自元代朱世杰《算学启蒙》（1299）：「今有良马日行二百四十里，驽马日行一百五十里。驽马先行一十二日，问良马几何日追及之。」
      </Typography>
    </ProblemShell>
  );
}

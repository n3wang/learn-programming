import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const TIERS = [
  { fare: 3, text: '0 < x ≤ 6' },
  { fare: 4, text: '6 < x ≤ 12' },
  { fare: 5, text: '12 < x ≤ 22' },
  { fare: 6, text: '22 < x ≤ 32' },
];

function rangeFor(fare) {
  if (fare <= 6) return TIERS.find((row) => row.fare === fare);
  const extra = fare - 6;
  const low = 32 + (extra - 1) * 20;
  const high = 32 + extra * 20;
  return { fare, text: `${low} < x ≤ ${high}` };
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function SubwayMileageRangeSimulator() {
  const [key, setKey] = useState(0);
  const [fare, setFare] = useState(8);
  const [picked, setPicked] = useState(null);
  const answer = rangeFor(fare).text;
  const options = [4, 5, 6, 7, 8, 9].map((n) => rangeFor(n).text);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="表" badgeClass={stepStyles.badgeSet}>
        32 km 以内最高票价是 6 元。超过 32 km 后，每增加 1 元，里程再增加 20 km，上端包含、下端不包含。
      </SolutionStep>
      <SolutionStep badge="8" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          票价 {fare} 元对应 {answer}。8 元比 6 元多 2 元，每元 20 km，所以 52 &lt; x ≤ 72。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="地铁票价 8 元时，里程满足什么不等式？"
      subtitle="先对上分段，超过 32 km 后每 1 元增加 20 km"
      problemKey={key}
      onRandomize={() => {
        setFare(randInt(4, 9));
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setFare(8);
        setPicked(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        收费标准：不超过 6 km 为 3 元；超过 6 km 到 12 km（含）为 4 元；超过 12 km 到 22 km（含）为 5 元；超过 22 km 到 32 km（含）为 6 元；超过 32 km 的部分，每增加 1 元可再乘坐 20 km。
      </p>
      <p>单次购票花费 {fare} 元。选出里程 x km 的范围。</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((choice) => (
          <button key={choice} type="button" style={chip} onClick={() => setPicked(choice)}>
            {choice}
          </button>
        ))}
      </div>
      {picked ? <p>{picked === answer ? '对。上端含，下端不含。' : '再数一数从 6 元、32 km 起，多付了几元。'}</p> : null}
    </ProblemShell>
  );
}
